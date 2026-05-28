import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const outcomeChips = [
  { value: '', label: 'All' },
  { value: 'WIN', label: '✦ Wins' },
  { value: 'LOSS', label: '✦ Losses' },
];

const sessionChips = [
  { value: '', label: 'All Sessions' },
  { value: 'London', label: 'London' },
  { value: 'NY', label: 'NY' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Pre-Market', label: 'Pre-Mkt' },
];

export default function ReportFilters({
  searchText, onSearchChange,
  outcomeFilter, onOutcomeChange,
  sessionFilter, onSessionChange,
  onClear,
}) {
  const activeCount = [searchText, outcomeFilter, sessionFilter].filter(Boolean).length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-color)',
      borderRadius: 'var(--radius-card)',
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Filter icon label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', flexShrink: 0 }}>
        <SlidersHorizontal size={14} />
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Filters
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '280px' }}>
        <Search size={13} style={{
          position: 'absolute', left: '11px', top: '50%',
          transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search trades…"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          id="report-search-input"
          style={{
            width: '100%', paddingLeft: '32px', paddingRight: '12px',
            height: '34px', borderRadius: 'var(--radius-input)',
            border: '1.5px solid var(--border-color)', background: 'var(--bg-input)',
            fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none',
            transition: 'border-color 0.15s ease',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent-color)'; e.target.style.background = 'var(--bg-input)'; e.target.style.boxShadow = '0 0 0 2px rgba(255, 87, 34, 0.15)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-input)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

      {/* Outcome Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {outcomeChips.map(chip => {
          const isActive = outcomeFilter === chip.value;
          const winActive = chip.value === 'WIN' && isActive;
          const lossActive = chip.value === 'LOSS' && isActive;
          return (
            <button
              key={chip.value}
              onClick={() => onOutcomeChange(chip.value)}
              id={`filter-outcome-${chip.value || 'all'}`}
              style={{
                padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px',
                fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease',
                border: '1.5px solid',
                borderColor: winActive ? 'var(--win-green)' : lossActive ? 'var(--loss-red)' : isActive ? 'var(--accent-color)' : 'var(--border-color)',
                background: winActive ? 'rgba(0, 162, 124, 0.1)' : lossActive ? 'rgba(223, 81, 76, 0.1)' : isActive ? 'rgba(255, 87, 34, 0.08)' : 'var(--bg-input)',
                color: winActive ? 'var(--win-green)' : lossActive ? 'var(--loss-red)' : isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

      {/* Session Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {sessionChips.map(chip => {
          const isActive = sessionFilter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => onSessionChange(chip.value)}
              id={`filter-session-${chip.value || 'all'}`}
              style={{
                padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease',
                border: '1.5px solid',
                borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'var(--bg-input)',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Clear Filters */}
      {activeCount > 0 && (
        <button
          onClick={onClear}
          id="report-filter-clear"
          style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 13px', borderRadius: '99px', fontSize: '11.5px',
            fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease',
            border: '1.5px solid rgba(223, 81, 76, 0.3)',
            background: 'rgba(223, 81, 76, 0.08)',
            color: 'var(--loss-red)',
          }}
        >
          <X size={12} />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
