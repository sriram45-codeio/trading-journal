import React from 'react';
import { Search, X } from 'lucide-react';

const outcomeChips = [
  { value: '', label: 'All', icon: '🔍' },
  { value: 'WIN', label: 'Wins', icon: '🟢' },
  { value: 'LOSS', label: 'Losses', icon: '🔴' },
];

const sessionChips = [
  { value: '', label: 'All Sessions' },
  { value: 'London', label: 'London' },
  { value: 'NY', label: 'NY' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Pre-Market', label: 'Pre-Mkt' },
];

export default function ReportFilters({
  searchText,
  onSearchChange,
  outcomeFilter,
  onOutcomeChange,
  sessionFilter,
  onSessionChange,
  onClear,
}) {
  const activeCount = [searchText, outcomeFilter, sessionFilter].filter(Boolean).length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '14px 18px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexWrap: 'wrap',
      transition: 'all 0.2s ease',
    }}>
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '300px' }}>
        <Search size={14} style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search trades…"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="report-search"
          id="report-search-input"
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border-color)', flexShrink: 0 }} />

      {/* Outcome Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {outcomeChips.map(chip => (
          <button
            key={chip.value}
            onClick={() => onOutcomeChange(chip.value)}
            className={`filter-chip ${outcomeFilter === chip.value ? 'filter-chip-active' : ''}`}
            id={`filter-outcome-${chip.value || 'all'}`}
          >
            <span style={{ fontSize: '12px' }}>{chip.icon}</span>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border-color)', flexShrink: 0 }} />

      {/* Session Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {sessionChips.map(chip => (
          <button
            key={chip.value}
            onClick={() => onSessionChange(chip.value)}
            className={`filter-chip ${sessionFilter === chip.value ? 'filter-chip-active' : ''}`}
            id={`filter-session-${chip.value || 'all'}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="filter-chip"
          style={{
            marginLeft: 'auto',
            color: '#df514c',
            borderColor: 'rgba(223, 81, 76, 0.3)',
            background: 'rgba(223, 81, 76, 0.06)',
          }}
          id="report-filter-clear"
        >
          <X size={12} />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
