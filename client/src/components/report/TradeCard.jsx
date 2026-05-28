import React from 'react';
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TradeCard({ trade, index, isExpanded, onToggleExpand, onView, onEdit, onDelete }) {
  const isWin = trade.outcome === 'WIN';
  const pnlPos = trade.net_pnl > 0;
  const pnlNeg = trade.net_pnl < 0;
  const isBuy = trade.direction === 'BUY';
  const dirColor = isBuy ? '#0284c7' : '#e11d48';
  const pnlColor = pnlPos ? '#059669' : pnlNeg ? '#e11d48' : '#64748b';
  const winBg = isWin ? 'rgba(5,150,105,0.04)' : 'rgba(225,29,72,0.04)';
  const winBorder = isWin ? 'rgba(5,150,105,0.18)' : 'rgba(225,29,72,0.18)';

  return (
    <div
      style={{
        background: '#ffffff',
        border: `1.5px solid ${isExpanded ? '#06b6d4' : winBorder}`,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: isExpanded
          ? '0 0 0 3px rgba(6,182,212,0.1), 0 4px 16px rgba(6,182,212,0.08)'
          : '0 1px 4px rgba(15,23,42,0.05)',
        transition: 'all 0.2s ease',
        animationDelay: `${index * 50}ms`,
      }}
      className="stagger-fade-in"
      id={`trade-card-${trade.id}`}
    >
      {/* ── Card Header ── */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          background: isExpanded ? 'rgba(6,182,212,0.03)' : '#fff',
          borderBottom: isExpanded ? '1.5px solid #e0f2fe' : 'none',
          transition: 'background 0.15s ease',
        }}
        onClick={() => onToggleExpand(trade.id)}
      >
        {/* LEFT: Direction Badge + Date/Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Direction Icon */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: isBuy ? 'rgba(2,132,199,0.08)' : 'rgba(225,29,72,0.08)',
            border: `1.5px solid ${isBuy ? 'rgba(2,132,199,0.25)' : 'rgba(225,29,72,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isBuy
              ? <ArrowUpRight size={18} color="#0284c7" />
              : <ArrowDownRight size={18} color="#e11d48" />
            }
          </div>

          {/* Date, Time, Session, Bias */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                {trade.trade_date}
              </span>
              {trade.trade_time && (
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                  {trade.trade_time}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
              {trade.session && (
                <span style={{
                  fontSize: '10.5px', fontWeight: '600', color: '#0891b2',
                  background: '#e0f2fe', padding: '1px 8px', borderRadius: '99px',
                  border: '1px solid #bae6fd',
                }}>
                  {trade.session}
                </span>
              )}
              {trade.bias && (
                <span style={{
                  fontSize: '10.5px', fontWeight: '700',
                  color: trade.bias === 'Bullish' ? '#059669' : trade.bias === 'Bearish' ? '#e11d48' : '#64748b',
                }}>
                  {trade.bias}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Checklist Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          <MetricBadge label="Key Level" value={trade.key_level || '—'} maxWidth="130px" />
          <BoolDot label="Tap" value={trade.key_level_tap} />
          <BoolDot label="CISD" value={trade.cisd || 'NO'} />
        </div>

        {/* RIGHT: Risk, P&L, Outcome, Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Risk */}
          {trade.risk != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Risk</div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', fontFamily: 'monospace' }}>
                ${trade.risk.toFixed(0)}
              </span>
            </div>
          )}

          {/* Net P&L */}
          <div style={{ textAlign: 'right', minWidth: '84px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Net P&L</div>
            <span style={{
              fontSize: '16px', fontWeight: '800', fontFamily: 'monospace',
              color: pnlColor, letterSpacing: '-0.5px',
            }}>
              {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
            </span>
          </div>

          {/* Outcome Badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '48px', padding: '4px 10px', borderRadius: '99px',
            fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em',
            background: isWin ? 'rgba(5,150,105,0.1)' : 'rgba(225,29,72,0.1)',
            color: isWin ? '#059669' : '#e11d48',
            border: `1px solid ${isWin ? 'rgba(5,150,105,0.25)' : 'rgba(225,29,72,0.25)'}`,
          }}>
            {trade.outcome}
          </span>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
            <ActionBtn onClick={() => onView(trade)} title="View details" id={`btn-view-${trade.id}`} color="#0891b2">
              <Eye size={14} />
            </ActionBtn>
            <ActionBtn onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`} color="#7c3aed">
              <Pencil size={14} />
            </ActionBtn>
            <ActionBtn onClick={() => onDelete(trade)} title="Archive trade" id={`btn-delete-${trade.id}`} color="#e11d48">
              <Trash2 size={14} />
            </ActionBtn>
          </div>

          {/* Expand chevron */}
          <div style={{ color: isExpanded ? '#0891b2' : '#cbd5e1', transition: 'color 0.2s' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* ── Expanded Narrative Section ── */}
      {isExpanded && (
        <div style={{
          padding: '18px 18px',
          background: 'rgba(240,249,255,0.6)',
          animation: 'slideInDown 0.2s ease',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            <NarrativeBlock
              icon={<BookOpen size={13} />}
              label="Why This Trade?"
              content={trade.why_this_trade}
              color="#0891b2"
              bg="#f0f9ff"
              border="#bae6fd"
            />
            <NarrativeBlock
              icon={<Brain size={13} />}
              label="Mindset & Psychology"
              content={trade.emotion_mindset}
              color="#7c3aed"
              bg="#faf5ff"
              border="#e9d5ff"
            />
            <NarrativeBlock
              icon={<ShieldAlert size={13} />}
              label="Improvements"
              content={trade.mistake_improve}
              color="#e11d48"
              bg="#fff1f2"
              border="#fecdd3"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, title, id, color, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      id={id}
      style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: 'transparent', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}12`;
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      {children}
    </button>
  );
}

function MetricBadge({ label, value, maxWidth }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
        {label}
      </div>
      <span style={{
        fontSize: '11.5px', color: '#334155', fontWeight: '600',
        display: 'block', maxWidth: maxWidth || 'auto',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}

function BoolDot({ label, value }) {
  const isYes = value === 'YES';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: isYes ? 'rgba(5,150,105,0.1)' : 'rgba(225,29,72,0.1)',
        border: `1.5px solid ${isYes ? '#10b981' : '#f43f5e'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: '9px', fontWeight: '800',
        color: isYes ? '#059669' : '#e11d48',
      }}>
        {isYes ? '✓' : '✗'}
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color, bg, border }) {
  return (
    <div style={{
      background: bg || '#f8fafc',
      border: `1.5px solid ${border || '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{
        fontSize: '12.5px', color: '#334155', margin: 0,
        whiteSpace: 'pre-wrap', lineHeight: '1.6',
      }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
