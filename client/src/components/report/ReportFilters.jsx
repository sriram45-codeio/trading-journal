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
      background: '#ffffff',
      border: '1.5px solid #e0f2fe',
      borderRadius: '14px',
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      boxShadow: '0 1px 4px rgba(6,182,212,0.06)',
    }}>
      {/* Filter icon label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0891b2', flexShrink: 0 }}>
        <SlidersHorizontal size={14} />
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          Filters
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: '#e0f2fe', flexShrink: 0 }} />

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
            height: '34px', borderRadius: '9px',
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
            fontSize: '12.5px', color: '#0f172a', outline: 'none',
            transition: 'border-color 0.15s ease',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = '#0891b2'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: '#e0f2fe', flexShrink: 0 }} />

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
                borderColor: winActive ? '#10b981' : lossActive ? '#f43f5e' : isActive ? '#0891b2' : '#e2e8f0',
                background: winActive ? 'rgba(16,185,129,0.1)' : lossActive ? 'rgba(244,63,94,0.1)' : isActive ? 'rgba(8,145,178,0.1)' : '#f8fafc',
                color: winActive ? '#059669' : lossActive ? '#e11d48' : isActive ? '#0891b2' : '#64748b',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: '#e0f2fe', flexShrink: 0 }} />

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
                borderColor: isActive ? '#0891b2' : '#e2e8f0',
                background: isActive ? 'rgba(8,145,178,0.1)' : '#f8fafc',
                color: isActive ? '#0891b2' : '#64748b',
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
            border: '1.5px solid rgba(225,29,72,0.3)',
            background: 'rgba(225,29,72,0.06)',
            color: '#e11d48',
          }}
        >
          <X size={12} />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
