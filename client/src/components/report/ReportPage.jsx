import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, AlertCircle, BarChart3, Trophy, Target,
  TrendingDown, Activity, RefreshCw
} from 'lucide-react';
import api from '../../api/axios';
import TradeForm from '../TradeForm';
import EditModal from '../EditModal';
import Toast from '../Toast';
import ReportHeader from './ReportHeader';
import ReportFilters from './ReportFilters';
import TradeCard from './TradeCard';
import TradeDetailDrawer from './TradeDetailDrawer';
import DeleteConfirmModal from './DeleteConfirmModal';

const POLL_INTERVAL = 30000;

function SummaryStatBox({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      background: bg || '#fff',
      border: '1.5px solid #e0f2fe',
      borderRadius: '14px',
      padding: '18px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      flex: 1,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(6,182,212,0.07)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(6,182,212,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(6,182,212,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px',
          background: color ? `${color}14` : '#e0f2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: color || '#0891b2' }}>{icon}</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: color || '#0f172a', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: '500' }}>{sub}</div>}
    </div>
  );
}

function WinRateMiniRing({ rate }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} stroke="#e0f2fe" strokeWidth="6" fill="none" />
      <circle
        cx="36" cy="36" r={r}
        stroke={rate >= 50 ? '#06b6d4' : '#f43f5e'}
        strokeWidth="6" fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        style={{ fill: rate >= 50 ? '#06b6d4' : '#f43f5e', fontSize: '13px', fontWeight: '800', fontFamily: 'Inter, sans-serif' }}>
        {rate}%
      </text>
    </svg>
  );
}

