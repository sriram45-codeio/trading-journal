const db = require('../db/database');

// Parse "1:2" → 2, "1:3" → 3, etc. Default to 1 if invalid.
function parseRRMultiplier(rrStr) {
  if (!rrStr) return 1;
  const parts = String(rrStr).split(':');
  if (parts.length === 2) {
    const multiplier = parseFloat(parts[1]);
    if (!isNaN(multiplier) && multiplier > 0) return multiplier;
  }
  return 1;
}

async function createTrade(req, res) {
  const {
    session, bias, key_level, key_level_tap, cisd,
    trade_date, trade_time, direction, result, risk, rr_ratio,
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
  
  // Validate rr_ratio — allow any positive numeric ratio format e.g. 1:X where X is positive
  const isValidRR = rr_ratio && /^1:\d+(\.\d+)?$/.test(String(rr_ratio));
  const normalizedRR = isValidRR ? String(rr_ratio) : '1:1';
  const rrMultiplier = parseRRMultiplier(normalizedRR);
  
  // Calculate net_pnl from risk, result, and R:R ratio
  const riskVal = risk ? parseFloat(risk) : 0;
  const net_pnl = normalizedResult === 'TP' ? Math.abs(riskVal) * rrMultiplier : -Math.abs(riskVal);
  const outcome = normalizedResult === 'TP' ? 'WIN' : 'LOSS';

  try {
    const insertResult = await db.query(`
      INSERT INTO trades (
        user_id, session, bias, key_level, key_level_tap, cisd,
        trade_date, trade_time, direction, result, net_pnl, outcome, risk, rr_ratio,
        why_this_trade, emotion_mindset, mistake_improve
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      normalizedRR,
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

async function getRunningBalancesMap(userId) {
  const userRes = await db.query('SELECT starting_capital FROM users WHERE id = $1', [userId]);
  const rawCap = userRes.rows[0]?.starting_capital;
  const startingCapital = (rawCap !== null && rawCap !== undefined && !isNaN(parseFloat(rawCap))) 
    ? parseFloat(rawCap) 
    : 0.0;

  const tradesRes = await db.query(
    'SELECT id, net_pnl FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date ASC, created_at ASC, id ASC',
    [userId]
  );

  const balanceMap = {};
  let currentBalance = startingCapital;
  tradesRes.rows.forEach(t => {
    currentBalance += parseFloat(t.net_pnl);
    balanceMap[t.id] = parseFloat(currentBalance.toFixed(2));
  });

  return { startingCapital, balanceMap };
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

    query += ' ORDER BY trade_date DESC, created_at DESC, id DESC';

    const tradesRes = await db.query(query, params);
    const { startingCapital, balanceMap } = await getRunningBalancesMap(req.user.id);
    
    const trades = tradesRes.rows.map(t => ({
      ...t,
      balance_after: balanceMap[t.id] !== undefined ? balanceMap[t.id] : startingCapital
    }));

    res.status(200).json({ trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateTrade(req, res) {
  const tradeId = req.params.id;
  const {
    session, bias, key_level, key_level_tap, cisd,
    trade_date, trade_time, direction, result, risk, rr_ratio,
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
    
    // Validate and normalize rr_ratio — allow any positive numeric ratio format e.g. 1:X where X is positive
    let updatedRR = existingTrade.rr_ratio || '1:1';
    if (rr_ratio !== undefined) {
      const isValidRR = rr_ratio && /^1:\d+(\.\d+)?$/.test(String(rr_ratio));
      updatedRR = isValidRR ? String(rr_ratio) : '1:1';
    }
    const rrMultiplier = parseRRMultiplier(updatedRR);
    
    // Recalculate net_pnl from risk, result, and R:R ratio
    const effectiveRisk = riskVal || 0;
    const net_pnl = updatedResult === 'TP' ? Math.abs(effectiveRisk) * rrMultiplier : -Math.abs(effectiveRisk);
    const outcome = updatedResult === 'TP' ? 'WIN' : 'LOSS';

    const updateResult = await db.query(`
      UPDATE trades SET
        session = $1, bias = $2, key_level = $3, key_level_tap = $4, cisd = $5,
        trade_date = $6, trade_time = $7, direction = $8, result = $9, net_pnl = $10, outcome = $11, risk = $12, rr_ratio = $13,
        why_this_trade = $14, emotion_mindset = $15, mistake_improve = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17 AND user_id = $18
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
      updatedRR,
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
