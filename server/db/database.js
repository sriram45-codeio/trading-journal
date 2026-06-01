/**
 * Dual-mode database layer:
 * - Uses PostgreSQL when DATABASE_URL env var is set (production/cloud)
 * - Falls back to SQLite for local development (zero setup)
 */

const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
const USE_PG = !!DATABASE_URL;

let queryFn;
let initDbFn;

if (USE_PG) {
  // ─── PostgreSQL Mode ───
  const { Pool, types } = require('pg');

  // Convert Postgres NUMERIC columns to JS floats
  types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));
  // Return Postgres DATE columns as raw string (YYYY-MM-DD)
  types.setTypeParser(types.builtins.DATE, (value) => value);

  const isProduction = process.env.NODE_ENV === 'production';

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });

  pool.on('connect', () => {
    console.log('[PostgreSQL] Connected to database pool.');
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL] Unexpected error on idle client:', err);
  });

  queryFn = (text, params) => pool.query(text, params);

  initDbFn = async () => {
    try {
      // 1. Create Users Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          starting_capital NUMERIC(15, 2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Create Trades Table
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
          result VARCHAR(10) CHECK(result IN ('TP','SL','HOLD','LOSS')),
          net_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
          outcome VARCHAR(10) CHECK(outcome IN ('WIN','LOSS','HOLD')),
          risk NUMERIC(15, 2),
          rr_ratio VARCHAR(10) DEFAULT '1:1',
          why_this_trade TEXT,
          emotion_mindset TEXT,
          mistake_improve TEXT,
          screenshot TEXT,
          deleted_at TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Safe migrations — add columns if missing
      try {
        const tradeCols = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = current_schema() AND table_name = 'trades' AND column_name = 'rr_ratio'
        `);
        if (tradeCols.rows.length === 0) {
          await pool.query(`ALTER TABLE trades ADD COLUMN rr_ratio VARCHAR(10) DEFAULT '1:1';`);
          console.log('[PostgreSQL] Added rr_ratio column to trades table.');
        }
      } catch (migrationErr) {
        if (!migrationErr.message.includes('already exists')) {
          console.log('[PostgreSQL] rr_ratio migration:', migrationErr.message);
        }
      }

      try {
        const userCols = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'starting_capital'
        `);
        if (userCols.rows.length === 0) {
          await pool.query(`ALTER TABLE users ADD COLUMN starting_capital NUMERIC(15, 2) DEFAULT 0.00;`);
          console.log('[PostgreSQL] Added starting_capital column to users table.');
        }
      } catch (migrationErr) {
        if (!migrationErr.message.includes('already exists')) {
          console.log('[PostgreSQL] starting_capital migration:', migrationErr.message);
        }
      }

      try {
        const tradeCols = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = current_schema() AND table_name = 'trades' AND column_name = 'screenshot'
        `);
        if (tradeCols.rows.length === 0) {
          await pool.query(`ALTER TABLE trades ADD COLUMN screenshot TEXT;`);
          console.log('[PostgreSQL] Added screenshot column to trades table.');
        }
      } catch (migrationErr) {
        console.log('[PostgreSQL] screenshot migration:', migrationErr.message);
      }

      try {
        await pool.query("ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_result_check;");
        await pool.query("ALTER TABLE trades ADD CONSTRAINT trades_result_check CHECK (result IN ('TP','SL','HOLD','LOSS'));");
      } catch (err) {
        console.log('[PostgreSQL] Failed to update result CHECK constraint:', err.message);
      }

      try {
        await pool.query("ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_outcome_check;");
        await pool.query("ALTER TABLE trades ADD CONSTRAINT trades_outcome_check CHECK (outcome IN ('WIN','LOSS','HOLD'));");
      } catch (err) {
        console.log('[PostgreSQL] Failed to update outcome CHECK constraint:', err.message);
      }

      // 4. Create Indexes
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_outcome ON trades(outcome);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_trades_deleted_at ON trades(deleted_at);`);

      console.log('[PostgreSQL] Database tables initialized/verified.');
    } catch (err) {
      console.error('[PostgreSQL] Schema initialization error:', err);
      throw err;
    }
  };

} else {
  // ─── SQLite Mode (Local Development) ───
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (e) {
    console.error('CRITICAL: SQLite is required for local development. Run: npm install better-sqlite3');
    throw e;
  }

  const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'trading_journal.db');
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log(`[SQLite] Connected to database at: ${DB_PATH}`);

  // Compatibility layer: pg-like query() interface
  queryFn = (text, params = []) => {
    let sqliteText = text;

    // Replace $N placeholders with ?
    sqliteText = sqliteText.replace(/\$(\d+)/g, () => '?');

    // ILIKE -> LIKE
    sqliteText = sqliteText.replace(/ILIKE/gi, 'LIKE');

    // Remove trailing semicolons
    sqliteText = sqliteText.trim().replace(/;+$/, '');

    const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteText);
    const hasReturning = /RETURNING\s+/i.test(sqliteText);

    // Build ordered params from $N references
    const orderedParams = [];
    const matches = [...text.matchAll(/\$(\d+)/g)];
    matches.forEach(m => {
      const pgIndex = parseInt(m[1]) - 1;
      orderedParams.push(params[pgIndex] !== undefined ? params[pgIndex] : null);
    });

    try {
      if (hasReturning) {
        const sqlWithoutReturning = sqliteText.replace(/\s+RETURNING\s+.+$/i, '');
        const stmt = db.prepare(sqlWithoutReturning);
        const result = stmt.run(...orderedParams);

        let tableName = '';
        const insertMatch = sqlWithoutReturning.match(/INSERT\s+INTO\s+(\w+)/i);
        const updateMatch = sqlWithoutReturning.match(/UPDATE\s+(\w+)/i);

        if (insertMatch) {
          tableName = insertMatch[1];
          const row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(result.lastInsertRowid);
          return { rows: row ? [row] : [], rowCount: result.changes };
        } else if (updateMatch) {
          tableName = updateMatch[1];
          const whereMatch = sqlWithoutReturning.match(/WHERE\s+(.+)$/i);
          if (whereMatch) {
            const selectSql = `SELECT * FROM ${tableName} WHERE ${whereMatch[1]}`;
            const totalQuestions = [...sqlWithoutReturning.matchAll(/\?/g)].length;
            const whereQuestions = [...(`WHERE ${whereMatch[1]}`).matchAll(/\?/g)].length;
            const whereParams = orderedParams.slice(totalQuestions - whereQuestions);
            const row = db.prepare(selectSql).get(...whereParams);
            return { rows: row ? [row] : [], rowCount: result.changes };
          }
          return { rows: [], rowCount: result.changes };
        }
        return { rows: [], rowCount: result.changes };
      } else if (isSelect) {
        const stmt = db.prepare(sqliteText);
        const rows = stmt.all(...orderedParams);
        return { rows };
      } else {
        const stmt = db.prepare(sqliteText);
        const result = stmt.run(...orderedParams);
        return { rows: [], rowCount: result.changes, lastInsertRowid: result.lastInsertRowid };
      }
    } catch (err) {
      console.error('[SQLite] Query error:', err.message);
      console.error('[SQLite] SQL:', sqliteText);
      console.error('[SQLite] Params:', orderedParams);
      throw err;
    }
  };

  initDbFn = async () => {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          starting_capital REAL DEFAULT 0.00,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.exec(`
        CREATE TABLE IF NOT EXISTS trades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          session TEXT,
          bias TEXT,
          key_level TEXT,
          key_level_tap TEXT CHECK(key_level_tap IN ('YES','NO')),
          cisd TEXT,
          trade_date TEXT NOT NULL,
          trade_time TEXT,
          direction TEXT CHECK(direction IN ('BUY','SELL')),
          result TEXT CHECK(result IN ('TP','SL','HOLD','LOSS')),
          net_pnl REAL NOT NULL DEFAULT 0,
          outcome TEXT CHECK(outcome IN ('WIN','LOSS','HOLD')),
          risk REAL,
          rr_ratio TEXT DEFAULT '1:1',
          why_this_trade TEXT,
          emotion_mindset TEXT,
          mistake_improve TEXT,
          screenshot TEXT,
          deleted_at DATETIME DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // SQLite check constraint and schema migration dry-run test
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trades'").get();
      if (tableExists) {
        let needsMigration = false;
        try {
          db.exec("BEGIN TRANSACTION;");
          db.exec("PRAGMA foreign_keys = OFF;");
          db.exec("INSERT INTO trades (id, user_id, trade_date, direction, result, net_pnl, outcome) VALUES (-99, -99, '2026-01-01', 'BUY', 'HOLD', 0, 'HOLD');");
          db.exec("ROLLBACK;");
        } catch (err) {
          needsMigration = true;
          try { db.exec("ROLLBACK;"); } catch(e){}
        } finally {
          db.exec("PRAGMA foreign_keys = ON;");
        }

        if (needsMigration) {
          console.log('[SQLite] Result/outcome constraints restrict HOLD/SL. Migrating trades table...');
          db.exec("PRAGMA foreign_keys = OFF;");
          db.exec("BEGIN TRANSACTION;");
          
          // Rename old table
          db.exec("ALTER TABLE trades RENAME TO trades_old;");
          
          // Create new table
          db.exec(`
            CREATE TABLE trades (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              session TEXT,
              bias TEXT,
              key_level TEXT,
              key_level_tap TEXT CHECK(key_level_tap IN ('YES','NO')),
              cisd TEXT,
              trade_date TEXT NOT NULL,
              trade_time TEXT,
              direction TEXT CHECK(direction IN ('BUY','SELL')),
              result TEXT CHECK(result IN ('TP','SL','HOLD','LOSS')),
              net_pnl REAL NOT NULL DEFAULT 0,
              outcome TEXT CHECK(outcome IN ('WIN','LOSS','HOLD')),
              risk REAL,
              rr_ratio TEXT DEFAULT '1:1',
              why_this_trade TEXT,
              emotion_mindset TEXT,
              mistake_improve TEXT,
              screenshot TEXT,
              deleted_at DATETIME DEFAULT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          
          // Copy data
          const oldColumns = db.prepare("PRAGMA table_info(trades_old)").all().map(c => c.name);
          const commonColumns = [
            'id', 'user_id', 'session', 'bias', 'key_level', 'key_level_tap', 'cisd',
            'trade_date', 'trade_time', 'direction', 'result', 'net_pnl', 'outcome',
            'risk', 'rr_ratio', 'why_this_trade', 'emotion_mindset', 'mistake_improve',
            'deleted_at', 'created_at', 'updated_at'
          ].filter(c => oldColumns.includes(c));
          
          if (oldColumns.includes('screenshot')) {
            commonColumns.push('screenshot');
          }
          
          const colsStr = commonColumns.join(', ');
          db.exec(`INSERT INTO trades (${colsStr}) SELECT ${colsStr} FROM trades_old;`);
          
          // Drop old table
          db.exec("DROP TABLE trades_old;");
          
          db.exec("COMMIT;");
          db.exec("PRAGMA foreign_keys = ON;");
          console.log('[SQLite] Table migration complete.');
        } else {
          // If we don't need a constraint migration, we still check if the screenshot column exists
          const tradeColumns = db.prepare("PRAGMA table_info(trades)").all();
          const tradeColNames = tradeColumns.map(c => c.name);
          if (!tradeColNames.includes('screenshot')) {
            db.exec("ALTER TABLE trades ADD COLUMN screenshot TEXT;");
            console.log('[SQLite] Added screenshot column to trades table.');
          }
        }
      }

      // Safe migrations for other columns
      const tradeColumns = db.prepare("PRAGMA table_info(trades)").all();
      const tradeColNames = tradeColumns.map(c => c.name);
      if (!tradeColNames.includes('rr_ratio')) {
        db.exec("ALTER TABLE trades ADD COLUMN rr_ratio TEXT DEFAULT '1:1';");
      }

      const userColumns = db.prepare("PRAGMA table_info(users)").all();
      const userColNames = userColumns.map(c => c.name);
      if (!userColNames.includes('starting_capital')) {
        db.exec("ALTER TABLE users ADD COLUMN starting_capital REAL DEFAULT 0.00;");
      }

      db.exec("CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);");
      db.exec("CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date);");
      db.exec("CREATE INDEX IF NOT EXISTS idx_trades_outcome ON trades(outcome);");
      db.exec("CREATE INDEX IF NOT EXISTS idx_trades_deleted_at ON trades(deleted_at);");

      console.log('[SQLite] Database tables initialized/verified.');
    } catch (err) {
      console.error('[SQLite] Schema initialization error:', err);
      throw err;
    }
  };
}

module.exports = {
  query: queryFn,
  initDb: initDbFn
};
