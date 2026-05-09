package models


type User struct {
	ID        int32   `json:"id"`
	Email     string  `json:"email"`
	Password  string  `json:"password,omitempty"`
	Name      string  `json:"name"`
	Balance   float64 `json:"balance"`
	CreatedAt string  `json:"createdAt,omitempty"`
}

type UserAccountInfo struct {
	ID        int32   `json:"id"`
	Email     string  `json:"email"`
	Name      string  `json:"name"`
	Balance   float64 `json:"balance"`
	CreatedAt string  `json:"createdAt"`
}

type LoginPayload struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterPayload struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateTransactionPayload struct {
	Amount string `json:"amount" binding:"required"`
	Type   string `json:"type" binding:"required,oneof=saving withdrawal"`
	Reason string `json:"reason"`
}

type Transaction struct {
	ID        int32  `json:"id"`
	Amount    string `json:"amount"`
	Type      string `json:"type"`
	Reason    string `json:"reason"`
	CreatedAt string `json:"createdAt"`
	UserID    int32  `json:"userId"`
}

const (
	TypeSaving     = "saving"
	TypeWithdrawal = "withdrawal"
)