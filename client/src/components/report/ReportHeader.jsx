import React, { useState, useEffect } from 'react';
import { Plus, ChevronUp, RefreshCw, Download, Zap } from 'lucide-react';

export default function ReportHeader({
  tradeCount, lastUpdated, isRefreshing,
  onRefresh, showForm, onToggleForm,
  onExportPdf, exportingPdf,
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
      padding: '16px 20px',
      background: '#ffffff',
      border: '1.5px solid #e0f2fe',
      borderRadius: '14px',
      boxShadow: '0 1px 6px rgba(6,182,212,0.07)',
    }}>
      {/* Left: Title + Live Badge + Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontSize: '18px', fontWeight: '800', color: '#0f172a',
              margin: 0, letterSpacing: '-0.4px',
            }}>
              Trade Report
            </h1>
            {tradeCount > 0 && (
              <span style={{
                background: '#0891b2', color: '#fff',
                fontSize: '11px', fontWeight: '800',
                padding: '2px 10px', borderRadius: '99px',
                letterSpacing: '0.04em',
              }}>
                {tradeCount} {tradeCount !== 1 ? 'trades' : 'trade'}
              </span>
            )}
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '5px', background: '#f0fdf4', border: '1px solid #bbf7d0',
              color: '#16a34a', fontSize: '10.5px', fontWeight: '700',
              padding: '2px 8px', borderRadius: '99px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#22c55e', display: 'inline-block',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              Live
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              Updated {relativeTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          id="report-btn-refresh"
          title="Refresh data"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '9px',
            background: 'transparent', border: '1.5px solid #e2e8f0',
            color: '#64748b', fontSize: '12.5px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.color = '#0891b2'; e.currentTarget.style.background = '#f0f9ff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
          Refresh
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPdf}
          disabled={exportingPdf}
          id="report-btn-export"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '9px',
            background: 'transparent', border: '1.5px solid #e2e8f0',
            color: '#64748b', fontSize: '12.5px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = '#faf5ff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Download size={13} />
          {exportingPdf ? 'Generating…' : 'Export PDF'}
        </button>

        {/* Log Trade */}
        <button
          onClick={onToggleForm}
          id="report-btn-toggle-form"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 18px', borderRadius: '9px',
            background: showForm ? '#f0f9ff' : 'linear-gradient(135deg, #0891b2, #0e7490)',
            border: showForm ? '1.5px solid #0891b2' : '1.5px solid transparent',
            color: showForm ? '#0891b2' : '#fff',
            fontSize: '12.5px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.15s ease',
            boxShadow: showForm ? 'none' : '0 2px 8px rgba(8,145,178,0.3)',
          }}
        >
          {showForm
            ? <><ChevronUp size={14} /> Hide Form</>
            : <><Zap size={14} /> Log Trade</>
          }
        </button>
      </div>
    </div>
  );
}
