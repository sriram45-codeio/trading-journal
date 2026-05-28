const db = require('../db/database');

async function createTrade(req, res) {
  const {
    session, bias, key_level, key_level_tap, cisd,
    trade_date, trade_time, direction, result, risk,
    why_this_trade, emotion_mindset, mistake_improve
  } = req.body;

  if (!trade_date || !direction || !result) {
    return res.status(400).json({
      error: 'Missing required fields (Date, Direction, Result)'
    });
  }

  const normalizedDirection = ['BUY', 'LONG'].includes(direction.toUpperCase()) ? 'BUY' : 'SELL';
  const normalizedResult = result.toUpperCase() === 'TP' ? 'TP' : 'LOSS';
  const tapVal = ['YES', 'NO'].includes(String(key_level_tap).toUpperCase()) ? String(key_level_tap).toUpperCase() : 'NO';
  
  // Calculate net_pnl from risk and result
  const riskVal = risk ? parseFloat(risk) : 0;
  const net_pnl = normalizedResult === 'TP' ? Math.abs(riskVal) : -Math.abs(riskVal);
  const outcome = normalizedResult === 'TP' ? 'WIN' : 'LOSS';

  try {
    const insertResult = await db.query(`
      INSERT INTO trades (
        user_id, session, bias, key_level, key_level_tap, cisd,
        trade_date, trade_time, direction, result, net_pnl, outcome, risk,
        why_this_trade, emotion_mindset, mistake_improve
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      req.user.id,
      session || null,
      bias || null,
      key_level || null,
      tapVal,
      cisd || null,
      trade_date,
      trade_time || null,
      normalizedDirection,
      normalizedResult,
      net_pnl,
      outcome,
      riskVal || null,
      why_this_trade || null,
      emotion_mindset || null,
      mistake_improve || null
    ]);

    const trade = insertResult.rows[0];
    res.status(201).json(trade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllTrades(req, res) {
  const { asset, outcome } = req.query;

  try {
    let query = 'SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL';
    const params = [req.user.id];
    let paramCount = 1;

    if (asset) {
      paramCount++;
      query += ` AND (session ILIKE $${paramCount} OR bias ILIKE $${paramCount} OR key_level ILIKE $${paramCount} OR why_this_trade ILIKE $${paramCount})`;
      const likeParam = `%${asset}%`;
      params.push(likeParam);
    }

    if (outcome) {
      paramCount++;
      query += ` AND outcome = $${paramCount}`;
      params.push(outcome);
    }

    query += ' ORDER BY trade_date DESC, created_at DESC';

    const tradesRes = await db.query(query, params);
    res.status(200).json({ trades: tradesRes.rows });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateTrade(req, res) {
  const tradeId = req.params.id;
  const {
    session, bias, key_level, key_level_tap, cisd,
    trade_date, trade_time, direction, result, risk,
    why_this_trade, emotion_mindset, mistake_improve
  } = req.body;

  try {
    const existingTradeRes = await db.query('SELECT * FROM trades WHERE id = $1 AND deleted_at IS NULL', [tradeId]);
    const existingTrade = existingTradeRes.rows[0];

    if (!existingTrade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (existingTrade.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedDirection = direction ? (['BUY', 'LONG'].includes(direction.toUpperCase()) ? 'BUY' : 'SELL') : existingTrade.direction;
    const updatedResult = result ? (result.toUpperCase() === 'TP' ? 'TP' : 'LOSS') : existingTrade.result;
    const tapVal = key_level_tap ? (['YES', 'NO'].includes(String(key_level_tap).toUpperCase()) ? String(key_level_tap).toUpperCase() : 'NO') : existingTrade.key_level_tap;
    const riskVal = risk !== undefined ? (risk ? parseFloat(risk) : null) : existingTrade.risk;
    
    // Recalculate net_pnl from risk and result
    const effectiveRisk = riskVal || 0;
    const net_pnl = updatedResult === 'TP' ? Math.abs(effectiveRisk) : -Math.abs(effectiveRisk);
    const outcome = updatedResult === 'TP' ? 'WIN' : 'LOSS';

    const updateResult = await db.query(`
      UPDATE trades SET
        session = $1, bias = $2, key_level = $3, key_level_tap = $4, cisd = $5,
        trade_date = $6, trade_time = $7, direction = $8, result = $9, net_pnl = $10, outcome = $11, risk = $12,
        why_this_trade = $13, emotion_mindset = $14, mistake_improve = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 AND user_id = $17
      RETURNING *
    `, [
      session !== undefined ? session : existingTrade.session,
      bias !== undefined ? bias : existingTrade.bias,
      key_level !== undefined ? key_level : existingTrade.key_level,
      tapVal,
      cisd !== undefined ? cisd : existingTrade.cisd,
      trade_date || existingTrade.trade_date,
      trade_time !== undefined ? trade_time : existingTrade.trade_time,
      updatedDirection,
      updatedResult,
      net_pnl,
      outcome,
      riskVal,
      why_this_trade !== undefined ? why_this_trade : existingTrade.why_this_trade,
      emotion_mindset !== undefined ? emotion_mindset : existingTrade.emotion_mindset,
      mistake_improve !== undefined ? mistake_improve : existingTrade.mistake_improve,
      tradeId,
      req.user.id
    ]);

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteTrade(req, res) {
  const tradeId = req.params.id;

  try {
    const tradeRes = await db.query('SELECT * FROM trades WHERE id = $1 AND deleted_at IS NULL', [tradeId]);
    const trade = tradeRes.rows[0];

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (trade.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.query('UPDATE trades SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [tradeId]);
    res.status(200).json({ message: 'Trade archived successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createTrade, getAllTrades, updateTrade, deleteTrade };
