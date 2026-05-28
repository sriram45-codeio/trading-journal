import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Search, Filter, ChevronDown, ChevronUp, BookOpen, Brain, ShieldAlert } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function TradeTable({ trades, onEdit, onDelete, loading, filters, setFilters, onApplyFilters, onClearFilters }) {
  const [expandedTradeId, setExpandedTradeId] = useState(null);

  const toggleExpand = (id, e) => {
    // Avoid expanding when clicking buttons
    if (e.target.closest('button') || e.target.closest('svg')) return;
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="kite-card" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: '48px', borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters Bar */}
      <div 
        className="kite-card" 
        style={{ 
          borderRadius: 'var(--radius-card)', 
          padding: '12px 16px', 
          marginBottom: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', flexShrink: 0 }}>
          <Filter size={13} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</span>
        </div>

        {/* Search Text */}
        <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '280px' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search session, bias, key level, logs…"
            value={filters.asset}
            onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.value }))}
            className="kite-input"
            style={{ paddingLeft: '28px' }}
            id="search-filter-text"
          />
        </div>

        {/* CustomSelect for Outcome */}
        <div style={{ minWidth: '140px' }}>
          <CustomSelect
            name="outcome"
            value={filters.outcome}
            onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
            options={[
              { value: '', label: 'All Results', icon: '🔍' },
              { value: 'WIN', label: 'WIN ONLY', icon: '🟢' },
              { value: 'LOSS', label: 'LOSS ONLY', icon: '🔴' },
              { value: 'BREAKEVEN', label: 'BE ONLY', icon: '⚪' }
            ]}
            id="select-filter-outcome"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={onApplyFilters} className="kite-btn kite-btn-orange" id="btn-apply-filters" style={{ flexShrink: 0, padding: '7px 16px' }}>Apply</button>
          <button onClick={onClearFilters} className="kite-btn kite-btn-ghost" id="btn-clear-filters" style={{ flexShrink: 0, padding: '7px 16px' }}>Clear</button>
        </div>
      </div>

      {/* High-Density Interactive Table Card */}
      <div className="kite-card" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', borderColor: 'var(--border-color)' }}>
        {trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)' }}>
            <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: '13px', margin: '0 0 4px', fontWeight: '500' }}>No matching trade logs found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Try adjusting your filters or click "Log Trade" above</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'var(--bg-card)' }}>
            <table className="kite-table">
              <thead>
                <tr>
                  <th style={{ width: '44px', textAlign: 'center' }}></th>
                  <th>Date & Time</th>
                  <th>Session</th>
                  <th>Bias</th>
                  <th>Key Level</th>
                  <th>Tap</th>
                  <th>CISD</th>
                  <th>Buy/Sell</th>
                  <th>Risk</th>
                  <th>Net P&L (Result)</th>
                  <th>Outcome</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const pnlPos = trade.net_pnl > 0;
                  const pnlNeg = trade.net_pnl < 0;
                  const isExpanded = expandedTradeId === trade.id;
                  
                  return (
                    <React.Fragment key={trade.id}>
                      <tr 
                        onClick={(e) => toggleExpand(trade.id, e)} 
                        style={{ 
                          cursor: 'pointer', 
                          background: isExpanded ? 'var(--bg-row-hover)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          {isExpanded ? <ChevronUp size={14} style={{ color: '#f35936' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600' }}>{trade.trade_date}</div>
                          {trade.trade_time && <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '2px' }}>{trade.trade_time}</div>}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{trade.session || '—'}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '11.5px', 
                            color: trade.bias === 'Bullish' ? '#2ebd85' : trade.bias === 'Bearish' ? '#df514c' : 'var(--text-muted)',
                            fontWeight: '600'
                          }}>{trade.bias || '—'}</span>
                        </td>
                        <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{trade.key_level || '—'}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: trade.key_level_tap === 'YES' ? '#2ebd85' : '#df514c' 
                          }}>{trade.key_level_tap}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: trade.cisd === 'YES' ? '#2ebd85' : '#df514c' 
                          }}>{trade.cisd || 'NO'}</span>
                        </td>
                        <td>
                          <span className={trade.direction === 'BUY' ? 'badge-buy' : 'badge-sell'}>
                            {trade.direction === 'BUY' ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td>
                          <span className="num" style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px' }}>
                            {trade.risk != null ? `₹${trade.risk.toFixed(2)}` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="num" style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'monospace',
                            color: pnlPos ? '#2ebd85' : pnlNeg ? '#df514c' : 'var(--text-muted)'
                          }}>
                            {pnlPos ? '+' : ''}₹{trade.net_pnl.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={
                            trade.outcome === 'WIN' ? 'badge-win' :
                            trade.outcome === 'LOSS' ? 'badge-loss' : 'badge-be'
                          }>
                            {trade.outcome}
                          </span>
                        </td>
                        <td style={{ paddingRight: '20px' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => onEdit(trade)}
                              title="Edit trade log"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted)', padding: '5px', borderRadius: '6px',
                                display: 'flex', alignItems: 'center', transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#4184f3'; e.currentTarget.style.background = 'rgba(65,132,243,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => onDelete(trade)}
                              title="Delete trade log"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted)', padding: '5px', borderRadius: '6px',
                                display: 'flex', alignItems: 'center', transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#df514c'; e.currentTarget.style.background = 'rgba(223,81,76,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Text Log Narrative Box */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={12} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                              {/* Why this trade */}
                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#f35936' }}>
                                  <BookOpen size={14} />
                                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Part A: Why This Trade?
                                  </span>
                                </div>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                  {trade.why_this_trade || 'No setup notes logged for this trade.'}
                                </p>
                              </div>

                              {/* Emotion Mindset */}
                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#4184f3' }}>
                                  <Brain size={14} />
                                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Part B: Mindset & Psychology
                                  </span>
                                </div>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                  {trade.emotion_mindset || 'No psychological notes logged.'}
                                </p>
                              </div>

                              {/* Mistakes / Improvement */}
                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#df514c' }}>
                                  <ShieldAlert size={14} />
                                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Part C: Actionable Improvements
                                  </span>
                                </div>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                  {trade.mistake_improve || 'No improvements noted.'}
                                </p>
                              </div>
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
        )}

        {/* Footer info */}
        {trades.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySizing: 'space-between', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '11px' }}>
              Showing {trades.length} trade log{trades.length !== 1 ? 's' : ''} (Click any row to expand detailed text narratives)
            </span>
            <span style={{ fontSize: '11px', marginLeft: 'auto' }}>
              Kite High-Density UI v3
            </span>
          </div>
        )}
      </div>
    </>
  );
}
