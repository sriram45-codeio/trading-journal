const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  try {
    const tradeCountRes = await db.query('SELECT COUNT(*) as count FROM trades');
    const tradeCount = parseInt(tradeCountRes.rows[0].count, 10);

    if (tradeCount > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with demo data...');

    let userId;
    const existingUserRes = await db.query('SELECT id FROM users WHERE email = $1', ['demo@trading.com']);
    const existingUser = existingUserRes.rows[0];

    if (existingUser) {
      userId = existingUser.id;
      console.log('Using existing demo user with ID:', userId);
    } else {
      const passwordHash = bcrypt.hashSync('demo123', 10);
      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        ['demo@trading.com', passwordHash]
      );
      userId = result.rows[0].id;
      console.log('Created demo user with ID:', userId);
    }

    const sampleTrades = [
      {
        session: 'NY',
        bias: 'Bullish',
        key_level: 'Previous Day High (1.0820)',
        key_level_tap: 'YES',
        cisd: 'YES',
        trade_date: '2024-01-15',
        trade_time: '09:30',
        direction: 'BUY',
        result: 'TP',
        risk: 50.00,
        why_this_trade: 'Tapped Previous Day High support, strong order flow and Change in State of Delivery confirmed on M5.',
        emotion_mindset: 'Extremely calm and disciplined. Waited exactly for the tap.',
        mistake_improve: 'Excellent patience, no mistakes.'
      },
      {
        session: 'London',
        bias: 'Bearish',
        key_level: 'H4 Orderblock (42800)',
        key_level_tap: 'YES',
        cisd: 'NO',
        trade_date: '2024-01-16',
        trade_time: '14:15',
        direction: 'SELL',
        result: 'LOSS',
        risk: 60.00,
        why_this_trade: 'Anticipated resistance tap, but executed before CISD was fully established on M1.',
        emotion_mindset: 'Slightly anxious and rushed due to fear of missing out.',
        mistake_improve: 'Wait for clear market structure shift instead of predicting the tap early.'
      },
      {
        session: 'Asia',
        bias: 'Bullish',
        key_level: 'M15 Demand Zone (1.2620)',
        key_level_tap: 'YES',
        cisd: 'YES',
        trade_date: '2024-01-17',
        trade_time: '08:00',
        direction: 'BUY',
        result: 'TP',
        risk: 100.00,
        why_this_trade: 'Clean tap of demand zone during Tokyo open. Clear bullish structure.',
        emotion_mindset: 'Focused, followed the plan and set stop loss perfectly.',
        mistake_improve: 'Perfect entry. Take profit hit immediately.'
      },
      {
        session: 'London',
        bias: 'Bullish',
        key_level: 'Daily Support (2015)',
        key_level_tap: 'YES',
        cisd: 'YES',
        trade_date: '2024-01-18',
        trade_time: '10:45',
        direction: 'BUY',
        result: 'TP',
        risk: 40.00,
        why_this_trade: 'Tapped Daily Support with strong buying volume. Confirmed on M15.',
        emotion_mindset: 'Confident, no emotions interfering.',
        mistake_improve: 'Could have trailed the stop loss to secure more gains.'
      },
      {
        session: 'NY',
        bias: 'Bearish',
        key_level: 'H1 Resistance (15300)',
        key_level_tap: 'YES',
        cisd: 'YES',
        trade_date: '2024-01-19',
        trade_time: '16:30',
        direction: 'SELL',
        result: 'TP',
        risk: 30.00,
        why_this_trade: 'Tapped structural resistance at 15300, clear rejection candles.',
        emotion_mindset: 'Patient, execution was smooth.',
        mistake_improve: 'Exited early before target was reached due to end-of-day close.'
      }
    ];

    const insertQuery = `
      INSERT INTO trades (
        user_id, session, bias, key_level, key_level_tap, cisd,
        trade_date, trade_time, direction, result, net_pnl, outcome, risk,
        why_this_trade, emotion_mindset, mistake_improve
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;

    for (const trade of sampleTrades) {
      const outcome = trade.result === 'TP' ? 'WIN' : 'LOSS';
      const net_pnl = trade.result === 'TP' ? Math.abs(trade.risk) : -Math.abs(trade.risk);

      await db.query(insertQuery, [
        userId,
        trade.session,
        trade.bias,
        trade.key_level,
        trade.key_level_tap,
        trade.cisd,
        trade.trade_date,
        trade.trade_time,
        trade.direction,
        trade.result,
        net_pnl,
        outcome,
        trade.risk,
        trade.why_this_trade,
        trade.emotion_mindset,
        trade.mistake_improve
      ]);
    }

    console.log('Database seeded successfully with PostgreSQL demo data!');
  } catch (error) {
    console.error('Error during PostgreSQL database seeding:', error);
  }
}

module.exports = seed;
