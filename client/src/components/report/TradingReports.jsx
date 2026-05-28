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
            height: i === 0 ? '80px' : '120px', borderRadius: '14px',
            background: 'rgba(139,92,246,0.06)', marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            border: '1.5px solid var(--border-color)',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  const pnlColor = analytics?.total_net_pnl >= 0 ? '#10b981' : '#f43f5e';

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
            }}>
              <FileText size={16} color="#fff" />
            </div>
            <h1 style={{
              fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px',
              background: 'linear-gradient(135deg, #c084fc 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Trading Reports</h1>
          </div>
          <p style={{ fontSize: '11.5px', color: '#8b92b6', margin: '2px 0 0 44px', fontWeight: '500' }}>
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
          <StatCard icon={<BarChart3 size={15} />} label="Total Trades" value={analytics.total_trades} sub={`${analytics.total_wins}W · ${analytics.total_losses}L`} color="#8b5cf6" />
          <StatCard icon={<TrendingUp size={15} />} label="Net P&L" value={`${analytics.total_net_pnl >= 0 ? '+' : ''}$${analytics.total_net_pnl.toFixed(2)}`} sub={analytics.total_net_pnl >= 0 ? 'Profitable' : 'Loss'} color={pnlColor} />
          <StatCard icon={<Trophy size={15} />} label="Win Rate" value={`${analytics.win_rate}%`} sub="of all trades" color={analytics.win_rate >= 50 ? '#10b981' : '#f43f5e'} />
          <StatCard icon={<Target size={15} />} label="Discipline" value={`${analytics.rules_followed_rate}%`} sub="key level taps" color="#a78bfa" />
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
        borderRadius: '14px', padding: '12px 16px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        backdropFilter: 'blur(10px)', boxShadow: '0 2px 16px rgba(139,92,246,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', flexShrink: 0 }}>
          <SlidersHorizontal size={13} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b5cf6' }}>Filter</span>
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '260px' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search…" value={searchText} onChange={e => setSearchText(e.target.value)} className="kite-input" style={{ paddingLeft: '28px', fontSize: '12.5px' }} id="report-search" />
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />
        {['', 'WIN', 'LOSS'].map(v => {
          const isActive = outcomeFilter === v;
          return (
            <button key={v} onClick={() => setOutcomeFilter(v)} style={{
              padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
              borderColor: isActive ? '#8b5cf6' : 'var(--border-color)',
              background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: isActive ? '#c084fc' : '#8b92b6',
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
              borderColor: isActive ? '#8b5cf6' : 'var(--border-color)',
              background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: isActive ? '#c084fc' : '#8b92b6',
            }}>{v || 'All Sessions'}</button>
          );
        })}
      </div>

      {/* ── Trade Report Cards (View Only) ── */}
      {filteredTrades.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
          borderRadius: '16px', boxShadow: '0 2px 16px rgba(139,92,246,0.06)',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertCircle size={28} style={{ color: '#8b5cf6' }} />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 6px', fontWeight: '700' }}>No trade reports found</p>
          <p style={{ color: '#8b92b6', fontSize: '12.5px', margin: 0 }}>Log some trades from the Trade Log page first</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTrades.map((trade, index) => (
            <ReportRunsheet key={trade.id} trade={trade} index={index} onDownloadPdf={handleDownloadSinglePdf} />
          ))}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#8b92b6', fontWeight: '500' }}>
              Showing {filteredTrades.length} report{filteredTrades.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
              <span style={{ fontSize: '11px', color: '#8b92b6' }}>Live · auto-refreshes every 30s</span>
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
  const pnlColor = pnlPos ? '#10b981' : pnlNeg ? '#f43f5e' : '#8b92b6';
  const dirColor = isBuy ? '#60a5fa' : '#f87171';

  return (
    <div
      className="stagger-fade-in"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 16px rgba(139,92,246,0.06)',
        transition: 'all 0.25s ease',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(139,92,246,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(139,92,246,0.06)'; }}
      id={`report-card-${trade.id}`}
    >
      {/* ── Header Row ── */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        borderBottom: '1.5px solid var(--border-color)',
        background: 'rgba(139,92,246,0.03)',
      }}>
        {/* Direction Icon */}
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: isBuy ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1.5px solid ${isBuy ? 'rgba(96,165,250,0.25)' : 'rgba(248,113,113,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isBuy ? <ArrowUpRight size={20} color="#60a5fa" /> : <ArrowDownRight size={20} color="#f87171" />}
        </div>

        {/* Trade Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#f5f3ff' }}>Trade #{trade.id}</span>
            <span style={{ fontSize: '12px', color: '#8b92b6', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} /> {trade.trade_date}
            </span>
            {trade.trade_time && (
              <span style={{ fontSize: '12px', color: '#8b92b6', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> {trade.trade_time}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {trade.session && <Chip label={trade.session} color="#c084fc" />}
            {trade.bias && <Chip label={trade.bias} color={trade.bias === 'Bullish' ? '#10b981' : trade.bias === 'Bearish' ? '#f43f5e' : '#8b92b6'} />}
            <Chip label={trade.direction} color={dirColor} />
          </div>
        </div>

        {/* P&L + Outcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {trade.risk != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risk</div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#8b92b6', fontFamily: 'monospace' }}>${trade.risk.toFixed(0)}</span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net P&L</div>
            <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: pnlColor, letterSpacing: '-0.5px' }}>
              {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
            </span>
          </div>
          <span style={{
            padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '800',
            background: isWin ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
            color: isWin ? '#10b981' : '#f43f5e',
            border: `1.5px solid ${isWin ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          }}>
            {trade.outcome}
          </span>
          <button
            onClick={() => onDownloadPdf(trade.id)}
            title="Download PDF Runsheet"
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#8b5cf6', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,92,246,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
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
        background: 'rgba(139,92,246,0.02)',
      }}>
        <MetricItem label="Key Level" value={trade.key_level || '—'} />
        <BoolItem label="Tap" value={trade.key_level_tap} />
        <BoolItem label="CISD" value={trade.cisd || 'NO'} />
        <MetricItem label="Session" value={trade.session || '—'} />
        <MetricItem label="Bias" value={trade.bias || '—'} color={trade.bias === 'Bullish' ? '#10b981' : trade.bias === 'Bearish' ? '#f43f5e' : undefined} />
        <MetricItem label="Direction" value={trade.direction} color={dirColor} />
        <MetricItem label="Result" value={trade.result} color={trade.result === 'TP' ? '#10b981' : '#f43f5e'} />
      </div>

      {/* ── Narrative Logs (Always Visible) ── */}
      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
        <NarrativeBlock icon={<BookOpen size={13} />} label="Why This Trade?" content={trade.why_this_trade} color="#8b5cf6" bg="rgba(139,92,246,0.06)" border="rgba(139,92,246,0.18)" />
        <NarrativeBlock icon={<Brain size={13} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="#c084fc" bg="rgba(192,132,252,0.06)" border="rgba(192,132,252,0.18)" />
        <NarrativeBlock icon={<ShieldAlert size={13} />} label="Improvements" content={trade.mistake_improve} color="#f43f5e" bg="rgba(244,63,94,0.06)" border="rgba(244,63,94,0.18)" />
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
      <div style={{ fontSize: '9.5px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</div>
      <span style={{ fontSize: '12px', color: color || '#cbd5e1', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

function BoolItem({ label, value }) {
  const isYes = value === 'YES';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: isYes ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
        border: `1.5px solid ${isYes ? '#10b981' : '#f43f5e'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: '10px', fontWeight: '800',
        color: isYes ? '#10b981' : '#f43f5e',
      }}>
        {isYes ? '✓' : '✗'}
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color, bg, border }) {
  return (
    <div style={{
      background: bg || 'rgba(139,92,246,0.04)',
      border: `1.5px solid ${border || 'var(--border-color)'}`,
      borderRadius: '12px', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
      borderRadius: '14px', padding: '16px 20px', flex: 1, minWidth: '140px',
      backdropFilter: 'blur(10px)', boxShadow: '0 2px 12px rgba(139,92,246,0.06)',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#8b92b6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: color || '#f5f3ff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#8b92b6', fontWeight: '500', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
