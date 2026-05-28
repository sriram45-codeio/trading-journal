import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function TradeTable({ trades, onEdit, onDelete, loading, filters, setFilters, onApplyFilters, onClearFilters }) {
  const [expandedTradeId, setExpandedTradeId] = useState(null);

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
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.04)',
            border: '1.5px solid var(--border-color)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '14px',
        padding: '12px 16px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 16px rgba(139,92,246,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#a78bfa', flexShrink: 0 }}>
          <Filter size={13} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b5cf6' }}>Filters</span>
        </div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '280px' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', pointerEvents: 'none' }} />
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
          borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(139,92,246,0.06)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(139,92,246,0.1)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
          }}>
            <AlertCircle size={28} style={{ color: '#8b5cf6' }} />
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
            const pnlColor = pnlPos ? '#10b981' : pnlNeg ? '#f43f5e' : '#8b92b6';
            const dirColor = isBuy ? '#60a5fa' : '#f87171';

            return (
              <div
                key={trade.id}
                className="stagger-fade-in"
                style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${isExpanded ? '#8b5cf6' : 'var(--border-color)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: isExpanded
                    ? '0 0 0 3px rgba(139,92,246,0.12), 0 4px 20px rgba(139,92,246,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.2)',
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
                  background: isExpanded ? 'rgba(139,92,246,0.05)' : 'transparent',
                  borderBottom: isExpanded ? '1.5px solid var(--border-color)' : 'none',
                  transition: 'background 0.15s ease',
                }}>
                  {/* Direction Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: isBuy ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1.5px solid ${isBuy ? 'rgba(96,165,250,0.25)' : 'rgba(248,113,113,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isBuy ? <ArrowUpRight size={18} color="#60a5fa" /> : <ArrowDownRight size={18} color="#f87171" />}
                  </div>

                  {/* Date & Session */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#f5f3ff' }}>{trade.trade_date}</span>
                      {trade.trade_time && <span style={{ fontSize: '11px', color: '#8b92b6', fontWeight: '500' }}>{trade.trade_time}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                      {trade.session && (
                        <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#c084fc', background: 'rgba(192,132,252,0.1)', padding: '1px 8px', borderRadius: '99px', border: '1px solid rgba(192,132,252,0.2)' }}>
                          {trade.session}
                        </span>
                      )}
                      {trade.bias && (
                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: trade.bias === 'Bullish' ? '#10b981' : trade.bias === 'Bearish' ? '#f43f5e' : '#8b92b6' }}>
                          {trade.bias}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Checklist Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '9.5px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Key Level</div>
                      <span style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: '600', maxWidth: '100px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.key_level || '—'}</span>
                    </div>
                    {[{ label: 'Tap', val: trade.key_level_tap }, { label: 'CISD', val: trade.cisd || 'NO' }].map(({ label, val }) => {
                      const isYes = val === 'YES';
                      return (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '9.5px', color: '#8b92b6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: isYes ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                            border: `1.5px solid ${isYes ? '#10b981' : '#f43f5e'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto', fontSize: '9px', fontWeight: '800',
                            color: isYes ? '#10b981' : '#f43f5e',
                          }}>
                            {isYes ? '✓' : '✗'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* P&L, Risk & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {trade.risk != null && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#8b92b6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Risk</div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#8b92b6', fontFamily: 'monospace' }}>${trade.risk.toFixed(0)}</span>
                      </div>
                    )}
                    <div style={{ textAlign: 'right', minWidth: '84px' }}>
                      <div style={{ fontSize: '10px', color: '#8b92b6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Net P&L</div>
                      <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: pnlColor, letterSpacing: '-0.5px' }}>
                        {pnlPos ? '+' : ''}${trade.net_pnl.toFixed(2)}
                      </span>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '48px', padding: '4px 10px', borderRadius: '99px',
                      fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em',
                      background: isWin ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                      color: isWin ? '#10b981' : '#f43f5e',
                      border: `1px solid ${isWin ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                    }}>
                      {trade.outcome}
                    </span>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
                      <ActionBtn onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`} color="#8b5cf6">
                        <Pencil size={13} />
                      </ActionBtn>
                      <ActionBtn onClick={() => onDelete(trade)} title="Delete trade" id={`btn-delete-${trade.id}`} color="#f43f5e">
                        <Trash2 size={13} />
                      </ActionBtn>
                    </div>

                    <div style={{ color: isExpanded ? '#8b5cf6' : '#475569', transition: 'color 0.2s' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expandable Narrative Section */}
                {isExpanded && (
                  <div style={{ padding: '18px', background: 'rgba(139,92,246,0.03)', animation: 'slideInDown 0.2s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <NarrativeBlock icon={<BookOpen size={13} />} label="Why This Trade?" content={trade.why_this_trade} color="#8b5cf6" bg="rgba(139,92,246,0.06)" border="rgba(139,92,246,0.2)" />
                      <NarrativeBlock icon={<Brain size={13} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="#c084fc" bg="rgba(192,132,252,0.06)" border="rgba(192,132,252,0.2)" />
                      <NarrativeBlock icon={<ShieldAlert size={13} />} label="Improvements" content={trade.mistake_improve} color="#f43f5e" bg="rgba(244,63,94,0.06)" border="rgba(244,63,94,0.2)" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#8b92b6', fontWeight: '500' }}>
              Showing {trades.length} trade{trades.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }} />
              <span style={{ fontSize: '11px', color: '#8b92b6' }}>Click any row to expand details</span>
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
        width: '30px', height: '30px', borderRadius: '8px',
        background: 'transparent', border: '1.5px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#8b92b6', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}15`;
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.color = '#8b92b6';
      }}
    >
      {children}
    </button>
  );
}

function NarrativeBlock({ icon, label, content, color, bg, border }) {
  return (
    <div style={{
      background: bg || 'rgba(139,92,246,0.04)',
      border: `1.5px solid ${border || 'var(--border-color)'}`,
      borderRadius: '12px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
