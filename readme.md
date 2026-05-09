# 🐷 Piggy - Personal Finance Tracker

A full-stack personal finance application for tracking savings and withdrawals. Built with Go (Gin), PostgreSQL, and Next.js.

## 📋 Features

- **User Authentication** - Register and login with JWT-based authentication
- **Balance Tracking** - Real-time balance updates with decimal precision
- **Savings Management** - Add money to your savings with reasons
- **Withdrawal Management** - Withdraw money with balance validation
- **Transaction History** - View all transactions filtered by type
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Backend
- **Go 1.26.1** with Gin framework
- **PostgreSQL 17** for data persistence
- **SQLC** for type-safe SQL queries
- **Golang-Migrate** for database migrations
- **JWT** for authentication
- **Shopspring/Decimal** for precise monetary calculations

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React-Toastify** for notifications

### Infrastructure
- **Docker** & **Docker Compose** for containerization
- **Multi-stage builds** for optimized images

## 📁 Project Structure

```
react-tuturial-c5/
├── cmd/
│   └── main.go              # Application entry point
├── internal/
│   ├── db/
│   │   ├── migrations/      # SQL migration files
│   │   ├── queries/         # SQLC query definitions
│   │   └── sqlc/            # Generated SQLC code
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/           # Auth middleware
│   ├── models/              # Data models
│   └── piggyservice/        # Business logic
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── api/                 # API client functions
│   └── utils/               # Utility functions
├── Dockerfile
├── docker-compose.yaml
├── go.mod
├── sqlc.yaml
└── .env
```

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Go 1.23+](https://go.dev/dl/) (for local development)
- [Node.js 18+](https://nodejs.org/) (for frontend development)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd piggy
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

3. **Start the backend services**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port `5432`
- Go API server on port `8080`

4. **Start the frontend (in a new terminal)**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

5. **Access the application**
- Frontend: http://localhost:3000
- API Health Check: http://localhost:8080/api/v1/healthcheck

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DB_URL=postgres://postgres:postgres@db:5432/piggydb?sslmode=disable

# Server
PORT=8080
FRONTEND_URL=http://localhost:3000
GIN_MODE=debug

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

### SQLC Code Generation

After modifying SQL queries, regenerate the Go code:

```bash
sqlc generate
```

### Database Migrations

Migrations run automatically when the API starts. To run manually:

```bash
# Apply migrations
docker-compose exec api ./main migrate-up

# Rollback migrations
docker-compose exec api ./main migrate-down
```

## 📡 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/healthcheck` | Health check |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login user |

### Protected Routes (Requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/transactions` | Create transaction |
| `GET` | `/api/v1/transactions` | Get user transactions |
| `GET` | `/api/v1/account` | Get account info |

## 🧪 Testing with cURL

### Register a new user
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create a saving (use token from login)
```bash
curl -X POST http://localhost:8080/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":"500.00","type":"saving","reason":"Salary"}'
```

### Get account info
```bash
curl http://localhost:8080/api/v1/account \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(25),
    reason TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api

# Rebuild after changes
docker-compose up -d --build

# Reset everything (including database)
docker-compose down -v
docker-compose up -d --build
```

## 📊 Application Flow

1. **User Registration**: Creates account with initial balance of 0.00
2. **Login**: Returns JWT token for authentication
3. **Add Savings**: Increases balance, creates transaction record
4. **Make Withdrawal**: Decreases balance (validates sufficient funds), creates transaction record
5. **View Transactions**: Filter by type (saving/withdrawal)
6. **Account Overview**: Shows current balance and account status

## 🔒 Security Features

- **JWT Authentication**: Expires after 72 hours
- **Password Hashing**: Using bcrypt
- **CORS Protection**: Configured for frontend origin
- **SQL Injection Prevention**: Using parameterized queries (SQLC)
- **Transaction Atomicity**: Database transactions for balance updates
- **Input Validation**: Both client and server-side

## 🛠️ Development

### Running locally without Docker

1. **Start PostgreSQL**
```bash
# Ensure PostgreSQL is running on port 5432
```

2. **Run the API**
```bash
go mod download
go run cmd/main.go
```

3. **Run the frontend**
```bash
cd frontend
npm run dev
```

### Building for Production

```bash
# Build backend
docker-compose build

# Build frontend
cd frontend
npm run build
```


Built with ❤️ using Go, React, and PostgreSQL