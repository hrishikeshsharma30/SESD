const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pgPool = null;
let sqliteDb = null;
let activeEngine = 'postgres'; // 'postgres' | 'sqlite'

// Initialize SQLite fallback database
const initSqlite = () => {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'stock_exchange.db');
  sqliteDb = new sqlite3.Database(dbPath);
  activeEngine = 'sqlite';
  console.log(`[Database] Using SQLite database at: ${dbPath}`);
};

// Initialize PostgreSQL Pool
const initPg = () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/virtual_stock_exchange';
  pgPool = new Pool({
    connectionString,
    connectionTimeoutMillis: 2000 // Quick timeout to failover if pg is not running
  });
};

initPg();

// Helper to translate PostgreSQL parameter placeholders ($1, $2, ...) to SQLite (?)
const pgToSqliteQuery = (text, params = []) => {
  const orderedParams = [];
  // Match each $1, $2, etc., extract the 1-based index, and push the corresponding param
  const sqliteQuery = text
    .replace(/\$(\d+)/g, (_, idx) => {
      const paramIndex = parseInt(idx, 10) - 1;
      orderedParams.push(params[paramIndex]);
      return '?';
    })
    .replace(/BIGSERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/TIMESTAMPTZ/gi, 'DATETIME')
    .replace(/NUMERIC\(\d+,\s*\d+\)/gi, 'DECIMAL')
    .replace(/FOR UPDATE/gi, '') // SQLite file locks automatically during transactions
    .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");

  return { sqliteQuery, params: orderedParams };
};

// Unified query function
const query = async (text, params = []) => {
  if (activeEngine === 'postgres') {
    try {
      const start = Date.now();
      const res = await pgPool.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount
      };
    } catch (err) {
      // If connection failed and sqlite is not yet active, fallback to sqlite
      if (err.code === 'ECONNREFUSED' || err.code === '28P01' || err.code === '3D000' || !sqliteDb) {
        console.warn(`[Database Warning] PostgreSQL connection failed (${err.message}). Auto-switching to embedded relational SQLite.`);
        initSqlite();
        // Run migration automatically for SQLite
        const { runSqliteMigration } = require('../database/sqliteMigrate');
        await runSqliteMigration(sqliteDb);
        return query(text, params);
      }
      throw err;
    }
  }

  // SQLite execution
  return new Promise((resolve, reject) => {
    const { sqliteQuery } = pgToSqliteQuery(text, params);
    const trimmed = sqliteQuery.trim();
    const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('select') || trimmed.includes('RETURNING');

    if (isSelect) {
      sqliteDb.all(sqliteQuery, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
      });
    } else {
      sqliteDb.run(sqliteQuery, params, function (err) {
        if (err) return reject(err);
        resolve({
          rows: [{ id: this.lastID }],
          rowCount: this.changes,
          lastInsertRowid: this.lastID
        });
      });
    }
  });
};

// Unified Transaction Client
const getClient = async () => {
  if (activeEngine === 'postgres') {
    try {
      const client = await pgPool.connect();
      return {
        query: (t, p) => client.query(t, p),
        release: () => client.release()
      };
    } catch (err) {
      initSqlite();
      const { runSqliteMigration } = require('../database/sqliteMigrate');
      await runSqliteMigration(sqliteDb);
    }
  }

  // SQLite Transaction Client
  return {
    query: (t, p = []) => {
      const { sqliteQuery, params } = pgToSqliteQuery(t, p);
      const isSelect = sqliteQuery.trim().startsWith('SELECT') || sqliteQuery.trim().startsWith('select');
      return new Promise((resolve, reject) => {
        if (sqliteQuery.trim() === 'BEGIN' || sqliteQuery.trim() === 'COMMIT' || sqliteQuery.trim() === 'ROLLBACK') {
          sqliteDb.run(sqliteQuery, [], (err) => {
            if (err) return reject(err);
            resolve({ rows: [], rowCount: 0 });
          });
        } else if (isSelect) {
          sqliteDb.all(sqliteQuery, params, (err, rows) => {
            if (err) return reject(err);
            resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
          });
        } else {
          sqliteDb.run(sqliteQuery, params, function (err) {
            if (err) return reject(err);
            resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
          });
        }
      });
    },
    release: () => {}
  };
};

module.exports = {
  query,
  getClient,
  getEngine: () => activeEngine
};
