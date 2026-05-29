const { Pool, types } = require('pg');

// Convert Postgres NUMERIC columns (returned as strings by default) to standard JS floats
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

// Return Postgres DATE columns as raw string (YYYY-MM-DD) instead of JS Date objects
types.setTypeParser(types.builtins.DATE, (value) => value);

const isProduction = process.env.NODE_ENV === 'production';

// Establish connection pool to PostgreSQL (e.g., Neon or local pg)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trading_journal',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database pool.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Asynchronous schema initialization
const initDb = async () => {
  try {
    // 1. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Trades Table (Note: DROP TABLE is completely removed to protect live data!)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session VARCHAR(100),
        bias VARCHAR(100),
        key_level VARCHAR(255),
        key_level_tap VARCHAR(10) CHECK(key_level_tap IN ('YES','NO')),
        cisd VARCHAR(255),
        trade_date DATE NOT NULL,
        trade_time TIME,
        direction VARCHAR(10) CHECK(direction IN ('BUY','SELL')),
        result VARCHAR(10) CHECK(result IN ('TP','LOSS')),
        net_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
        outcome VARCHAR(10) CHECK(outcome IN ('WIN','LOSS')),
        risk NUMERIC(15, 2),
        why_this_trade TEXT,
        emotion_mindset TEXT,
        mistake_improve TEXT,
        deleted_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Safe migration: add rr_ratio column if it doesn't exist
    try {
      await pool.query(`ALTER TABLE trades ADD COLUMN IF NOT EXISTS rr_ratio VARCHAR(10) DEFAULT '1:1';`);
    } catch (migrationErr) {
      // Column may already exist — safe to ignore
      console.log('rr_ratio column migration skipped (already exists or error):', migrationErr.message);
    }

    // Safe migration: add starting_capital column to users table if it doesn't exist
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS starting_capital NUMERIC(15, 2) DEFAULT 0.00;`);
    } catch (migrationErr) {
      console.log('starting_capital column migration skipped (already exists or error):', migrationErr.message);
    }

    // 4. Create Indexes for optimization
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_outcome ON trades(outcome);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_deleted_at ON trades(deleted_at);`);

    console.log('PostgreSQL database tables initialized/verified.');
  } catch (err) {
    console.error('Error during PostgreSQL schema initialization:', err);
    throw err;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
  pool
};
