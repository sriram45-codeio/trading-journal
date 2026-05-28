import React, { useEffect } from 'react';
import TradeForm from './TradeForm';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function EditModal({ trade, onClose, onSuccess }) {
  const handleSubmit = async (data) => {
    try {
      await api.put(`/trades/${trade.id}`, data);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update trade');
    }
  };

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideInDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25), 0 10px 10px -5px rgba(0,0,0,0.15)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifySizing: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>EDIT LOGGED TRADE</span>
            <span style={{
              fontSize: '11px', fontWeight: '700',
              background: 'rgba(243,89,54,0.12)',
              border: '1px solid rgba(243,89,54,0.3)',
              color: '#f35936',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              ID: #{trade.id}
            </span>
          </div>
          <button
            onClick={onClose}
            id="modal-close-btn"
            style={{
              background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-btn)',
              color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', padding: '4px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#df514c'; e.currentTarget.style.borderColor = 'rgba(223,81,76,0.5)'; e.currentTarget.style.background = 'rgba(223,81,76,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'none'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* TradeForm inside Modal */}
        <div style={{ padding: '0' }}>
          <TradeForm initialData={trade} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
