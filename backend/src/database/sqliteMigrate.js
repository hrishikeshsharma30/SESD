// SQLite Migration Utility to ensure identical relational schema

const runSqliteMigration = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys in SQLite
      db.run('PRAGMA foreign_keys = ON');

      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'INVESTOR' CHECK (role IN ('INVESTOR', 'ADMIN')),
          balance DECIMAL(15, 2) NOT NULL DEFAULT 1000000.00 CHECK (balance >= 0),
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEACTIVATED')),
          created_at DATETIME NOT NULL DEFAULT (datetime('now')),
          updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Stocks table
      db.run(`
        CREATE TABLE IF NOT EXISTS stocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT UNIQUE NOT NULL,
          company_name TEXT NOT NULL,
          current_price DECIMAL(12, 2) NOT NULL CHECK (current_price > 0),
          previous_price DECIMAL(12, 2) NOT NULL CHECK (previous_price > 0),
          created_at DATETIME NOT NULL DEFAULT (datetime('now')),
          updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          order_type TEXT NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
          price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
          status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED')),
          created_at DATETIME NOT NULL DEFAULT (datetime('now')),
          updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Trades table
      db.run(`
        CREATE TABLE IF NOT EXISTS trades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          buy_order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          sell_order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
          executed_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Portfolio table
      db.run(`
        CREATE TABLE IF NOT EXISTS portfolio (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity >= 0),
          average_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (average_price >= 0),
          updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
          UNIQUE (user_id, stock_id)
        )
      `);

      // Transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          trade_id INTEGER REFERENCES trades(id) ON DELETE SET NULL,
          transaction_type TEXT NOT NULL CHECK (
            transaction_type IN ('INITIAL_DEPOSIT', 'BUY_DEDUCTION', 'SELL_CREDIT', 'ORDER_CANCEL_REFUND')
          ),
          amount DECIMAL(15, 2) NOT NULL,
          description TEXT NOT NULL,
          created_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Watchlist table
      db.run(`
        CREATE TABLE IF NOT EXISTS watchlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
          created_at DATETIME NOT NULL DEFAULT (datetime('now')),
          UNIQUE (user_id, stock_id)
        )
      `);

      // Indexes
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_matching ON orders (stock_id, order_type, status, price, created_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_trades_buyer_seller ON trades (buyer_id, seller_id, stock_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_trades_stock ON trades (stock_id, executed_at DESC)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_id, created_at DESC)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio (user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id)`, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  });
};

module.exports = { runSqliteMigration };
