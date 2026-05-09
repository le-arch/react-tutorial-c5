package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"piggy.com/internal/models"
	"piggy.com/internal/piggyservice"
)

type Handler struct {
	service *piggyservice.Service
}

func NewHandler(service *piggyservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) CreateTransaction(c *gin.Context) {
	var payload models.CreateTransactionPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if payload.Amount == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount is required"})
		return
	}

	if payload.Type != models.TypeSaving && payload.Type != models.TypeWithdrawal {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Type must be 'saving' or 'withdrawal'"})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Safe type assertion
	uid, ok := userID.(int32)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Log the request for debugging
	println("Creating transaction for user:", uid, "type:", payload.Type, "amount:", payload.Amount)

	transaction, err := h.service.CreateTransaction(c.Request.Context(), uid, payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

func (h *Handler) GetTransactions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	uid, ok := userID.(int32)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	transactions, err := h.service.GetTransactionsByUserID(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	if transactions == nil {
		transactions = []models.Transaction{}
	}

	c.JSON(http.StatusOK, transactions)
}

func (h *Handler) GetUserAccount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	uid, ok := userID.(int32)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	accountInfo, err := h.service.GetUserAccountInfo(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch account information"})
		return
	}

	c.JSON(http.StatusOK, accountInfo)
}