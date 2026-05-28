import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const color = isSuccess ? '#2ebd85' : '#df514c';
  const bg = isSuccess ? 'rgba(46,189,133,0.08)' : 'rgba(223,81,76,0.08)';
  const border = isSuccess ? 'rgba(46,189,133,0.2)' : 'rgba(223,81,76,0.2)';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div
      className="animate-slide-in"
      style={{
        position: 'fixed',
        top: '68px',
        right: '20px',
        zIndex: 9999,
        background: 'var(--bg-card)',
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 'var(--radius-input)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
        minWidth: '280px',
        maxWidth: '380px',
        transition: 'all 0.2s ease'
      }}
    >
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '3px', borderRadius: '50%', flexShrink: 0 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-row-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
