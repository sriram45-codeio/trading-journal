import React, { useState, useEffect } from 'react';
import { Plus, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import TradeForm from './TradeForm';
import TradeTable from './TradeTable';
import EditModal from './EditModal';
import TradeDetailDrawer from './report/TradeDetailDrawer';
import Toast from './Toast';

export default function TradeLog() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [viewingTrade, setViewingTrade] = useState(null);
  const [filters, setFilters] = useState({ asset: '', outcome: '' });
  const [appliedFilters, setAppliedFilters] = useState({ asset: '', outcome: '' });
  const [toast, setToast] = useState(null);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedFilters.asset) params.append('asset', appliedFilters.asset);
      if (appliedFilters.outcome) params.append('outcome', appliedFilters.outcome);
      const response = await api.get(`/trades?${params.toString()}`);
      setTrades(response.data.trades);
    } catch (err) {
      setToast({ message: 'Failed to load trades', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrades(); }, [appliedFilters]);

  const handleCreateTrade = async (data) => {
    try {
      await api.post('/trades', data);
      setToast({ message: 'Trade logged successfully!', type: 'success' });
      fetchTrades();
      setShowForm(false);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to log trade', type: 'error' });
    }
  };

  const handleDownloadPdf = async (trade) => {
    try {
      const response = await api.get(`/trades/${trade.id}/export-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-${trade.id}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ message: 'Failed to download trade PDF', type: 'error' });
    }
  };

  const handleDeleteTrade = async (trade) => {
    if (!window.confirm(`Archive trade on ${trade.trade_date}?\nNet P&L: $${trade.net_pnl.toFixed(2)}\n\nThis cannot be undone.`)) return;
    try {
      await api.delete(`/trades/${trade.id}`);
      setTrades(prev => prev.filter(t => t.id !== trade.id));
      setToast({ message: 'Trade archived', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to archive trade', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div>
          <h1 style={{
            fontSize: '18px', fontWeight: '800', margin: 0,
            letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Trade Log
          </h1>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: '500' }}>
            {trades.length} trade{trades.length !== 1 ? 's' : ''} recorded · {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`kite-btn ${showForm ? 'kite-btn-ghost' : 'kite-btn-blue'}`}
          id="btn-toggle-form"
          style={{ padding: '8px 18px' }}
        >
          {showForm ? <><ChevronUp size={14} /> Hide Form</> : <><Plus size={14} /> Log Trade</>}
        </button>
      </div>

      {/* ── Trade Entry Form ── */}
      {showForm && (
        <div style={{ marginBottom: '16px' }} className="animate-slide-down">
          <TradeForm onSubmit={handleCreateTrade} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* ── Trade Table ── */}
      <TradeTable
        trades={trades}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={() => setAppliedFilters({ ...filters })}
        onClearFilters={() => {
          setFilters({ asset: '', outcome: '' });
          setAppliedFilters({ asset: '', outcome: '' });
        }}
        onView={(trade) => setViewingTrade(trade)}
        onDownloadPdf={handleDownloadPdf}
        onEdit={(trade) => setEditingTrade(trade)}
        onDelete={handleDeleteTrade}
      />

      {/* ── Trade Detail Drawer (Eye Button) ── */}
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
            onDelete={(t) => { setViewingTrade(null); handleDeleteTrade(t); }}
          />
        );
      })()}

      {/* ── Edit Modal ── */}
      {editingTrade && (
        <EditModal
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSuccess={fetchTrades}
        />
      )}
    </div>
  );
}
