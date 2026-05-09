package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"

	"piggy.com/internal/db/repo"
	"piggy.com/internal/handlers"
	"piggy.com/internal/middleware"
	"piggy.com/internal/piggyservice"
)

func main() {
	// Load .env file for local development (ignored on Railway)
	_ = godotenv.Load()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	route := gin.Default()

	// ========== HEALTH CHECK ENDPOINTS ==========
	
	// Root endpoint for Railway health check
	route.GET("/", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"message":   "Piggy API is running",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// API health check
	route.GET("/api/v1/healthcheck", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"message":   "Piggy API is running",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// DATABASE CONNECTION 
	
	dbURL := getDatabaseURL()
	fmt.Printf("Database URL: %s\n", maskURL(dbURL))

	// Get frontend URL
	frontendURL := getFrontendURL()
	fmt.Printf("Frontend URL: %s\n", frontendURL)

	// Configure CORS
	route.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			frontendURL,
			"http://localhost:3000",
			"http://localhost:3001",
			"https://react-tutorial-c5-production.up.railway.app/",
			"https://react-tutorial-c5-production.up.railway.app/",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Connect to database with retry logic
	ctx := context.Background()
	dbPool, err := connectToDatabase(ctx, dbURL)
	if err != nil {
		fmt.Printf("Failed to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer dbPool.Close()

	fmt.Println("Database connection established!")

	// DATABASE TEST ENDPOINT 
	
	route.GET("/api/v1/db-test", func(ctx *gin.Context) {
		var result int
		err := dbPool.QueryRow(context.Background(), "SELECT 1").Scan(&result)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"database": "connected",
			"result":   result,
		})
	})

	// INITIALIZE SERVICES 
	
	repository := repo.NewRepository(dbPool)

	// Run migrations
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
	fmt.Println("Running database migrations...")
	if err := repo.MigrateUp(dbURL, "./internal/db/migrations", logger); err != nil {
		logger.Warn().Err(err).Msg("Migration warning (may already be up to date)")
	} else {
		fmt.Println("Database migrations completed!")
	}

	// Initialize service and handlers
	appService := piggyservice.NewService(repository)
	handler := handlers.NewHandler(appService)

	// API ROUTES 
	
	api := route.Group("/api/v1")

	// Public routes
	api.POST("/auth/register", handler.Register)
	api.POST("/auth/login", handler.Login)
	fmt.Println("Auth routes: POST /api/v1/auth/register, POST /api/v1/auth/login")

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/transactions", handler.CreateTransaction)
		protected.GET("/transactions", handler.GetTransactions)
		protected.GET("/account", handler.GetUserAccount)
	}
	fmt.Println("🔒 Protected routes: POST /api/v1/transactions, GET /api/v1/transactions, GET /api/v1/account")

	// ========== START SERVER ==========
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Printf("Health check: http://localhost:%s/\n", port)
	fmt.Printf("API health: http://localhost:%s/api/v1/healthcheck\n", port)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	if err := route.Run(":" + port); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		os.Exit(1)
	}
}

// HELPER FUNCTIONS 

// getDatabaseURL returns the database connection string
// Railway provides DATABASE_URL with all connection info included
func getDatabaseURL() string {
	// Check Railway's DATABASE_URL first
	dbURL := os.Getenv("DATABASE_URL")
	
	// Fallback to DB_URL
	if dbURL == "" {
		dbURL = os.Getenv("DB_URL")
	}
	
	// If neither exists, construct from individual variables (local dev)
	if dbURL == "" {
		host := getEnvOrDefault("DB_HOST", "localhost")
		port := getEnvOrDefault("DB_PORT", "5432")
		user := getEnvOrDefault("DB_USER", "postgres")
		password := getEnvOrDefault("DB_PASSWORD", "postgres")
		dbname := getEnvOrDefault("DB_NAME", "piggydb")
		
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			user, password, host, port, dbname)
	}
	
	// Fix Railway's postgresql:// to postgres:// if needed
	dbURL = fixDatabaseURL(dbURL)
	
	return dbURL
}

// getFrontendURL returns the frontend URL for CORS
func getFrontendURL() string {
	url := os.Getenv("FRONTEND_URL")
	if url == "" {
		url = "http://localhost:3000"
	}
	return url
}

// fixDatabaseURL ensures the URL is compatible with pgx
func fixDatabaseURL(url string) string {
	// Railway uses postgresql:// but pgx expects postgres://
	url = strings.Replace(url, "postgresql://", "postgres://", 1)
	
	// Ensure sslmode is set (Railway uses require, but disable works for internal network)
	if !strings.Contains(url, "sslmode=") {
		if strings.Contains(url, "?") {
			url += "&sslmode=disable"
		} else {
			url += "?sslmode=disable"
		}
	}
	
	// Railway databases on internal network don't need SSL
	// If your database is external, you may need sslmode=require
	if strings.Contains(url, ".railway.app") {
		url = strings.Replace(url, "sslmode=require", "sslmode=disable", 1)
	}
	
	return url
}

// connectToDatabase attempts to connect with retry logic
func connectToDatabase(ctx context.Context, dbURL string) (*pgxpool.Pool, error) {
	var dbPool *pgxpool.Pool
	var err error

	maxRetries := 15
	for i := 0; i < maxRetries; i++ {
		fmt.Printf("Connecting to database... attempt %d/%d\n", i+1, maxRetries)
		
		dbPool, err = pgxpool.New(ctx, dbURL)
		if err != nil {
			fmt.Printf("   Error creating pool: %v\n", err)
			time.Sleep(2 * time.Second)
			continue
		}

		err = dbPool.Ping(ctx)
		if err == nil {
			return dbPool, nil
		}

		dbPool.Close()
		fmt.Printf("   Ping failed: %v\n", err)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("failed to connect after %d attempts: %w", maxRetries, err)
}

// getEnvOrDefault returns environment variable value or default
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// maskURL hides the password in database URL for logging
func maskURL(url string) string {
	if idx := strings.Index(url, "@"); idx != -1 {
		before := url[:idx]
		if colonIdx := strings.LastIndex(before, ":"); colonIdx != -1 {
			return before[:colonIdx] + ":***" + url[idx:]
		}
	}
	return url
}
