import React, { useState, useEffect } from 'react';
import { X, BookOpen, Brain, ShieldAlert, Pencil, Trash2, Calendar, Clock, TrendingUp, BarChart3, Target, Activity, Download, ZoomIn, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

export default function TradeDetailDrawer({ trade, tradeNumber, onClose, onEdit, onDelete }) {
  const [showZoom, setShowZoom] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/trades/${trade.id}/export-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-${trade.id}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download individual trade PDF:', err);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!trade) return null;

  const isWin = trade.outcome === 'WIN';
  const pnlPos = trade.net_pnl > 0;
  const pnlNeg = trade.net_pnl < 0;
  const dirColor = trade.direction === 'BUY' ? 'var(--buy-blue)' : 'var(--sell-red)';
  const pnlColor = pnlPos ? 'var(--win-green)' : pnlNeg ? 'var(--loss-red)' : 'var(--text-muted)';

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      
      {/* Lightbox Image Overlay */}
      {showZoom && trade.screenshot && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.9)', zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
          <img
            src={trade.screenshot}
            alt="Trade Screenshot Full"
            style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="drawer-panel">
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Trade Log Details
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-color)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              Trade {tradeNumber || `#${trade.id}`}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            id="drawer-close-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Hero P&L Section */}
        <div style={{
          padding: '20px 22px',
          background: isWin
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Net Profit & Loss
              </div>
              <span className="num" style={{
                fontSize: '30px',
                fontWeight: '800',
                color: pnlColor,
                lineHeight: 1,
              }}>
                {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className={trade.direction === 'BUY' ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '11px', padding: '3px 10px' }}>
                {trade.direction}
              </span>
              <span className={isWin ? 'badge-win' : 'badge-loss'} style={{ fontSize: '11px', padding: '3px 10px' }}>
                {trade.outcome}
              </span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}>
            <QuickStat icon={<Calendar size={12} />} label="Date" value={trade.trade_date} />
            <QuickStat icon={<Clock size={12} />} label="Time" value={trade.trade_time || '—'} />
            <QuickStat icon={<Activity size={12} />} label="Session" value={trade.session || '—'} />
            <QuickStat icon={<TrendingUp size={12} />} label="Risk" value={trade.risk != null ? `$${trade.risk.toFixed(0)}` : '—'} />
          </div>
        </div>

        {/* PROMINENT UPLOADED SCREENSHOT PHOTO SECTION */}
        {trade.screenshot ? (
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', background: '#f0f9ff' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)' }}>
                <ImageIcon size={14} />
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Uploaded Trade Chart Screenshot
                </span>
              </div>
              <button
                onClick={() => setShowZoom(true)}
                className="kite-btn kite-btn-blue"
                style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
              >
                <ZoomIn size={12} /> Full Image View
              </button>
            </div>
            <div
              onClick={() => setShowZoom(true)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid var(--accent-border)',
                background: '#ffffff',
                cursor: 'zoom-in',
                padding: '6px',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <img
                src={trade.screenshot}
                alt="Trade Screenshot Preview"
                style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No screenshot attached for this trade log.</span>
          </div>
        )}

        {/* Checklist Section */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Target size={12} />
            Trade Checklist & Level Tap
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <ChecklistItem label="Market Bias" value={trade.bias || '—'} accent={trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : null} />
            <ChecklistItem label="Key Level" value={trade.key_level || '—'} />
            <ChecklistItem label="Key Level Tap" value={trade.key_level_tap} isBoolean />
            <ChecklistItem label="CISD" value={trade.cisd || 'NO'} isBoolean />
          </div>
        </div>

        {/* Narrative Logs */}
        <div style={{ padding: '18px 22px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <BarChart3 size={12} />
            Journal Notes & Retrospective
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <NarrativeSection
              icon={<BookOpen size={13} />}
              title="Why This Trade?"
              content={trade.why_this_trade}
              color="var(--accent-color)"
            />
            <NarrativeSection
              icon={<Brain size={13} />}
              title="Mindset & Psychology"
              content={trade.emotion_mindset}
              color="var(--accent-color)"
            />
            <NarrativeSection
              icon={<ShieldAlert size={13} />}
              title="Actionable Improvements"
              content={trade.mistake_improve}
              color="var(--loss-red)"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          gap: '10px',
          position: 'sticky',
          bottom: 0,
        }}>
          <button
            onClick={() => { onEdit(trade); onClose(); }}
            className="kite-btn kite-btn-blue"
            style={{ flex: 1, justifyContent: 'center', padding: '9px' }}
            id="drawer-btn-edit"
          >
            <Pencil size={13} />
            Edit Trade
          </button>
          <button
            onClick={handleDownloadPdf}
            className="kite-btn kite-btn-ghost"
            style={{ padding: '9px 14px', color: 'var(--accent-color)' }}
            id="drawer-btn-pdf"
          >
            <Download size={13} />
            PDF
          </button>
          <button
            onClick={() => { onDelete(trade); onClose(); }}
            className="kite-btn kite-btn-ghost"
            style={{ padding: '9px 14px', color: 'var(--loss-red)', borderColor: '#fecaca' }}
            id="drawer-btn-delete"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

function QuickStat({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', marginBottom: '3px' }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function ChecklistItem({ label, value, accent, isBoolean }) {
  const isYes = value === 'YES';
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</span>
      {isBoolean ? (
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: isYes ? 'var(--win-green)' : 'var(--loss-red)',
          background: isYes ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          {isYes ? '✓ YES' : '✗ NO'}
        </span>
      ) : (
        <span style={{ fontSize: '12px', fontWeight: '600', color: accent || 'var(--text-primary)' }}>{value}</span>
      )}
    </div>
  );
}

function NarrativeSection({ icon, title, content, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
        color,
      }}>
        {icon}
        <span style={{
          fontSize: '10.5px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {title}
        </span>
      </div>
      <p style={{
        fontSize: '12px',
        color: 'var(--text-primary)',
        margin: 0,
        whiteSpace: 'pre-wrap',
        lineHeight: '1.5',
      }}>
        {content || 'No notes logged for this section.'}
      </p>
    </div>
  );
}
