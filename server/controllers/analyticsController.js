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
    const total_net_pnl = trades.reduce((sum, t) => sum + t.net_pnl, 0).toFixed(2);

    const avg_win_pnl = total_wins > 0
      ? (wins.reduce((s, t) => s + t.net_pnl, 0) / total_wins).toFixed(2)
      : 0;

    const avg_loss_pnl = total_losses > 0
      ? (losses.reduce((s, t) => s + t.net_pnl, 0) / total_losses).toFixed(2)
      : 0;

    // Use key_level_tap === 'YES' as our "discipline / rules followed" metric!
    const rulesFollowedCount = trades.filter(t => t.key_level_tap === 'YES').length;
    const rules_followed_rate = total_trades > 0
      ? ((rulesFollowedCount / total_trades) * 100).toFixed(2)
      : 0;

    const tradesByDate = {};
    trades.forEach(t => {
      if (!tradesByDate[t.trade_date]) tradesByDate[t.trade_date] = 0;
      tradesByDate[t.trade_date] += t.net_pnl;
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

module.exports = { getSummary };
