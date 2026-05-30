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
      
      // Refresh trades list to update their running balances
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
      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '40px', width: '200px', background: 'var(--bg-card)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: '110px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <div style={{ height: '300px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  const startingCapital = Number(capitalData?.starting_capital ?? 0);
  const totalNetPnl = Number(capitalData?.total_net_pnl ?? 0);
  const currentBalance = Number(capitalData?.current_balance ?? 0);

  const pnlPos = totalNetPnl > 0;
  const pnlNeg = totalNetPnl < 0;

  // Sort trades chronologically (oldest first) to assign sequential trade numbers
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
    <div style={{ padding: '24px 30px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Capital & Balance Tracking</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Track your account balance dynamically with each trade taken</p>
        </div>
        <button
          onClick={fetchData}
          className="kite-btn kite-btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(223, 81, 76, 0.08)',
          border: '1.5px solid var(--loss-red)',
          color: 'var(--loss-red)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-card)',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* Capital Setup and Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Starting Capital Form */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(255, 87, 34, 0.08)',
              padding: '10px',
              borderRadius: 'var(--radius-btn)',
              color: 'var(--accent-color)'
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Initial Capital</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                ${startingCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="kite-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-btn)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <Edit size={13} />
                Set Initial Capital
              </button>
            ) : (
              <form onSubmit={handleUpdateCapital} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    step="0.01"
                    value={newCapital}
                    onChange={(e) => setNewCapital(e.target.value)}
                    placeholder="e.g. 5000"
                    className="kite-input"
                    style={{ paddingLeft: '24px', width: '130px', fontSize: '13px', height: '36px' }}
                    autoFocus
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  className="kite-btn kite-btn-blue"
                  style={{ padding: '0 12px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submitting}
                  title="Save Capital"
                >
                  {submitting ? 'Saving...' : <Check size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setNewCapital(capitalData.starting_capital.toString()); }}
                  className="kite-btn kite-btn-ghost"
                  style={{ padding: '0 12px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submitting}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Starting Capital */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <span style={cardLabelStyle}>Starting Capital</span>
              <Wallet size={16} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              ${startingCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Base funding account size</div>
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
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Cumulative returns of {trades.length} trade{trades.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Card 3: Current Account Balance */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <span style={cardLabelStyle}>Current Account Balance</span>
              <DollarSign size={16} color="var(--accent-color)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Available capital balance</div>
          </div>

        </div>

      </div>

      {/* Trade Log with running balance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '10px 0 0' }}>Trade Balance Breakdown</h3>
        
        {trades.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
          }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '13.5px', margin: '0 0 6px', fontWeight: '700' }}>No trade logs registered</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Add trades under the dashboard or trade form to compute running balances.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Trade No</th>
                  <th style={{ padding: '12px 16px' }}>Asset Details</th>
                  <th style={{ padding: '12px 16px' }}>Direction</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Risk ($)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>R:R Ratio</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Outcome</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net P&L ($)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Account Balance</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const isBuy = trade.direction === 'BUY';
                  const isWin = trade.outcome === 'WIN';
                  const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
                  
                  return (
                    <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }} className="table-row-hover">
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{trade.trade_date}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: '700' }}>Trade {tradeNumberMap[trade.id] || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ background: 'rgba(255, 87, 34, 0.08)', color: 'var(--accent-color)', padding: '1px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '600', border: '1px solid rgba(255, 87, 34, 0.2)' }}>
                            {trade.session || 'London'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {trade.bias} {trade.key_level ? `| ${trade.key_level}` : ''}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          color: isBuy ? 'var(--buy-blue)' : 'var(--sell-red)', fontWeight: '700', fontSize: '11px'
                        }}>
                          {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        ${trade.risk != null ? trade.risk.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>
                        {trade.rr_ratio || '1:1'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', padding: '2px 8px', borderRadius: 'var(--radius-badge)',
                          fontSize: '10px', fontWeight: '800',
                          background: isWin ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
                          color: isWin ? 'var(--win-green)' : 'var(--loss-red)',
                          border: `1px solid ${isWin ? 'rgba(0, 162, 124, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`
                        }}>
                          {trade.outcome}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: pnlColor }}>
                        {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-primary)' }}>
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
  border: '1.5px solid var(--border-color)',
  borderRadius: 'var(--radius-card)',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
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
  letterSpacing: '0.04em'
};
