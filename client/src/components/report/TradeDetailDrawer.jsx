import React, { useEffect } from 'react';
import { X, BookOpen, Brain, ShieldAlert, Pencil, Trash2, Calendar, Clock, TrendingUp, BarChart3, Target, Activity, Download } from 'lucide-react';
import api from '../../api/axios';

export default function TradeDetailDrawer({ trade, tradeNumber, onClose, onEdit, onDelete }) {
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
      <div className="drawer-panel">
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Trade Details
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              background: 'rgba(255, 87, 34, 0.08)',
              border: '1px solid rgba(255, 87, 34, 0.25)',
              color: 'var(--accent-color)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              Trade {tradeNumber || `#${trade.id}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="action-icon-btn"
            style={{ border: '1px solid var(--border-color)' }}
            id="drawer-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero P&L Section */}
        <div style={{
          padding: '24px 22px',
          background: isWin
            ? 'linear-gradient(135deg, rgba(46, 189, 133, 0.06) 0%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(223, 81, 76, 0.06) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Net Profit & Loss
              </div>
              <span className="num" style={{
                fontSize: '32px',
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
            gap: '12px',
          }}>
            <QuickStat icon={<Calendar size={12} />} label="Date" value={trade.trade_date} />
            <QuickStat icon={<Clock size={12} />} label="Time" value={trade.trade_time || '—'} />
            <QuickStat icon={<Activity size={12} />} label="Session" value={trade.session || '—'} />
            <QuickStat icon={<TrendingUp size={12} />} label="Risk" value={trade.risk != null ? `$${trade.risk.toFixed(0)}` : '—'} />
          </div>
        </div>

        {/* Checklist Section */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Target size={12} />
            Trade Checklist
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ChecklistItem label="Market Bias" value={trade.bias || '—'} accent={trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : null} />
            <ChecklistItem label="Key Level" value={trade.key_level || '—'} />
            <ChecklistItem label="Key Level Tap" value={trade.key_level_tap} isBoolean />
            <ChecklistItem label="CISD" value={trade.cisd || 'NO'} isBoolean />
          </div>
        </div>

        {/* Narrative Logs */}
        <div style={{ padding: '20px 22px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <BarChart3 size={12} />
            Journal Notes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <NarrativeSection
              icon={<BookOpen size={14} />}
              title="Why This Trade?"
              content={trade.why_this_trade}
              color="var(--accent-color)"
            />
            <NarrativeSection
              icon={<Brain size={14} />}
              title="Mindset & Psychology"
              content={trade.emotion_mindset}
              color="var(--accent-color)"
            />
            <NarrativeSection
              icon={<ShieldAlert size={14} />}
              title="Actionable Improvements"
              content={trade.mistake_improve}
              color="var(--loss-red)"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div style={{
          padding: '16px 22px',
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
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
            id="drawer-btn-edit"
          >
            <Pencil size={13} />
            Edit Trade
          </button>
          <button
            onClick={handleDownloadPdf}
            className="kite-btn kite-btn-orange"
            style={{ padding: '10px 16px' }}
            id="drawer-btn-pdf"
          >
            <Download size={13} />
            PDF
          </button>
          <button
            onClick={() => { onDelete(trade); onClose(); }}
            className="kite-btn kite-btn-ghost"
            style={{ padding: '10px 16px', color: 'var(--loss-red)', borderColor: 'rgba(223, 81, 76, 0.25)' }}
            id="drawer-btn-delete"
          >
            <Trash2 size={13} />
            Archive
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
      padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</span>
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
      padding: '10px 14px',
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
          background: isYes ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
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
      borderRadius: '10px',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        color,
      }}>
        {icon}
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {title}
        </span>
      </div>
      <p style={{
        fontSize: '13px',
        color: 'var(--text-primary)',
        margin: 0,
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
      }}>
        {content || 'No notes logged for this section.'}
      </p>
    </div>
  );
}
