package piggyservice

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shopspring/decimal"

	"piggy.com/internal/db/repo"
	"piggy.com/internal/db/sqlc"
	"piggy.com/internal/models"
)

type Service struct {
	repo repo.Repository
}

func NewService(repo repo.Repository) *Service {
	return &Service{repo: repo}
}

// Convert decimal.Decimal to pgtype.Numeric
func decimalToNumeric(d decimal.Decimal) pgtype.Numeric {
	// Use the String() method to get exact representation
	str := d.String()
	var n pgtype.Numeric
	// Scan the string value into pgtype.Numeric
	err := n.Scan(str)
	if err != nil {
		// Fallback: try with float64
		f, _ := d.Float64()
		n.Scan(f)
	}
	return n
}

// Convert pgtype.Numeric to decimal.Decimal
func numericToDecimal(n pgtype.Numeric) decimal.Decimal {
	if !n.Valid {
		return decimal.Zero
	}
	
	// Extract the numeric value as a string for maximum precision
	// pgtype.Numeric stores values as Int * 10^Exp
	if n.Int != nil {
		// Convert big.Int and exponent to string
		bigIntStr := n.Int.String()
		if n.Exp >= 0 {
			// Positive exponent: multiply by 10^Exp
			zeros := ""
			for i := int32(0); i < n.Exp; i++ {
				zeros += "0"
			}
			str := bigIntStr + zeros
			d, _ := decimal.NewFromString(str)
			return d
		} else {
			// Negative exponent: divide by 10^|Exp|
			// Insert decimal point
			absExp := -n.Exp
			str := bigIntStr
			if len(str) <= int(absExp) {
				// Need to pad with leading zeros
				padding := ""
				for i := 0; i < int(absExp)-len(str); i++ {
					padding += "0"
				}
				str = "0." + padding + str
			} else {
				// Insert decimal point
				insertPos := len(str) - int(absExp)
				str = str[:insertPos] + "." + str[insertPos:]
			}
			d, _ := decimal.NewFromString(str)
			return d
		}
	}
	
	// Fallback: try to get float value
	var f float64
	if err := n.Scan(&f); err == nil {
		return decimal.NewFromFloat(f)
	}
	
	return decimal.Zero
}

// Convert pgtype.Numeric to float64 for JSON
func numericToFloat64(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0.0
	}
	
	// Use numericToDecimal for accuracy, then convert to float
	d := numericToDecimal(n)
	f, _ := d.Float64()
	return f
}

// Convert pgtype.Numeric to formatted string
func numericToString(n pgtype.Numeric) string {
	if !n.Valid {
		return "0.00"
	}
	
	// Use numericToDecimal for accuracy
	d := numericToDecimal(n)
	return d.StringFixed(2)
}

