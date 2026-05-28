import React, { useState, useEffect } from 'react';
import { Plus, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import TradeForm from './TradeForm';
import TradeTable from './TradeTable';
import EditModal from './EditModal';
import Toast from './Toast';

export default function TradeLog() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
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

  const handleDeleteTrade = async (trade) => {
    if (!window.confirm(`Delete trade on ${trade.trade_date} for ${trade.asset_pair}?\nNet P&L: ₹${trade.net_pnl.toFixed(2)}\n\nThis cannot be undone.`)) return;
    try {
      await api.delete(`/trades/${trade.id}`);
      setTrades(prev => prev.filter(t => t.id !== trade.id));
      setToast({ message: 'Trade deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to delete trade', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#e5e7eb', margin: 0 }}>Trade Log</h1>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '3px 0 0' }}>
            {trades.length} trade{trades.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`kite-btn ${showForm ? 'kite-btn-ghost' : 'kite-btn-blue'}`}
          id="btn-toggle-form"
        >
          {showForm ? <><ChevronUp size={14} /> Hide Form</> : <><Plus size={14} /> Log Trade</>}
        </button>
      </div>

      {/* Trade Entry Form */}
      {showForm && (
        <div style={{ marginBottom: '16px' }} className="animate-slide-down">
          <TradeForm onSubmit={handleCreateTrade} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Trade Table */}
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
        onEdit={(trade) => setEditingTrade(trade)}
        onDelete={handleDeleteTrade}
      />

      {/* Edit Modal */}
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
