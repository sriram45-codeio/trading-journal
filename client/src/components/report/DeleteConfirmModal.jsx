import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ trade, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  if (!trade) return null;

  const pnlColor = trade.net_pnl > 0 ? '#2ebd85' : trade.net_pnl < 0 ? '#df514c' : 'var(--text-muted)';

  return (
    <div
      className="confirm-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="confirm-modal-card">
        {/* Animated Warning Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(243, 89, 54, 0.1)',
            border: '2px solid rgba(243, 89, 54, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'shakeWarning 0.5s ease-in-out',
          }}>
            <AlertTriangle size={26} style={{ color: '#f35936' }} />
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: '0 0 6px',
        }}>
          Archive This Trade?
        </h3>
        <p style={{
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          margin: '0 0 20px',
          lineHeight: '1.5',
        }}>
          This trade will be archived and hidden from your reports. It won't affect your analytics anymore.
        </p>

        {/* Trade Summary Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {trade.trade_date}
              {trade.trade_time && <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '6px' }}>{trade.trade_time}</span>}
            </span>
            <span className={trade.direction === 'BUY' ? 'badge-buy' : 'badge-sell'}>
              {trade.direction}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {trade.session || 'No session'} · {trade.bias || 'No bias'}
            </span>
            <span className="num" style={{ fontSize: '14px', fontWeight: '700', color: pnlColor }}>
              {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            className="kite-btn kite-btn-ghost"
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
            id="delete-modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(trade)}
            className="kite-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px',
              background: '#df514c',
              color: '#fff',
              fontWeight: '600',
            }}
            id="delete-modal-confirm"
          >
            <AlertTriangle size={14} />
            Archive Trade
          </button>
        </div>
      </div>
    </div>
  );
}
