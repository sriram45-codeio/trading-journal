import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, TrendingUp, BarChart3, Trophy, Target, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import api from '../api/axios';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-color)',
      borderRadius: 'var(--radius-card)',
      padding: '18px 22px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.25s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 87, 34, 0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {icon && <span style={{ color: color || 'var(--accent-color)' }}>{icon}</span>}
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: color || 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>{sub}</div>}
    </div>
  );
}

function WinRateRing({ percentage }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const ringColor = percentage >= 50 ? 'var(--win-green)' : 'var(--loss-red)';
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} stroke="var(--border-subtle)" strokeWidth="7" fill="none" />
      <circle
        cx="50" cy="50" r={r}
        stroke={ringColor} strokeWidth="7" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
        style={{ fill: ringColor, fontSize: '16px', fontWeight: '800', fontFamily: 'Inter, sans-serif' }}>
        {percentage}%
      </text>
    </svg>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '0 0 4px', fontWeight: '600' }}>{label}</p>
        <p style={{ color: val >= 0 ? 'var(--win-green)' : 'var(--loss-red)', fontSize: '14px', fontWeight: '800', margin: 0, fontFamily: 'monospace' }}>
          {val >= 0 ? '+' : ''}${val.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/summary');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get('/trades/export-pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'trading-report.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '16px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              height: '110px', borderRadius: 'var(--radius-card)',
              background: 'var(--border-subtle)',
              border: '1.5px solid var(--border-color)',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
        <div style={{
          height: '320px', borderRadius: 'var(--radius-card)',
          background: 'var(--border-subtle)',
          border: '1.5px solid var(--border-color)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
    );
  }

  if (!analytics || analytics.total_trades === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '14px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255, 87, 34, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(255, 87, 34, 0.1)',
        }}>
          <TrendingUp size={36} style={{ color: 'var(--accent-color)' }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>No trades yet. Log your first trade to see analytics.</p>
      </div>
    );
  }

  const lastPnl = analytics.pnl_by_date[analytics.pnl_by_date.length - 1]?.cumulative_pnl || 0;
  const lineColor = lastPnl >= 0 ? 'var(--win-green)' : 'var(--loss-red)';
  const fillColor = lastPnl >= 0 ? 'var(--win-green)' : 'var(--loss-red)';
  const pnlColor = analytics.total_net_pnl >= 0 ? 'var(--win-green)' : 'var(--loss-red)';

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Performance Dashboard</h1>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: '500' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchAnalytics} className="kite-btn kite-btn-ghost" id="btn-refresh-analytics" style={{ padding: '8px 16px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={handleExportPdf} disabled={exportingPdf} className="kite-btn kite-btn-blue" id="btn-export-pdf" style={{ padding: '8px 16px' }}>
            <Download size={13} /> {exportingPdf ? 'Generating…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '20px', alignItems: 'stretch' }}>
        {/* Win Rate Ring */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          padding: '18px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <WinRateRing percentage={analytics.win_rate} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Win Rate</span>
        </div>

        <StatCard icon={<BarChart3 size={15} />} label="Net P&L" value={`${analytics.total_net_pnl >= 0 ? '+' : ''}$${analytics.total_net_pnl.toFixed(2)}`} color={pnlColor} sub={`${analytics.total_trades} total trades`} />
        <StatCard icon={<Trophy size={15} />} label="Wins / Losses" value={`${analytics.total_wins} / ${analytics.total_losses}`} color="var(--text-primary)"
          sub={
            <div style={{ marginTop: '6px' }}>
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: analytics.total_trades > 0 ? `${(analytics.total_wins / analytics.total_trades) * 100}%` : '0%',
                  background: 'linear-gradient(90deg, var(--accent-color), var(--win-green))',
                  transition: 'width 0.5s ease',
                  borderRadius: '3px',
                }} />
              </div>
            </div>
          }
        />
        <StatCard icon={<TrendingUp size={15} />} label="Avg Win" value={analytics.avg_win != null ? `$${parseFloat(analytics.avg_win).toFixed(2)}` : '—'} color="var(--win-green)" sub="per winning trade" />
        <StatCard icon={<Target size={15} />} label="Discipline" value={`${analytics.rules_followed_rate}%`} color="var(--accent-color)" sub="rules followed" />
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 24px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', margin: 0,
          }}>Cumulative P&L</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{analytics.pnl_by_date.length} data points</span>
        </div>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.pnl_by_date} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="trade_date"
                stroke="var(--border-color)"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                stroke="var(--border-color)"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
                axisLine={false} tickLine={false} width={64}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="var(--border-color)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="cumulative_pnl"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#pnlGrad)"
                dot={false}
                activeDot={{ r: 5, fill: lineColor, stroke: 'var(--bg-card)', strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
