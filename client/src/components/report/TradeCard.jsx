import React from 'react';
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert } from 'lucide-react';

export default function TradeCard({ trade, index, isExpanded, onToggleExpand, onView, onEdit, onDelete }) {
  const isWin = trade.outcome === 'WIN';
  const pnlPos = trade.net_pnl > 0;
  const pnlNeg = trade.net_pnl < 0;
  const dirColor = trade.direction === 'BUY' ? '#4184f3' : '#df514c';

  return (
    <div
      className={`report-card ${isWin ? 'report-card-win' : 'report-card-loss'} stagger-fade-in`}
      style={{ animationDelay: `${index * 60}ms` }}
      id={`trade-card-${trade.id}`}
    >
      {/* Card Header */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
        onClick={() => onToggleExpand(trade.id)}
      >
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Direction Indicator */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${dirColor}12`,
            border: `1px solid ${dirColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: dirColor, letterSpacing: '0.04em' }}>
              {trade.direction === 'BUY' ? 'B' : 'S'}
            </span>
          </div>

          {/* Date + Session */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {trade.trade_date}
              </span>
              {trade.trade_time && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {trade.trade_time}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              {trade.session && (
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  padding: '1px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {trade.session}
                </span>
              )}
              {trade.bias && (
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '600',
                  color: trade.bias === 'Bullish' ? '#2ebd85' : trade.bias === 'Bearish' ? '#df514c' : 'var(--text-muted)',
                }}>
                  {trade.bias}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Checklist Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <MetricBadge label="Key Level" value={trade.key_level || '—'} maxWidth="120px" />
          <MetricDot label="Tap" value={trade.key_level_tap} />
          <MetricDot label="CISD" value={trade.cisd || 'NO'} />
        </div>

        {/* Right: P&L + Outcome + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Risk */}
          {trade.risk != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '1px' }}>RISK</div>
              <span className="num" style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                ₹{trade.risk.toFixed(0)}
              </span>
            </div>
          )}

          {/* P&L */}
          <div style={{ textAlign: 'right', minWidth: '80px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '1px' }}>NET P&L</div>
            <span className="num" style={{
              fontSize: '15px',
              fontWeight: '700',
              fontFamily: 'monospace',
              color: pnlPos ? '#2ebd85' : pnlNeg ? '#df514c' : 'var(--text-muted)',
            }}>
              {pnlPos ? '+' : ''}₹{trade.net_pnl.toFixed(2)}
            </span>
          </div>

          {/* Outcome Badge */}
          <span
            className={isWin ? 'badge-win' : 'badge-loss'}
            style={{ minWidth: '44px', textAlign: 'center' }}
          >
            {trade.outcome}
          </span>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
            <button className="action-icon-btn view" onClick={() => onView(trade)} title="View details" id={`btn-view-${trade.id}`}>
              <Eye size={14} />
            </button>
            <button className="action-icon-btn edit" onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`}>
              <Pencil size={14} />
            </button>
            <button className="action-icon-btn delete" onClick={() => onDelete(trade)} title="Archive trade" id={`btn-delete-${trade.id}`}>
              <Trash2 size={14} />
            </button>
          </div>

          {/* Expand Toggle */}
          <div style={{ color: isExpanded ? '#f35936' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expandable Narrative Section */}
      {isExpanded && (
        <div style={{
          padding: '16px 18px',
          background: 'var(--bg-secondary)',
          animation: 'slideInDown 0.2s ease',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <NarrativeBlock
              icon={<BookOpen size={13} />}
              label="Why This Trade?"
              content={trade.why_this_trade}
              color="#f35936"
            />
            <NarrativeBlock
              icon={<Brain size={13} />}
              label="Mindset & Psychology"
              content={trade.emotion_mindset}
              color="#4184f3"
            />
            <NarrativeBlock
              icon={<ShieldAlert size={13} />}
              label="Improvements"
              content={trade.mistake_improve}
              color="#df514c"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, value, maxWidth }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
        {label}
      </div>
      <span style={{
        fontSize: '11.5px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        display: 'block',
        maxWidth: maxWidth || 'auto',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}

function MetricDot({ label, value }) {
  const isYes = value === 'YES';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: isYes ? 'rgba(46, 189, 133, 0.12)' : 'rgba(223, 81, 76, 0.12)',
        border: `1.5px solid ${isYes ? '#2ebd85' : '#df514c'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        fontSize: '9px',
        fontWeight: '700',
        color: isYes ? '#2ebd85' : '#df514c',
      }}>
        {isYes ? '✓' : '✗'}
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '14px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        marginBottom: '8px',
        color,
      }}>
        {icon}
        <span style={{
          fontSize: '10.5px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {label}
        </span>
      </div>
      <p style={{
        fontSize: '12.5px',
        color: 'var(--text-primary)',
        margin: 0,
        whiteSpace: 'pre-wrap',
        lineHeight: '1.55',
      }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
