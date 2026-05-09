CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  type VARCHAR(25)
);