export default function ReportPage() {
  const [trades, setTrades] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [viewingTrade, setViewingTrade] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [deletingTrade, setDeletingTrade] = useState(null);
  const [toast, setToast] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const pollRef = useRef(null);

  const fetchAll = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
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

  const filteredTrades = sessionFilter
    ? trades.filter(t => t.session === sessionFilter)
    : trades;

  const handleCreateTrade = async (data) => {
    try {
      await api.post('/trades', data);
      setToast({ message: 'Trade logged successfully!', type: 'success' });
      fetchAll(true);
      setShowForm(false);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to log trade', type: 'error' });
    }
  };

  const handleDeleteTrade = async (trade) => {
    try {
      await api.delete(`/trades/${trade.id}`);
      setTrades(prev => prev.filter(t => t.id !== trade.id));
      setDeletingTrade(null);
      setToast({ message: 'Trade archived successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to archive trade', type: 'error' });
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get('/trades/export-pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trading-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    } finally {
      setExportingPdf(false);
    }
  };

  // ─── Loading Skeleton ───
  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            height: i === 0 ? '80px' : i === 1 ? '100px' : '72px',
            borderRadius: '14px',
            background: '#f1f5f9',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  const pnlColor = analytics?.total_net_pnl >= 0 ? '#059669' : '#e11d48';
  const avgWinColor = '#059669';

  return (
    <div style={{
      padding: '20px 28px',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <ReportHeader
        tradeCount={filteredTrades.length}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAll(true)}
        showForm={showForm}
        onToggleForm={() => setShowForm(!showForm)}
        onExportPdf={handleExportPdf}
        exportingPdf={exportingPdf}
      />

      {/* ── Analytics Summary Bar ── */}
      {analytics && analytics.total_trades > 0 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}>
          {/* Win Rate Ring */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #e0f2fe',
            borderRadius: '14px',
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: '0 1px 6px rgba(6,182,212,0.07)',
          }}>
            <WinRateMiniRing rate={analytics.win_rate} />
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Win Rate</span>
          </div>

          <SummaryStatBox
            icon={<BarChart3 size={16} />}
            label="Total Trades"
            value={analytics.total_trades}
            sub={`${analytics.total_wins}W · ${analytics.total_losses}L`}
            color="#0891b2"
          />
          <SummaryStatBox
            icon={<TrendingUp size={16} />}
            label="Net P&L"
            value={`${analytics.total_net_pnl >= 0 ? '+' : ''}$${analytics.total_net_pnl.toFixed(2)}`}
            sub={analytics.total_net_pnl >= 0 ? 'Overall profit' : 'Overall loss'}
            color={pnlColor}
          />
          <SummaryStatBox
            icon={<Trophy size={16} />}
            label="Avg Win"
            value={`$${parseFloat(analytics.avg_win || 0).toFixed(2)}`}
            sub="per winning trade"
            color={avgWinColor}
          />
          <SummaryStatBox
            icon={<TrendingDown size={16} />}
            label="Avg Loss"
            value={`$${Math.abs(parseFloat(analytics.avg_loss_pnl || 0)).toFixed(2)}`}
            sub="per losing trade"
            color="#e11d48"
          />
          <SummaryStatBox
            icon={<Target size={16} />}
            label="Discipline"
            value={`${analytics.rules_followed_rate}%`}
            sub="key level taps"
            color="#7c3aed"
          />
        </div>
      )}

      {/* ── Trade Entry Form ── */}
      {showForm && (
        <div style={{ marginBottom: '16px' }} className="animate-slide-down">
          <TradeForm onSubmit={handleCreateTrade} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* ── Filters ── */}
      <ReportFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        outcomeFilter={outcomeFilter}
        onOutcomeChange={setOutcomeFilter}
        sessionFilter={sessionFilter}
        onSessionChange={setSessionFilter}
        onClear={() => { setSearchText(''); setOutcomeFilter(''); setSessionFilter(''); }}
      />

      {/* ── Trade Cards ── */}
      {filteredTrades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#fff',
          border: '1.5px solid #e0f2fe',
          borderRadius: '16px',
          boxShadow: '0 1px 6px rgba(6,182,212,0.07)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#e0f2fe',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            {searchText || outcomeFilter || sessionFilter
              ? <AlertCircle size={28} style={{ color: '#94a3b8' }} />
              : <Activity size={28} style={{ color: '#0891b2' }} />
            }
          </div>
          <p style={{ color: '#0f172a', fontSize: '14px', margin: '0 0 6px', fontWeight: '700' }}>
            {searchText || outcomeFilter || sessionFilter ? 'No trades match your filters' : 'No trades logged yet'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0 }}>
            {searchText || outcomeFilter || sessionFilter
              ? 'Try adjusting your search or filters'
              : 'Click "Log Trade" above to record your first trade'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(() => {
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

            return filteredTrades.map((trade, index) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                index={index}
                tradeNumber={tradeNumberMap[trade.id] || index + 1}
                isExpanded={expandedTradeId === trade.id}
                onToggleExpand={(id) => setExpandedTradeId(expandedTradeId === id ? null : id)}
                onView={(t) => setViewingTrade(t)}
                onEdit={(t) => setEditingTrade(t)}
                onDelete={(t) => setDeletingTrade(t)}
              />
            ));
          })()}

          {/* Footer */}
          <div style={{
            padding: '14px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              Showing {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''}
              {(searchText || outcomeFilter || sessionFilter) && ` (filtered)`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Live · auto-refreshes every 30s</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawers & Modals ── */}
      {viewingTrade && (() => {
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
          <TradeDetailDrawer
            trade={viewingTrade}
            tradeNumber={tradeNumberMap[viewingTrade.id]}
            onClose={() => setViewingTrade(null)}
            onEdit={(t) => { setViewingTrade(null); setEditingTrade(t); }}
            onDelete={(t) => { setViewingTrade(null); setDeletingTrade(t); }}
          />
        );
      })()}
      {editingTrade && (
        <EditModal
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSuccess={() => fetchAll(true)}
        />
      )}
      {deletingTrade && (
        <DeleteConfirmModal
          trade={deletingTrade}
          onConfirm={handleDeleteTrade}
          onCancel={() => setDeletingTrade(null)}
        />
      )}
    </div>
  );
}
