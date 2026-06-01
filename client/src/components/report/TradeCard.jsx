import React from 'react';
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import api from '../../api/axios';

export default function TradeCard({ trade, index, tradeNumber, isExpanded, onToggleExpand, onView, onEdit, onDelete }) {
  const handleDownloadPdf = async (e) => {
    e.stopPropagation();
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

  const isWin = trade.outcome === 'WIN';
  const pnlPos = trade.net_pnl > 0;
  const pnlNeg = trade.net_pnl < 0;
  const isBuy = trade.direction === 'BUY';
  const dirColor = isBuy ? 'var(--buy-blue)' : 'var(--sell-red)';
  const pnlColor = pnlPos ? 'var(--win-green)' : pnlNeg ? 'var(--loss-red)' : 'var(--text-muted)';
  const winBg = isWin ? 'rgba(0, 162, 124, 0.04)' : 'rgba(223, 81, 76, 0.04)';
  const winBorder = isWin ? 'rgba(0, 162, 124, 0.15)' : 'rgba(223, 81, 76, 0.15)';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${isExpanded ? 'var(--accent-color)' : winBorder}`,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: isExpanded
          ? '0 0 0 2px rgba(255, 87, 34, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)'
          : '0 1px 4px rgba(0, 0, 0, 0.04)',
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
          background: isExpanded ? 'rgba(255, 87, 34, 0.04)' : 'var(--bg-card)',
          borderBottom: isExpanded ? '1.5px solid var(--border-color)' : 'none',
          transition: 'background 0.15s ease',
        }}
        onClick={() => onToggleExpand(trade.id)}
      >
        {/* LEFT: Direction Badge + Date/Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Direction Icon */}
          <div style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-btn)',
            background: isBuy ? 'rgba(65, 132, 243, 0.08)' : 'rgba(223, 81, 76, 0.08)',
            border: `1.5px solid ${isBuy ? 'rgba(65, 132, 243, 0.25)' : 'rgba(223, 81, 76, 0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isBuy
              ? <ArrowUpRight size={18} color="var(--buy-blue)" />
              : <ArrowDownRight size={18} color="var(--sell-red)" />
            }
          </div>

          {/* Date, Time, Session, Bias */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--accent-color)' }}>
                Trade {tradeNumber}
              </span>
              {trade.screenshot && (
                <span 
                  style={{ marginLeft: '6px', cursor: 'pointer', fontSize: '11px', background: 'rgba(255, 87, 34, 0.1)', border: '1px solid rgba(255, 87, 34, 0.25)', color: 'var(--accent-color)', padding: '1px 5px', borderRadius: '4px' }} 
                  title="Click to view trade screenshot"
                  onClick={(e) => {
                    e.stopPropagation();
                    const win = window.open();
                    win.document.write(`<iframe src="${trade.screenshot}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                  }}
                >
                  📸 View Image
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                ·
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {trade.trade_date}
              </span>
              {trade.trade_time && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {trade.trade_time}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
              {trade.session && (
                <span style={{
                  fontSize: '10.5px', fontWeight: '600', color: 'var(--accent-color)',
                  background: 'rgba(255, 87, 34, 0.08)', padding: '1px 8px', borderRadius: 'var(--radius-badge)',
                  border: '1px solid var(--border-color)',
                }}>
                  {trade.session}
                </span>
              )}
              {trade.bias && (
                <span style={{
                  fontSize: '10.5px', fontWeight: '700',
                  color: trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : 'var(--text-muted)',
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
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Risk</div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                ${trade.risk.toFixed(0)}
              </span>
            </div>
          )}

          {/* Net P&L */}
          <div style={{ textAlign: 'right', minWidth: '84px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Net P&L</div>
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
            minWidth: '48px', padding: '4px 10px', borderRadius: 'var(--radius-badge)',
            fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em',
            background: isWin ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
            color: isWin ? 'var(--win-green)' : 'var(--loss-red)',
            border: `1px solid ${isWin ? 'rgba(0, 162, 124, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`,
          }}>
            {trade.outcome}
          </span>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
            <ActionBtn onClick={() => onView(trade)} title="View details" id={`btn-view-${trade.id}`} color="var(--accent-color)">
              <Eye size={14} />
            </ActionBtn>
            <ActionBtn onClick={handleDownloadPdf} title="Download PDF Runsheet" id={`btn-pdf-${trade.id}`} color="var(--accent-color)">
              <Download size={14} />
            </ActionBtn>
            <ActionBtn onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`} color="var(--accent-color)">
              <Pencil size={14} />
            </ActionBtn>
            <ActionBtn onClick={() => onDelete(trade)} title="Archive trade" id={`btn-delete-${trade.id}`} color="var(--loss-red)">
              <Trash2 size={14} />
            </ActionBtn>
          </div>

          {/* Expand chevron */}
          <div style={{ color: isExpanded ? 'var(--accent-color)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* ── Expanded Narrative Section ── */}
      {isExpanded && (
        <div style={{
          padding: '18px 18px',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
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
              color="var(--accent-color)"
              bg="var(--bg-secondary)"
              border="var(--border-color)"
            />
            <NarrativeBlock
              icon={<Brain size={13} />}
              label="Mindset & Psychology"
              content={trade.emotion_mindset}
              color="var(--accent-color)"
              bg="var(--bg-secondary)"
              border="var(--border-color)"
            />
            <NarrativeBlock
              icon={<ShieldAlert size={13} />}
              label="Improvements"
              content={trade.mistake_improve}
              color="var(--loss-red)"
              bg="var(--bg-secondary)"
              border="var(--border-color)"
            />
            {trade.screenshot && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'zoom-in',
              }}
              onClick={(e) => {
                e.stopPropagation();
                const win = window.open();
                win.document.write(`<iframe src="${trade.screenshot}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-color)' }}>
                  <span>📸</span>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Trade Screenshot
                  </span>
                </div>
                <img 
                  src={trade.screenshot} 
                  alt="Screenshot" 
                  style={{ maxHeight: '120px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'block' }} 
                />
              </div>
            )}
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
        width: '30px', height: '30px', borderRadius: 'var(--radius-btn)',
        background: 'transparent', border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        // Simple support for variables
        const cleanColor = color.startsWith('var(') ? 'var(--accent-color)' : color;
        e.currentTarget.style.background = 'var(--bg-row-hover)';
        e.currentTarget.style.borderColor = 'var(--accent-color)';
        e.currentTarget.style.color = cleanColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      {children}
    </button>
  );
}

function MetricBadge({ label, value, maxWidth }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
        {label}
      </div>
      <span style={{
        fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: '600',
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
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: isYes ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
        border: `1.5px solid ${isYes ? 'var(--win-green)' : 'var(--loss-red)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', fontSize: '9px', fontWeight: '800',
        color: isYes ? 'var(--win-green)' : 'var(--loss-red)',
      }}>
        {isYes ? '✓' : '✗'}
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color, bg, border }) {
  return (
    <div style={{
      background: bg || 'var(--bg-secondary)',
      border: `1.5px solid ${border || 'var(--border-color)'}`,
      borderRadius: 'var(--radius-card)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{
        fontSize: '12.5px', color: 'var(--text-primary)', margin: 0,
        whiteSpace: 'pre-wrap', lineHeight: '1.6',
      }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
