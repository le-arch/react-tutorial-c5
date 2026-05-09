package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
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
	// Load environment variables from .env file (ignore error if file doesn't exist)
	_ = godotenv.Load()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	route := gin.Default()

	// Get environment variables with proper defaults
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@127.0.0.1:5432/piggydb?sslmode=disable"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	// Configure CORS
	route.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendURL, "http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Healthcheck
	route.GET("/api/v1/healthcheck", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"message": "Piggy API is running",
			"version": "1.0.0",
		})
	})

	// Initialize database connection
	ctx := context.Background()
	dbPool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		panic(fmt.Sprintf("Unable to connect to database: %v", err))
	}
	defer dbPool.Close()

	// Test database connection
	if err := dbPool.Ping(ctx); err != nil {
		panic(fmt.Sprintf("Unable to ping database: %v", err))
	}
	fmt.Println("Database connection established!")

	// Initialize repository
	repository := repo.NewRepository(dbPool)

	// Run migrations
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
	if err := repo.MigrateUp(dbURL, "./internal/db/migrations", logger); err != nil {
		logger.Warn().Err(err).Msg("Migration warning (may already be up to date)")
	}

	// Initialize service and handlers
	appService := piggyservice.NewService(repository)
	handler := handlers.NewHandler(appService)

	// Define application endpoints
	api := route.Group("/api/v1")

	// Public routes
	api.POST("/auth/register", handler.Register)
	api.POST("/auth/login", handler.Login)

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/transactions", handler.CreateTransaction)
		protected.GET("/transactions", handler.GetTransactions)
		protected.GET("/account", handler.GetUserAccount)
	}

	// Run application
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Server running on port %s\n", port)
	if err := route.Run(":" + port); err != nil {
		panic(fmt.Sprintf("Failed to start server: %v", err))
	}
}