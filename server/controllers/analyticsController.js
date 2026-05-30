const db = require('../db/database');

async function getSummary(req, res) {
  try {
    const tradesRes = await db.query(
      'SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date ASC',
      [req.user.id]
    );
    
    const trades = tradesRes.rows;
    const total_trades = trades.length;

    if (total_trades === 0) {
      return res.status(200).json({
        total_trades: 0, total_wins: 0, total_losses: 0,
        win_rate: 0, total_net_pnl: 0, avg_win: 0, avg_win_pnl: 0, avg_loss_pnl: 0,
        rules_followed_rate: 0, pnl_by_date: []
      });
    }

    const wins = trades.filter(t => t.outcome === 'WIN');
    const losses = trades.filter(t => t.outcome === 'LOSS');

    const total_wins = wins.length;
    const total_losses = losses.length;

    const win_rate = total_trades > 0 ? ((total_wins / total_trades) * 100).toFixed(2) : 0;
    const total_net_pnl = trades.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0).toFixed(2);

    const avg_win_pnl = total_wins > 0
      ? (wins.reduce((s, t) => s + parseFloat(t.net_pnl || 0), 0) / total_wins).toFixed(2)
      : 0;

    const avg_loss_pnl = total_losses > 0
      ? (losses.reduce((s, t) => s + parseFloat(t.net_pnl || 0), 0) / total_losses).toFixed(2)
      : 0;

    // Use key_level_tap === 'YES' as our "discipline / rules followed" metric!
    const rulesFollowedCount = trades.filter(t => t.key_level_tap === 'YES').length;
    const rules_followed_rate = total_trades > 0
      ? ((rulesFollowedCount / total_trades) * 100).toFixed(2)
      : 0;

    const tradesByDate = {};
    trades.forEach(t => {
      if (!tradesByDate[t.trade_date]) tradesByDate[t.trade_date] = 0;
      tradesByDate[t.trade_date] += parseFloat(t.net_pnl || 0);
    });

    const sortedDates = Object.keys(tradesByDate).sort();
    let cumulative = 0;
    const pnl_by_date = sortedDates.map(date => {
      cumulative += tradesByDate[date];
      return { trade_date: date, cumulative_pnl: parseFloat(cumulative.toFixed(2)) };
    });

    res.status(200).json({
      total_trades, total_wins, total_losses,
      win_rate: parseFloat(win_rate),
      total_net_pnl: parseFloat(total_net_pnl),
      avg_win: parseFloat(avg_win_pnl),
      avg_win_pnl: parseFloat(avg_win_pnl),
      avg_loss_pnl: parseFloat(avg_loss_pnl),
      rules_followed_rate: parseFloat(rules_followed_rate),
      pnl_by_date
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCapital(req, res) {
  try {
    let startingCapital = 0.0;
    
    try {
      const userRes = await db.query('SELECT starting_capital FROM users WHERE id = $1', [req.user.id]);
      const rawCap = userRes.rows[0]?.starting_capital;
      startingCapital = (rawCap !== null && rawCap !== undefined && !isNaN(parseFloat(rawCap))) 
        ? parseFloat(rawCap) 
        : 0.0;
    } catch (colErr) {
      console.error('getCapital SELECT failed, column may not exist:', colErr.message);
      // Column might not exist — add it and return 0
      try {
        await db.query('ALTER TABLE users ADD COLUMN starting_capital NUMERIC(15, 2) DEFAULT 0.00');
        console.log('Added starting_capital column on-the-fly');
      } catch (alterErr) {
        console.log('ALTER TABLE result:', alterErr.message);
      }
      startingCapital = 0.0;
    }
    
    const pnlRes = await db.query(
      'SELECT COALESCE(SUM(net_pnl), 0) as total_pnl FROM trades WHERE user_id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );
    const totalNetPnl = parseFloat(pnlRes.rows[0].total_pnl || 0);
    const currentBalance = parseFloat((startingCapital + totalNetPnl).toFixed(2));
    
    res.status(200).json({
      starting_capital: startingCapital,
      total_net_pnl: parseFloat(totalNetPnl.toFixed(2)),
      current_balance: currentBalance
    });
  } catch (error) {
    console.error('Get capital error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to get capital: ' + error.message });
  }
}

async function updateCapital(req, res) {
  try {
    const { starting_capital } = req.body;
    console.log('updateCapital called with body:', req.body, 'user:', req.user?.id);
    
    if (starting_capital === undefined || starting_capital === null || isNaN(parseFloat(starting_capital))) {
      return res.status(400).json({ error: 'starting_capital must be a valid number' });
    }
    const capitalVal = parseFloat(starting_capital);
    
    // Try to update; if column doesn't exist, create it first
    try {
      await db.query('UPDATE users SET starting_capital = $1 WHERE id = $2', [capitalVal, req.user.id]);
    } catch (updateErr) {
      console.error('UPDATE starting_capital failed, attempting to add column:', updateErr.message);
      // Column might not exist on this database — add it and retry
      try {
        await db.query('ALTER TABLE users ADD COLUMN starting_capital NUMERIC(15, 2) DEFAULT 0.00');
      } catch (alterErr) {
        // Column might already exist in another schema — ignore
        console.log('ALTER TABLE result:', alterErr.message);
      }
      // Retry the update
      await db.query('UPDATE users SET starting_capital = $1 WHERE id = $2', [capitalVal, req.user.id]);
    }
    
    const pnlRes = await db.query(
      'SELECT COALESCE(SUM(net_pnl), 0) as total_pnl FROM trades WHERE user_id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );
    const totalNetPnl = parseFloat(pnlRes.rows[0].total_pnl || 0);
    const currentBalance = parseFloat((capitalVal + totalNetPnl).toFixed(2));
    
    res.status(200).json({
      starting_capital: capitalVal,
      total_net_pnl: parseFloat(totalNetPnl.toFixed(2)),
      current_balance: currentBalance
    });
  } catch (error) {
    console.error('Update capital error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update capital: ' + error.message });
  }
}

async function getMonthlyReport(req, res) {
  try {
    const userRes = await db.query('SELECT starting_capital FROM users WHERE id = $1', [req.user.id]);
    const rawCap = userRes.rows[0]?.starting_capital;
    const startingCapital = (rawCap !== null && rawCap !== undefined && !isNaN(parseFloat(rawCap))) 
      ? parseFloat(rawCap) 
      : 0.0;
    
    const tradesRes = await db.query(
      'SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date ASC, created_at ASC, id ASC',
      [req.user.id]
    );
    
    const trades = tradesRes.rows;
    
    const monthlyGroups = {};
    let currentBalance = startingCapital;
    
    trades.forEach(t => {
      currentBalance += parseFloat(t.net_pnl);
      t.balance_after = parseFloat(currentBalance.toFixed(2));
      
      let dateStr = "";
      if (typeof t.trade_date === 'string') {
        dateStr = t.trade_date;
      } else if (t.trade_date instanceof Date) {
        const year = t.trade_date.getFullYear();
        const month = String(t.trade_date.getMonth() + 1).padStart(2, '0');
        const day = String(t.trade_date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (t.trade_date) {
        dateStr = String(t.trade_date);
      } else {
        dateStr = new Date().toISOString().substring(0, 10);
      }
      const monthKey = dateStr.substring(0, 7); // "YYYY-MM"
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          month: monthKey,
          trades: [],
          total_pnl: 0,
          wins: 0,
          losses: 0
        };
      }
      
      monthlyGroups[monthKey].trades.push(t);
      monthlyGroups[monthKey].total_pnl += parseFloat(t.net_pnl);
      if (t.outcome === 'WIN') {
        monthlyGroups[monthKey].wins++;
      } else {
        monthlyGroups[monthKey].losses++;
      }
    });
    
    const sortedMonths = Object.keys(monthlyGroups).sort();
    let runningStartingBalance = startingCapital;
    
    const reports = sortedMonths.map(monthKey => {
      const group = monthlyGroups[monthKey];
      const total_trades = group.trades.length;
      const win_rate = total_trades > 0 ? parseFloat(((group.wins / total_trades) * 100).toFixed(2)) : 0.0;
      
      const starting_balance = parseFloat(runningStartingBalance.toFixed(2));
      const ending_balance = parseFloat((starting_balance + group.total_pnl).toFixed(2));
      
      runningStartingBalance = ending_balance;
      
      const sortedTrades = [...group.trades].reverse();
      
      return {
        month: monthKey,
        total_trades,
        wins: group.wins,
        losses: group.losses,
        win_rate,
        total_net_pnl: parseFloat(group.total_pnl.toFixed(2)),
        starting_balance,
        ending_balance,
        trades: sortedTrades
      };
    });
    
    res.status(200).json({ reports: reports.reverse() });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getSummary, getCapital, updateCapital, getMonthlyReport };
