-- ==========================================================
-- PostgreSQL Database Schema for Virtual Stock Exchange (SESD)
-- ==========================================================

-- Drop tables in reverse dependency order if needed
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'INVESTOR' CHECK (role IN ('INVESTOR', 'ADMIN')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00 CHECK (balance >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stocks Table
CREATE TABLE stocks (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    current_price NUMERIC(12, 2) NOT NULL CHECK (current_price > 0),
    previous_price NUMERIC(12, 2) NOT NULL CHECK (previous_price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trades Table
CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    buy_order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sell_order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Portfolio Table
CREATE TABLE portfolio (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    average_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (average_price >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_stock UNIQUE (user_id, stock_id)
);

-- 6. Transactions Table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id BIGINT REFERENCES trades(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL CHECK (
        transaction_type IN ('INITIAL_DEPOSIT', 'BUY_DEDUCTION', 'SELL_CREDIT', 'ORDER_CANCEL_REFUND')
    ),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Watchlist Table
CREATE TABLE watchlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id BIGINT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist_user_stock UNIQUE (user_id, stock_id)
);

-- Indexes for High-Performance Order Matching and Queries
CREATE INDEX idx_orders_matching ON orders (stock_id, order_type, status, price, created_at);
CREATE INDEX idx_orders_user ON orders (user_id, status);
CREATE INDEX idx_trades_buyer_seller ON trades (buyer_id, seller_id, stock_id);
CREATE INDEX idx_trades_stock ON trades (stock_id, executed_at DESC);
CREATE INDEX idx_transactions_user ON transactions (user_id, created_at DESC);
CREATE INDEX idx_portfolio_user ON portfolio (user_id);
CREATE INDEX idx_watchlist_user ON watchlist (user_id);
