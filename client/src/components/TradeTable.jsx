import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight, ZoomIn, X } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function TradeTable({ trades, onEdit, onDelete, loading, filters, setFilters, onApplyFilters, onClearFilters }) {
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [lightboxScreenshot, setLightboxScreenshot] = useState(null);

  const toggleExpand = (id, e) => {
    if (e.target.closest('button') || e.target.closest('svg')) return;
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            height: '60px',
            borderRadius: 'var(--radius-card)',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Full-screen Lightbox ── */}
      {lightboxScreenshot && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.88)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', backdropFilter: 'blur(6px)',
          }}
          onClick={() => setLightboxScreenshot(null)}
        >
          <button
            onClick={() => setLightboxScreenshot(null)}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
          <img
            src={lightboxScreenshot}
            alt="Trade Screenshot"
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain', borderRadius: '10px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-color)', flexShrink: 0 }}>
          <Filter size={13} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)' }}>Filters</span>
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '280px' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search session, bias, key level…"
            value={filters.asset}
            onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.value }))}
            className="kite-input"
            style={{ paddingLeft: '28px', fontSize: '12.5px' }}
            id="search-filter-text"
          />
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Outcome Select */}
        <div style={{ minWidth: '140px' }}>
          <CustomSelect
            name="outcome"
            value={filters.outcome}
            onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
            options={[
              { value: '', label: 'All Results', icon: '🔍' },
              { value: 'WIN', label: 'Wins Only', icon: '🟢' },
              { value: 'LOSS', label: 'Losses Only', icon: '🔴' },
            ]}
            id="select-filter-outcome"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={onApplyFilters} className="kite-btn kite-btn-blue" id="btn-apply-filters" style={{ padding: '7px 16px', fontSize: '12px' }}>Apply</button>
          <button onClick={onClearFilters} className="kite-btn kite-btn-ghost" id="btn-clear-filters" style={{ padding: '7px 16px', fontSize: '12px' }}>Clear</button>
        </div>
      </div>

      {/* ── Trade Cards ── */}
      {trades.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(255, 87, 34, 0.08)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
          }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-color)' }} />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 6px', fontWeight: '700' }}>No trade logs found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>Click "Log Trade" above to record your first trade</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {trades.map((trade, index) => {
            const pnlPos = trade.net_pnl > 0;
            const pnlNeg = trade.net_pnl < 0;
            const isWin = trade.outcome === 'WIN';
            const isBuy = trade.direction === 'BUY';
            const isExpanded = expandedTradeId === trade.id;
            const pnlColor = pnlPos ? 'var(--win-green)' : pnlNeg ? 'var(--loss-red)' : 'var(--text-muted)';
            const dirColor = isBuy ? 'var(--buy-blue)' : 'var(--sell-red)';

            return (
              <div
                key={trade.id}
                className="stagger-fade-in"
                style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${isExpanded ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  boxShadow: isExpanded
                    ? '0 0 0 2px rgba(255, 87, 34, 0.15), 0 4px 12px rgba(255, 87, 34, 0.1)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  animationDelay: `${index * 40}ms`,
                }}
                onClick={(e) => toggleExpand(trade.id, e)}
                id={`trade-row-${trade.id}`}
              >
                {/* Row Header */}
                <div style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: isExpanded ? 'rgba(255, 87, 34, 0.04)' : 'transparent',
                  borderBottom: isExpanded ? '1.5px solid var(--border-color)' : 'none',
                  transition: 'background 0.15s ease',
                }}>
                  {/* Direction Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-btn)', flexShrink: 0,
                    background: isBuy ? 'rgba(65, 132, 243, 0.08)' : 'rgba(223, 81, 76, 0.08)',
                    border: `1.5px solid ${isBuy ? 'rgba(65, 132, 243, 0.25)' : 'rgba(223, 81, 76, 0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isBuy ? <ArrowUpRight size={18} color="var(--buy-blue)" /> : <ArrowDownRight size={18} color="var(--sell-red)" />}
                  </div>

                  {/* Date & Session */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{trade.trade_date}</span>
                      {trade.trade_time && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{trade.trade_time}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                      {trade.session && (
                        <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--accent-color)', background: 'rgba(255, 87, 34, 0.08)', padding: '1px 8px', borderRadius: '99px', border: '1px solid rgba(255, 87, 34, 0.2)' }}>
                          {trade.session}
                        </span>
                      )}
                      {trade.bias && (
                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : 'var(--text-muted)' }}>
                          {trade.bias}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Checklist Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Key Level</div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600', maxWidth: '100px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.key_level || '—'}</span>
                    </div>
                    {[{ label: 'Tap', val: trade.key_level_tap }, { label: 'CISD', val: trade.cisd || 'NO' }].map(({ label, val }) => {
                      const isYes = val === 'YES';
                      return (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
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
                    })}
                  </div>

                  {/* Screenshot inline thumbnail */}
                  {trade.screenshot && (
                    <div
                      style={{
                        width: '52px', height: '40px',
                        borderRadius: '6px', overflow: 'hidden',
                        border: '2px solid rgba(255, 87, 34, 0.35)',
                        flexShrink: 0, cursor: 'zoom-in',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        position: 'relative',
                      }}
                      onClick={(e) => { e.stopPropagation(); setLightboxScreenshot(trade.screenshot); }}
                      title="Click to view screenshot"
                    >
                      <img src={trade.screenshot} alt="Screenshot" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0)',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <ZoomIn size={12} color="#fff" style={{ opacity: 0.9 }} />
                      </div>
                    </div>
                  )}

                  {/* P&L, Risk & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {trade.risk != null && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Risk</div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'monospace' }}>${trade.risk.toFixed(0)}</span>
                      </div>
                    )}
                    <div style={{ textAlign: 'right', minWidth: '84px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Net P&L</div>
                      <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: pnlColor, letterSpacing: '-0.5px' }}>
                        {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
                      </span>
                    </div>
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
                      <ActionBtn onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`} color="var(--accent-color)">
                        <Pencil size={13} />
                      </ActionBtn>
                      <ActionBtn onClick={() => onDelete(trade)} title="Delete trade" id={`btn-delete-${trade.id}`} color="var(--sell-red)">
                        <Trash2 size={13} />
                      </ActionBtn>
                    </div>

                    <div style={{ color: isExpanded ? 'var(--accent-color)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expandable Narrative Section */}
                {isExpanded && (
                  <div style={{ padding: '18px', background: 'var(--bg-primary)', animation: 'slideInDown 0.2s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <NarrativeBlock icon={<BookOpen size={13} />} label="Why This Trade?" content={trade.why_this_trade} color="var(--accent-color)" bg="var(--bg-secondary)" border="var(--border-color)" />
                      <NarrativeBlock icon={<Brain size={13} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="var(--accent-color)" bg="var(--bg-secondary)" border="var(--border-color)" />
                      <NarrativeBlock icon={<ShieldAlert size={13} />} label="Improvements" content={trade.mistake_improve} color="var(--loss-red)" bg="var(--bg-secondary)" border="var(--border-color)" />
                      {trade.screenshot && (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid rgba(255, 87, 34, 0.25)',
                          borderRadius: 'var(--radius-card)',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-color)' }}>
                              <span>📸</span>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trade Screenshot</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setLightboxScreenshot(trade.screenshot); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '10px', fontWeight: '700', color: 'var(--accent-color)',
                                background: 'rgba(255, 87, 34, 0.08)', border: '1px solid rgba(255, 87, 34, 0.2)',
                                borderRadius: '4px', padding: '3px 8px', cursor: 'pointer',
                              }}
                            >
                              <ZoomIn size={10} /> Full View
                            </button>
                          </div>
                          <img
                            src={trade.screenshot}
                            alt="Screenshot"
                            style={{
                              width: '100%', maxHeight: '180px', objectFit: 'contain',
                              borderRadius: '6px', border: '1px solid var(--border-color)',
                              display: 'block', cursor: 'zoom-in', background: 'var(--bg-card)',
                            }}
                            onClick={(e) => { e.stopPropagation(); setLightboxScreenshot(trade.screenshot); }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
              Showing {trades.length} trade{trades.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px rgba(255, 87, 34, 0.4)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click any row to expand details</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActionBtn({ onClick, title, id, color, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      id={id}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: 'var(--radius-btn)',
        background: 'transparent',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-row-hover)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.color = color;
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
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
