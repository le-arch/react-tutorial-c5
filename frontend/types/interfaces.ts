export interface TransactionType {
	id: number;
	amount: string; // Always string from backend (decimal formatted)
	reason: string;
	createdAt: string;
	type: "saving" | "withdrawal";
	userId: number;
}

export interface GetTransactionsParamsType {
	type?: "saving" | "withdrawal";
	size?: number;
}

export interface UserType {
	id: number;
	email: string;
	name: string;
	balance: number; // Backend sends as float64 in JSON
	createdAt?: string;
}

export interface UserAccountInfo {
	id: number;
	email: string;
	name: string;
	balance: number; // Backend sends as float64 in JSON
	createdAt: string;
}

export interface AuthResponse {
	token: string;
	user: UserType;
}

export interface RegisterPayload {
	email: string;
	password: string;
	name: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface CreateTransactionPayload {
	amount: string; // Send as string to preserve decimal precision
	type: "saving" | "withdrawal";
	reason: string;
}

export interface ApiError {
	error: string;
	details?: string;
}