func (s *Service) CreateUser(ctx context.Context, email, password, name string) (*models.User, error) {
	initialBalance := decimal.NewFromFloat(0.00)
	
	user, err := s.repo.Do().CreateUser(ctx, sqlc.CreateUserParams{
		Email:    email,
		Password: password,
		Name:     &name,
		Balance:  decimalToNumeric(initialBalance),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return s.convertUserToModel(user)
}

func (s *Service) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := s.repo.Do().GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return s.convertUserToModel(user)
}

func (s *Service) GetUserByID(ctx context.Context, userID int32) (*models.User, error) {
	user, err := s.repo.Do().GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return s.convertUserToModel(user)
}

func (s *Service) GetUserAccountInfo(ctx context.Context, userID int32) (*models.UserAccountInfo, error) {
	info, err := s.repo.Do().GetUserAccountInfo(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user account info: %w", err)
	}

	userName := ""
	if info.Name != nil {
		userName = *info.Name
	}

	balance := numericToFloat64(info.Balance)
	
	fmt.Printf("DEBUG: User %d balance numeric: %+v, float: %f\n", userID, info.Balance, balance)

	return &models.UserAccountInfo{
		ID:        info.ID,
		Email:     info.Email,
		Name:      userName,
		Balance:   balance,
		CreatedAt: info.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *Service) CreateTransaction(ctx context.Context, userID int32, payload models.CreateTransactionPayload) (*models.Transaction, error) {
	// Validate transaction type
	if payload.Type != models.TypeSaving && payload.Type != models.TypeWithdrawal {
		return nil, fmt.Errorf("invalid transaction type: must be 'saving' or 'withdrawal'")
	}

	fmt.Printf("DEBUG: Creating transaction - Amount: '%s', Type: %s\n", payload.Amount, payload.Type)

	// Parse amount using decimal for perfect precision
	amount, err := decimal.NewFromString(payload.Amount)
	if err != nil {
		return nil, fmt.Errorf("invalid amount format: %w", err)
	}

	fmt.Printf("DEBUG: Parsed amount decimal: %s\n", amount.String())

	if amount.LessThanOrEqual(decimal.Zero) {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	// Get current balance
	currentBalanceNumeric, err := s.repo.Do().GetUserBalance(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user balance: %w", err)
	}

	fmt.Printf("DEBUG: Current balance numeric: %+v\n", currentBalanceNumeric)

	// Convert to decimal for calculation
	currentBalanceDecimal := numericToDecimal(currentBalanceNumeric)
	
	fmt.Printf("DEBUG: Current balance decimal: %s\n", currentBalanceDecimal.String())

	// Calculate new balance
	var newBalanceDecimal decimal.Decimal
	if payload.Type == models.TypeSaving {
		newBalanceDecimal = currentBalanceDecimal.Add(amount)
	} else {
		if currentBalanceDecimal.LessThan(amount) {
			return nil, fmt.Errorf("insufficient balance: have %s, need %s",
				currentBalanceDecimal.StringFixed(2), amount.StringFixed(2))
		}
		newBalanceDecimal = currentBalanceDecimal.Sub(amount)
	}

	fmt.Printf("DEBUG: New balance decimal: %s\n", newBalanceDecimal.String())

	// Begin transaction for atomicity
	querier, tx, err := s.repo.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin database transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Update user balance
	if err := querier.UpdateUserBalance(ctx, sqlc.UpdateUserBalanceParams{
		ID:      userID,
		Balance: decimalToNumeric(newBalanceDecimal),
	}); err != nil {
		return nil, fmt.Errorf("failed to update balance: %w", err)
	}

	// Create transaction record
	transaction, err := querier.CreateTransaction(ctx, sqlc.CreateTransactionParams{
		Amount: decimalToNumeric(amount),
		Type:   &payload.Type,
		Reason: &payload.Reason,
		UserID: &userID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction record: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	amountStr := numericToString(transaction.Amount)
	fmt.Printf("DEBUG: Stored transaction amount: %s\n", amountStr)

	return &models.Transaction{
		ID:        transaction.ID,
		Amount:    amountStr,
		Type:      getStringValue(transaction.Type),
		Reason:    getStringValue(transaction.Reason),
		CreatedAt: transaction.CreatedAt.Format(time.RFC3339),
		UserID:    userID,
	}, nil
}

func (s *Service) GetTransactionsByUserID(ctx context.Context, userID int32) ([]models.Transaction, error) {
	txns, err := s.repo.Do().GetTransactionsByUserID(ctx, &userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user transactions: %w", err)
	}

	transactions := make([]models.Transaction, 0, len(txns))
	for _, t := range txns {
		amountStr := numericToString(t.Amount)
		fmt.Printf("DEBUG: Transaction %d amount: %s\n", t.ID, amountStr)
		
		transactions = append(transactions, models.Transaction{
			ID:        t.ID,
			Amount:    amountStr,
			Type:      getStringValue(t.Type),
			Reason:    getStringValue(t.Reason),
			CreatedAt: t.CreatedAt.Format(time.RFC3339),
			UserID:    getInt32Value(t.UserID),
		})
	}

	return transactions, nil
}

func (s *Service) convertUserToModel(user sqlc.User) (*models.User, error) {
	userName := ""
	if user.Name != nil {
		userName = *user.Name
	}

	balance := numericToFloat64(user.Balance)
	fmt.Printf("DEBUG: Converting user - balance numeric: %+v, float: %f\n", user.Balance, balance)

	return &models.User{
		ID:        user.ID,
		Email:     user.Email,
		Password:  user.Password,
		Name:      userName,
		Balance:   balance,
		CreatedAt: user.CreatedAt.Format(time.RFC3339),
	}, nil
}

func getStringValue(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

func getInt32Value(i *int32) int32 {
	if i != nil {
		return *i
	}
	return 0
}