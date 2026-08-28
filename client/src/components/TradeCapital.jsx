import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Edit, Check, X, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api/axios';

export default function TradeCapital() {
  const [capitalData, setCapitalData] = useState({
    starting_capital: 0,
    total_net_pnl: 0,
    current_balance: 0
  });
  const [trades, setTrades] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCapital, setNewCapital] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const capitalRes = await api.get('/analytics/capital');
      setCapitalData(capitalRes.data);
      setNewCapital(capitalRes.data.starting_capital.toString());

      const tradesRes = await api.get('/trades');
      setTrades(tradesRes.data.trades);
    } catch (err) {
      console.error('Error fetching capital data:', err);
      const serverMsg = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to load capital data: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCapital = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(newCapital);
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid non-negative starting capital amount.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/analytics/capital', {
        starting_capital: parseFloat(newCapital)
      });
      setCapitalData(res.data);
      setIsEditing(false);
      
      const tradesRes = await api.get('/trades');
      setTrades(tradesRes.data.trades);
    } catch (err) {
      console.error('Error updating capital:', err);
      const serverMsg = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to update starting capital: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '40px', width: '200px', background: 'var(--bg-card)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '110px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  const startingCapital = Number(capitalData?.starting_capital ?? 0);
  const totalNetPnl = Number(capitalData?.total_net_pnl ?? 0);
  const currentBalance = Number(capitalData?.current_balance ?? 0);

  const pnlPos = totalNetPnl > 0;
  const pnlNeg = totalNetPnl < 0;

  const chronologicalTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.trade_date + (a.trade_time ? 'T' + a.trade_time : 'T00:00:00'));
    const dateB = new Date(b.trade_date + (b.trade_time ? 'T' + b.trade_time : 'T00:00:00'));
    if (dateA - dateB !== 0) return dateA - dateB;
    return a.id - b.id;
  });
  const tradeNumberMap = {};
  chronologicalTrades.forEach((t, i) => {
    tradeNumberMap[t.id] = i + 1;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>Capital & Balance Manager</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Dynamically compute running account balances and total capital progression</p>
        </div>
        <button
          onClick={fetchData}
          className="kite-btn kite-btn-ghost"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      {/* Starting Capital Control Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-light)',
            padding: '10px',
            borderRadius: '8px',
            color: 'var(--accent-color)'
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Starting Capital</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              ${startingCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="kite-btn kite-btn-blue"
            >
              <Edit size={13} />
              Set Initial Capital
            </button>
          ) : (
            <form onSubmit={handleUpdateCapital} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <DollarSign size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  step="0.01"
                  value={newCapital}
                  onChange={(e) => setNewCapital(e.target.value)}
                  placeholder="5000"
                  className="kite-input"
                  style={{ paddingLeft: '24px', width: '130px', fontSize: '13px' }}
                  autoFocus
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                className="kite-btn kite-btn-blue"
                disabled={submitting}
              >
                {submitting ? 'Saving…' : <Check size={14} />}
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setNewCapital(capitalData.starting_capital.toString()); }}
                className="kite-btn kite-btn-ghost"
                disabled={submitting}
              >
                <X size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Financial Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Initial Capital */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>Initial Capital</span>
            <Wallet size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            ${startingCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Base funding account size</div>
        </div>

        {/* Card 2: Total Net P&L */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>Total Net P&L</span>
            {pnlPos ? (
              <TrendingUp size={16} color="var(--win-green)" />
            ) : (
              <TrendingDown size={16} color="var(--loss-red)" />
            )}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            fontFamily: 'monospace',
            color: pnlPos ? 'var(--win-green)' : pnlNeg ? 'var(--loss-red)' : 'var(--text-muted)'
          }}>
            {pnlPos ? '+' : ''}${totalNetPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Cumulative returns over {trades.length} trade{trades.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Card 3: Current Balance */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardLabelStyle}>Current Account Balance</span>
            <DollarSign size={16} color="var(--accent-color)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Available capital balance</div>
        </div>

      </div>

      {/* Trade Balance Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 0' }}>Trade Balance Breakdown</h3>
        
        {trades.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
          }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 4px', fontWeight: '700' }}>No trade logs registered</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>Log trades in the journal to view dynamic balance calculations.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
            <table className="kite-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trade No</th>
                  <th>Setup / Session</th>
                  <th>Direction</th>
                  <th style={{ textAlign: 'right' }}>Risk ($)</th>
                  <th style={{ textAlign: 'center' }}>R:R</th>
                  <th style={{ textAlign: 'center' }}>Outcome</th>
                  <th style={{ textAlign: 'right' }}>Net P&L</th>
                  <th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const isBuy = trade.direction === 'BUY';
                  const isWin = trade.outcome === 'WIN';
                  const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
                  
                  return (
                    <tr key={trade.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{trade.trade_date}</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-color)' }}>Trade {tradeNumberMap[trade.id] || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '1px 7px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '600' }}>
                            {trade.session || 'London'}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {trade.bias} {trade.key_level ? `| ${trade.key_level}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          color: isBuy ? 'var(--buy-blue)' : 'var(--sell-red)', fontWeight: '700', fontSize: '11px'
                        }}>
                          {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        ${trade.risk != null ? trade.risk.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>
                        {trade.rr_ratio || '1:1'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={isWin ? 'badge-win' : 'badge-loss'}>
                          {trade.outcome}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: pnlColor }}>
                        {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ${trade.balance_after ? trade.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-card)',
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  boxShadow: 'var(--shadow-card)'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const cardLabelStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};
