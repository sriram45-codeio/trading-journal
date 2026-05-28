import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import TradeForm from '../TradeForm';
import EditModal from '../EditModal';
import Toast from '../Toast';
import ReportHeader from './ReportHeader';
import ReportFilters from './ReportFilters';
import TradeCard from './TradeCard';
import TradeDetailDrawer from './TradeDetailDrawer';
import DeleteConfirmModal from './DeleteConfirmModal';

const POLL_INTERVAL = 30000; // 30 seconds

export default function ReportPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [viewingTrade, setViewingTrade] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [deletingTrade, setDeletingTrade] = useState(null);
  const [toast, setToast] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const pollRef = useRef(null);

  // ─── Fetch Trades ───
  const fetchTrades = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append('asset', searchText);
      if (outcomeFilter) params.append('outcome', outcomeFilter);
      const response = await api.get(`/trades?${params.toString()}`);
      setTrades(response.data.trades);
      setLastUpdated(Date.now());
    } catch (err) {
      setToast({ message: 'Failed to load trades', type: 'error' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchText, outcomeFilter]);

  // Initial load + filter changes
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Polling for real-time updates
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchTrades(false);
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchTrades]);

  // ─── Client-Side Session Filtering ───
  const filteredTrades = sessionFilter
    ? trades.filter(t => t.session === sessionFilter)
    : trades;

  // ─── Handlers ───
  const handleCreateTrade = async (data) => {
    try {
      await api.post('/trades', data);
      setToast({ message: 'Trade logged successfully!', type: 'success' });
      fetchTrades(true);
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

  const handleRefresh = () => fetchTrades(true);

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

  const handleClearFilters = () => {
    setSearchText('');
    setOutcomeFilter('');
    setSessionFilter('');
  };

  const handleToggleExpand = (id) => {
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          height: '60px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          height: '56px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.1s',
        }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            height: '80px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            marginBottom: '10px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${0.2 + i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Report Header */}
      <ReportHeader
        tradeCount={filteredTrades.length}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        showForm={showForm}
        onToggleForm={() => setShowForm(!showForm)}
        onExportPdf={handleExportPdf}
        exportingPdf={exportingPdf}
      />

      {/* Trade Entry Form */}
      {showForm && (
        <div style={{ marginBottom: '16px' }} className="animate-slide-down">
          <TradeForm onSubmit={handleCreateTrade} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Filters */}
      <ReportFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        outcomeFilter={outcomeFilter}
        onOutcomeChange={setOutcomeFilter}
        sessionFilter={sessionFilter}
        onSessionChange={setSessionFilter}
        onClear={handleClearFilters}
      />

      {/* Trade Cards */}
      {filteredTrades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(243, 89, 54, 0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            {searchText || outcomeFilter || sessionFilter
              ? <AlertCircle size={28} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              : <TrendingUp size={28} style={{ color: '#f35936', opacity: 0.6 }} />
            }
          </div>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            margin: '0 0 6px',
            fontWeight: '600',
          }}>
            {searchText || outcomeFilter || sessionFilter
              ? 'No trades match your filters'
              : 'No trades logged yet'
            }
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '12.5px',
            margin: 0,
          }}>
            {searchText || outcomeFilter || sessionFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Click "Log Trade" to record your first trade'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTrades.map((trade, index) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              index={index}
              isExpanded={expandedTradeId === trade.id}
              onToggleExpand={handleToggleExpand}
              onView={(t) => setViewingTrade(t)}
              onEdit={(t) => setEditingTrade(t)}
              onDelete={(t) => setDeletingTrade(t)}
            />
          ))}

          {/* Footer */}
          <div style={{
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
          }}>
            <span style={{ fontSize: '11px' }}>
              Showing {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''}
              {(searchText || outcomeFilter || sessionFilter) && ` (filtered)`}
            </span>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>
              Click any card to expand details
            </span>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {viewingTrade && (
        <TradeDetailDrawer
          trade={viewingTrade}
          onClose={() => setViewingTrade(null)}
          onEdit={(t) => { setViewingTrade(null); setEditingTrade(t); }}
          onDelete={(t) => { setViewingTrade(null); setDeletingTrade(t); }}
        />
      )}

      {/* Edit Modal */}
      {editingTrade && (
        <EditModal
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSuccess={() => fetchTrades(true)}
        />
      )}

      {/* Delete Confirmation */}
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
