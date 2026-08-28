import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight, ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function TradeTable({ trades, onEdit, onDelete, loading, filters, setFilters, onApplyFilters, onClearFilters }) {
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [lightboxScreenshot, setLightboxScreenshot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const toggleExpand = (id, e) => {
    if (e.target.closest('button') || e.target.closest('svg') || e.target.closest('img')) return;
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  const totalPages = Math.ceil(trades.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTrades = trades.slice(startIndex, startIndex + pageSize);

  // Chronological Trade Numbering
  const chronologicalTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.trade_date + (a.trade_time ? 'T' + a.trade_time : 'T00:00:00'));
    const dateB = new Date(b.trade_date + (b.trade_time ? 'T' + b.trade_time : 'T00:00:00'));
    if (dateA - dateB !== 0) return dateA - dateB;
    return a.id - b.id;
  });
  const tradeNumberMap = {};
  chronologicalTrades.forEach((t, i) => {
    tradeNumberMap[t.id] = i + 1;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            height: '60px',
            borderRadius: 'var(--radius-card)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Lightbox Modal ── */}
      {lightboxScreenshot && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', backdropFilter: 'blur(6px)',
          }}
          onClick={() => setLightboxScreenshot(null)}
        >
          <button
            onClick={() => setLightboxScreenshot(null)}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
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
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-color)', flexShrink: 0 }}>
          <Filter size={14} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)' }}>Filters</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '280px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search session, bias, key level…"
            value={filters.asset}
            onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.value }))}
            className="kite-input"
            style={{ paddingLeft: '30px', fontSize: '12.5px' }}
            id="search-filter-text"
          />
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Outcome Select */}
        <div style={{ minWidth: '150px' }}>
          <CustomSelect
            name="outcome"
            value={filters.outcome}
            onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
            options={[
              { value: '', label: 'All Outcomes', icon: '🔍' },
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

      {/* ── ChannelKonnect Structured Data Table ── */}
      {trades.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '70px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--accent-light)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
          }}>
            <AlertCircle size={26} style={{ color: 'var(--accent-color)' }} />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0 0 4px', fontWeight: '700' }}>No trade logs recorded</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: 0 }}>Click "Log Trade" above to log your first trade.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="kite-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Trade #</th>
                  <th>Date & Time</th>
                  <th>Session</th>
                  <th>Bias & Key Level</th>
                  <th style={{ textAlign: 'center' }}>Tap</th>
                  <th style={{ textAlign: 'center' }}>CISD</th>
                  <th>Order</th>
                  <th style={{ textAlign: 'right' }}>Risk ($)</th>
                  <th style={{ textAlign: 'center' }}>R:R</th>
                  <th style={{ textAlign: 'center' }}>Outcome</th>
                  <th style={{ textAlign: 'right' }}>Net P&L</th>
                  <th style={{ textAlign: 'center' }}>Photo</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map((trade) => {
                  const isBuy = trade.direction === 'BUY';
                  const isWin = trade.outcome === 'WIN';
                  const isExpanded = expandedTradeId === trade.id;
                  const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
                  
                  return (
                    <React.Fragment key={trade.id}>
                      <tr 
                        onClick={(e) => toggleExpand(trade.id, e)}
                        style={{ cursor: 'pointer', background: isExpanded ? 'var(--accent-light)' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronUp size={14} color="var(--accent-color)" /> : <ChevronDown size={14} />}
                        </td>
                        <td style={{ fontWeight: '800', color: 'var(--accent-color)' }}>
                          Trade {tradeNumberMap[trade.id] || '—'}
                        </td>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          <div>{trade.trade_date}</div>
                          {trade.trade_time && <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{trade.trade_time}</div>}
                        </td>
                        <td>
                          {trade.session && (
                            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--accent-color)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px' }}>
                              {trade.session}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: trade.bias === 'Bullish' ? 'var(--win-green)' : trade.bias === 'Bearish' ? 'var(--loss-red)' : 'var(--text-secondary)' }}>
                            {trade.bias || '—'}
                          </div>
                          {trade.key_level && <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{trade.key_level}</div>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: trade.key_level_tap === 'YES' ? 'var(--win-green)' : 'var(--loss-red)' }}>
                            {trade.key_level_tap === 'YES' ? '✓' : '✗'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: trade.cisd === 'YES' ? 'var(--win-green)' : 'var(--loss-red)' }}>
                            {trade.cisd === 'YES' ? '✓' : '✗'}
                          </span>
                        </td>
                        <td>
                          <span className={isBuy ? 'badge-buy' : 'badge-sell'}>
                            {trade.direction}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          ${trade.risk != null ? trade.risk.toFixed(2) : '0.00'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>
                          {trade.rr_ratio || '1:1'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={isWin ? 'badge-win' : 'badge-loss'}>
                            {trade.outcome}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: '800', color: pnlColor }}>
                          {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {trade.screenshot ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setLightboxScreenshot(trade.screenshot); }}
                              style={{
                                border: 'none', background: 'var(--accent-light)',
                                color: 'var(--accent-color)', borderRadius: '6px',
                                padding: '4px 8px', cursor: 'pointer', display: 'inline-flex',
                                alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700'
                              }}
                              title="View saved screenshot"
                            >
                              <ImageIcon size={12} /> View
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <ActionBtn onClick={() => onEdit(trade)} title="Edit trade" id={`btn-edit-${trade.id}`} color="var(--accent-color)">
                              <Pencil size={13} />
                            </ActionBtn>
                            <ActionBtn onClick={() => onDelete(trade)} title="Delete trade" id={`btn-delete-${trade.id}`} color="var(--sell-red)">
                              <Trash2 size={13} />
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Row Panel for Trade Narratives & Screenshot */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={14} style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                              <NarrativeBlock icon={<BookOpen size={13} />} label="Why This Trade?" content={trade.why_this_trade} color="var(--accent-color)" />
                              <NarrativeBlock icon={<Brain size={13} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="var(--accent-color)" />
                              <NarrativeBlock icon={<ShieldAlert size={13} />} label="Improvements" content={trade.mistake_improve} color="var(--loss-red)" />
                              {trade.screenshot && (
                                <div style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  padding: '12px 14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--accent-color)', textTransform: 'uppercase' }}>📸 Saved Screenshot</span>
                                    <button
                                      onClick={() => setLightboxScreenshot(trade.screenshot)}
                                      style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Zoom
                                    </button>
                                  </div>
                                  <img
                                    src={trade.screenshot}
                                    alt="Trade Screenshot"
                                    loading="lazy"
                                    style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '6px', cursor: 'zoom-in' }}
                                    onClick={() => setLightboxScreenshot(trade.screenshot)}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination Controls */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500' }}>
                Showing {trades.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, trades.length)} of {trades.length} trades
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                  }}
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="kite-btn kite-btn-ghost"
                style={{
                  padding: '4px 12px',
                  fontSize: '11.5px',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="kite-btn kite-btn-ghost"
                style={{
                  padding: '4px 12px',
                  fontSize: '11.5px',
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next →
              </button>
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
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: 'transparent',
        border: '1px solid var(--border-color)',
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

function NarrativeBlock({ icon, label, content, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color }}>
        {icon}
        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}
