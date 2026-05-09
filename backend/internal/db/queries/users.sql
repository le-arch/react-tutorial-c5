-- name: CreateUser :one
INSERT INTO users (email, password, name, balance)
VALUES ($1, $2, $3, $4)
RETURNING id, email, password, name, created_at, balance;

-- name: GetUserByEmail :one
SELECT id, email, password, name, created_at, balance
FROM users
WHERE email = $1;

-- name: GetUserByID :one
SELECT id, email, password, name, created_at, balance
FROM users
WHERE id = $1;

-- name: GetUserAccountInfo :one
SELECT id, email, name, created_at, balance
FROM users
WHERE id = $1;

-- name: UpdateUserBalance :exec
UPDATE users
SET balance = $2
WHERE id = $1;

-- name: GetUserBalance :one
SELECT balance FROM users WHERE id = $1;