import React, { useState, useEffect } from 'react';
import { Plus, ChevronUp, RefreshCw, Download, FileText } from 'lucide-react';

export default function ReportHeader({
  tradeCount,
  lastUpdated,
  isRefreshing,
  onRefresh,
  showForm,
  onToggleForm,
  onExportPdf,
  exportingPdf,
}) {
  const [relativeTime, setRelativeTime] = useState('just now');

  useEffect(() => {
    if (!lastUpdated) return;
    const update = () => {
      const diff = Math.floor((Date.now() - lastUpdated) / 1000);
      if (diff < 5) setRelativeTime('just now');
      else if (diff < 60) setRelativeTime(`${diff}s ago`);
      else if (diff < 3600) setRelativeTime(`${Math.floor(diff / 60)}m ago`);
      else setRelativeTime(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      {/* Left: Title + Status */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.3px',
          }}>
            Report
          </h1>
          {tradeCount > 0 && (
            <span style={{
              background: 'rgba(243, 89, 54, 0.1)',
              border: '1px solid rgba(243, 89, 54, 0.25)',
              color: '#f35936',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 10px',
              borderRadius: '12px',
            }}>
              {tradeCount} trade{tradeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Live Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '5px',
        }}>
          <div className="pulse-dot" />
          <span style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: '500',
          }}>
            Live · Updated {relativeTime}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onRefresh}
          className="kite-btn kite-btn-ghost"
          title="Refresh data"
          id="report-btn-refresh"
          style={{ padding: '7px 14px' }}
          disabled={isRefreshing}
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
          Refresh
        </button>

        <button
          onClick={onExportPdf}
          disabled={exportingPdf}
          className="kite-btn kite-btn-ghost"
          id="report-btn-export"
          style={{ padding: '7px 14px' }}
        >
          <Download size={13} />
          {exportingPdf ? 'Generating…' : 'PDF'}
        </button>

        <button
          onClick={onToggleForm}
          className={`kite-btn ${showForm ? 'kite-btn-ghost' : 'kite-btn-orange'}`}
          id="report-btn-toggle-form"
          style={{ padding: '7px 16px' }}
        >
          {showForm ? <><ChevronUp size={14} /> Hide Form</> : <><Plus size={14} /> Log Trade</>}
        </button>
      </div>
    </div>
  );
}
