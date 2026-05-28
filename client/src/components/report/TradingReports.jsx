import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, AlertCircle, BarChart3, Trophy, Target,
  TrendingDown, Activity, RefreshCw, Download, Search,
  BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, Eye, FileText, SlidersHorizontal
} from 'lucide-react';
import api from '../../api/axios';
import Toast from '../Toast';

const POLL_INTERVAL = 30000;

export default function TradingReports() {
  const [trades, setTrades] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const pollRef = useRef(null);

  const fetchAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append('asset', searchText);
      if (outcomeFilter) params.append('outcome', outcomeFilter);
      const [tradesRes, analyticsRes] = await Promise.all([
        api.get(`/trades?${params.toString()}`),
        api.get('/analytics/summary'),
      ]);
      setTrades(tradesRes.data.trades);
      setAnalytics(analyticsRes.data);
      setLastUpdated(Date.now());
    } catch (err) {
      setToast({ message: 'Failed to load report data', type: 'error' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchText, outcomeFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    pollRef.current = setInterval(() => fetchAll(false), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  const filteredTrades = sessionFilter ? trades.filter(t => t.session === sessionFilter) : trades;

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get('/trades/export-pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'trading-report.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    } finally { setExportingPdf(false); }
  };

  const handleDownloadSinglePdf = async (tradeId) => {
    try {
      const response = await api.get(`/trades/${tradeId}/export-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url; a.download = `trade-${tradeId}-report.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to download trade PDF', type: 'error' });
    }
  };

  // ─── Loading Skeleton ───
  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            height: i === 0 ? '80px' : '120px', borderRadius: 'var(--radius-card)',
            background: 'var(--border-subtle)', marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            border: '1.5px solid var(--border-color)',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  const pnlColor = analytics?.total_net_pnl >= 0 ? 'var(--win-green)' : 'var(--loss-red)';

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: 'var(--radius-btn)',
              background: 'var(--accent-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 87, 34, 0.25)',
            }}>
              <FileText size={16} color="#fff" />
            </div>
            <h1 style={{
              fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px',
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Trading Reports</h1>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 44px', fontWeight: '500' }}>
            Real-time read-only analytics · {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''} ·{' '}
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => fetchAll(true)}
            className="kite-btn kite-btn-ghost"
            id="btn-refresh-reports"
            style={{ padding: '8px 14px' }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="kite-btn kite-btn-blue"
            id="btn-export-all-pdf"
            style={{ padding: '8px 16px' }}
          >
            <Download size={13} />
            {exportingPdf ? 'Generating…' : 'Export All PDF'}
          </button>
        </div>
      </div>

      {/* ── Analytics Summary ── */}
      {analytics && analytics.total_trades > 0 && (
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'stretch',
        }}>
          <StatCard icon={<BarChart3 size={15} />} label="Total Trades" value={analytics.total_trades} sub={`${analytics.total_wins}W · ${analytics.total_losses}L`} color="var(--accent-color)" />
          <StatCard icon={<TrendingUp size={15} />} label="Net P&L" value={`${analytics.total_net_pnl >= 0 ? '+' : ''}$${analytics.total_net_pnl.toFixed(2)}`} sub={analytics.total_net_pnl >= 0 ? 'Profitable' : 'Loss'} color={pnlColor} />
          <StatCard icon={<Trophy size={15} />} label="Win Rate" value={`${analytics.win_rate}%`} sub="of all trades" color={analytics.win_rate >= 50 ? 'var(--win-green)' : 'var(--loss-red)'} />
          <StatCard icon={<Target size={15} />} label="Discipline" value={`${analytics.rules_followed_rate}%`} sub="key level taps" color="var(--accent-color)" />
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)', padding: '12px 16px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', flexShrink: 0 }}>
          <SlidersHorizontal size={13} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Filter</span>
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '260px' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search…" value={searchText} onChange={e => setSearchText(e.target.value)} className="kite-input" style={{ paddingLeft: '28px', fontSize: '12.5px' }} id="report-search" />
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />
        {['', 'WIN', 'LOSS'].map(v => {
          const isActive = outcomeFilter === v;
          return (
            <button key={v} onClick={() => setOutcomeFilter(v)} style={{
              padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
              borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
              background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
              color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
            }}>{v === '' ? 'All' : v === 'WIN' ? '✦ Wins' : '✦ Losses'}</button>
          );
        })}
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />
        {['', 'London', 'NY', 'Asia', 'Pre-Market'].map(v => {
          const isActive = sessionFilter === v;
          return (
            <button key={v} onClick={() => setSessionFilter(v)} style={{
              padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
              borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
              background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
              color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
            }}>{v || 'All Sessions'}</button>
          );
        })}
      </div>

      {/* ── Trade Report Cards (View Only) ── */}
      {filteredTrades.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 87, 34, 0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-color)' }} />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 6px', fontWeight: '700' }}>No trade reports found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>Log some trades from the Trade Log page first</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTrades.map((trade, index) => (
            <ReportRunsheet key={trade.id} trade={trade} index={index} onDownloadPdf={handleDownloadSinglePdf} />
          ))}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
              Showing {filteredTrades.length} report{filteredTrades.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px rgba(255, 87, 34, 0.4)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live · auto-refreshes every 30s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Fully expanded report runsheet card for each trade (view-only, always open) ── */
function ReportRunsheet({ trade, index, onDownloadPdf }) {
  const isWin = trade.outcome === 'WIN';
  const pnlPos = trade.net_pnl > 0;
  const pnlNeg = trade.net_pnl < 0;
  const isBuy = trade.direction === 'BUY';
  const pnlColor = pnlPos ? 'var(--win-green)' : pnlNeg ? 'var(--loss-red)' : 'var(--text-muted)';
  const dirColor = isBuy ? 'var(--buy-blue)' : 'var(--sell-red)';

  return (
    <div
      className="stagger-fade-in"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 87, 34, 0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
      id={`report-card-${trade.id}`}
    >
      {/* ── Header Row ── */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        borderBottom: '1.5px solid var(--border-color)',
        background: 'var(--bg-primary)',
      }}>
        {/* Direction Icon */}
        <div style={{
          width: '42px', height: '42px', borderRadius: 'var(--radius-btn)', flexShrink: 0,
          background: isBuy ? 'rgba(65, 132, 243, 0.08)' : 'rgba(223, 81, 76, 0.08)',
          border: `1.5px solid ${isBuy ? 'rgba(65, 132, 243, 0.25)' : 'rgba(223, 81, 76, 0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isBuy ? <ArrowUpRight size={20} color="var(--buy-blue)" /> : <ArrowDownRight size={20} color="var(--sell-red)" />}
        </div>

        {/* Trade Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Trade #{trade.id}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} /> {trade.trade_date}
            </span>
            {trade.trade_time && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> {trade.trade_time}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {trade.session && <Chip label={trade.session} color="var(--accent-color)" />}
            {trade.bias && <Chip label={trade.bias} color={trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : 'var(--text-muted)'} />}
            <Chip label={trade.direction} color={dirColor} />
          </div>
        </div>

        {/* P&L + Outcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {trade.risk != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risk</div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>${trade.risk.toFixed(0)}</span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net P&L</div>
            <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: pnlColor, letterSpacing: '-0.5px' }}>
              {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
            </span>
          </div>
          <span style={{
            padding: '5px 14px', borderRadius: 'var(--radius-badge)', fontSize: '12px', fontWeight: '800',
            background: isWin ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
            color: isWin ? 'var(--win-green)' : 'var(--loss-red)',
            border: `1.5px solid ${isWin ? 'rgba(0, 162, 124, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`,
          }}>
            {trade.outcome}
          </span>
          <button
            onClick={() => onDownloadPdf(trade.id)}
            title="Download PDF Runsheet"
            style={{
              width: '34px', height: '34px', borderRadius: 'var(--radius-btn)',
              background: 'rgba(255, 87, 34, 0.08)', border: '1.5px solid rgba(255, 87, 34, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--accent-color)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 87, 34, 0.15)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 87, 34, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 87, 34, 0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            id={`btn-pdf-report-${trade.id}`}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* ── Checklist Verification Row ── */}
      <div style={{
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
      }}>
        <MetricItem label="Key Level" value={trade.key_level || '—'} />
        <BoolItem label="Tap" value={trade.key_level_tap} />
        <BoolItem label="CISD" value={trade.cisd || 'NO'} />
        <MetricItem label="Session" value={trade.session || '—'} />
        <MetricItem label="Bias" value={trade.bias || '—'} color={trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : undefined} />
        <MetricItem label="Direction" value={trade.direction} color={dirColor} />
        <MetricItem label="Result" value={trade.result} color={trade.result === 'TP' ? 'var(--win-green)' : 'var(--loss-red)'} />
      </div>

      {/* ── Narrative Logs (Always Visible) ── */}
      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
        <NarrativeBlock icon={<BookOpen size={13} />} label="Why This Trade?" content={trade.why_this_trade} color="var(--accent-color)" bg="var(--bg-secondary)" border="var(--border-color)" />
        <NarrativeBlock icon={<Brain size={13} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="var(--accent-color)" bg="var(--bg-secondary)" border="var(--border-color)" />
        <NarrativeBlock icon={<ShieldAlert size={13} />} label="Improvements" content={trade.mistake_improve} color="var(--loss-red)" bg="var(--bg-secondary)" border="var(--border-color)" />
      </div>
    </div>
  );
}

/* ── Small sub-components ── */
function Chip({ label, color }) {
  return (
    <span style={{
      fontSize: '10.5px', fontWeight: '700', color,
      background: `${color}15`, padding: '2px 9px', borderRadius: '99px',
      border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

function MetricItem({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</div>
      <span style={{ fontSize: '12px', color: color || 'var(--text-primary)', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

function BoolItem({ label, value }) {
  const isYes = value === 'YES';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: isYes ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
        border: `1.5px solid ${isYes ? 'var(--win-green)' : 'var(--loss-red)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: '10px', fontWeight: '800',
        color: isYes ? 'var(--win-green)' : 'var(--loss-red)',
      }}>
        {isYes ? '✓' : '✗'}
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color, bg, border }) {
  return (
    <div style={{
      background: bg || 'var(--bg-secondary)',
      border: `1.5px solid ${border || 'var(--border-color)'}`,
      borderRadius: 'var(--radius-card)', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
      borderRadius: 'var(--radius-card)', padding: '16px 20px', flex: 1, minWidth: '140px',
      backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: color || 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
