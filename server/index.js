require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRouter = require('./routes/auth');
const tradesRouter = require('./routes/trades');
const analyticsRouter = require('./routes/analytics');
const db = require('./db/database');
const seed = require('./db/seed');

const app = express();

const corsOptions = {
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);

    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Mount routes with and without /api prefix for maximum robustness in production environments
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/trades', tradesRouter);
app.use('/trades', tradesRouter);

app.use('/api/analytics', analyticsRouter);
app.use('/analytics', analyticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 1. Initialize PostgreSQL tables and indexes
    await db.initDb();

    // 2. Seed database if empty
    await seed();

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
