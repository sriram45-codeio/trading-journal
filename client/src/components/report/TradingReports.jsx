import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, AlertCircle, BarChart3, Trophy, Target,
  TrendingDown, RefreshCw, Download, Search,
  BookOpen, Brain, ShieldAlert, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, Eye, FileText, SlidersHorizontal, X, Wallet
} from 'lucide-react';
import api from '../../api/axios';
import Toast from '../Toast';

const POLL_INTERVAL = 30000;

export default function TradingReports() {
  const [activeReportTab, setActiveReportTab] = useState('overall'); // 'overall' or 'monthly'
  const [trades, setTrades] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [monthlyExporting, setMonthlyExporting] = useState({});
  const pollRef = useRef(null);

  const fetchAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append('asset', searchText);
      if (outcomeFilter) params.append('outcome', outcomeFilter);
      
      const [tradesRes, analyticsRes, monthlyRes] = await Promise.all([
        api.get(`/trades?${params.toString()}`),
        api.get('/analytics/summary'),
        api.get('/analytics/monthly-report')
      ]);
      
      setTrades(tradesRes.data.trades);
      setAnalytics(analyticsRes.data);
      setMonthlyReports(monthlyRes.data.reports || []);
      setLastUpdated(Date.now());
    } catch (err) {
      setToast({ message: 'Failed to load report data', type: 'error' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchText, outcomeFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    pollRef.current = setInterval(() => fetchAll(false), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  const filteredTrades = sessionFilter ? trades.filter(t => t.session === sessionFilter) : trades;

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get('/trades/export-pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'overall-trading-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: 'Overall report exported successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate overall report PDF', type: 'error' });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportMonthlyPdf = async (monthKey) => {
    setMonthlyExporting(prev => ({ ...prev, [monthKey]: true }));
    try {
      const response = await api.get(`/trades/export-monthly-pdf?month=${monthKey}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-trading-report-${monthKey}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: `Monthly report for ${monthKey} exported successfully`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate monthly PDF', type: 'error' });
    } finally {
      setMonthlyExporting(prev => ({ ...prev, [monthKey]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            height: i === 0 ? '80px' : '120px', borderRadius: 'var(--radius-card)',
            background: 'var(--border-subtle)', marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            border: '1.5px solid var(--border-color)',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  const pnlColor = analytics?.total_net_pnl >= 0 ? 'var(--win-green)' : 'var(--loss-red)';

  return (
    <div style={{ padding: '24px 30px', maxWidth: '1250px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-btn)',
              background: 'var(--accent-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 87, 34, 0.25)',
              color: '#fff'
            }}>
              <FileText size={18} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Trading Performance Reports</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 46px' }}>
            View comprehensive trade performance reports and export summaries to PDF
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => fetchAll(true)}
            className="kite-btn kite-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12.5px' }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'spin-animation' : ''} />
            Refresh
          </button>
          {activeReportTab === 'overall' && (
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="kite-btn kite-btn-blue"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12.5px' }}
            >
              <Download size={13} />
              {exportingPdf ? 'Exporting...' : 'Export Overall Report'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Segment Controls */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveReportTab('overall')}
          style={{
            padding: '8px 20px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer', background: activeReportTab === 'overall' ? 'var(--bg-card)' : 'transparent',
            color: activeReportTab === 'overall' ? 'var(--accent-color)' : 'var(--text-muted)',
            boxShadow: activeReportTab === 'overall' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease', fontFamily: 'inherit'
          }}
        >
          Overall Report Log
        </button>
        <button
          onClick={() => setActiveReportTab('monthly')}
          style={{
            padding: '8px 20px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer', background: activeReportTab === 'monthly' ? 'var(--bg-card)' : 'transparent',
            color: activeReportTab === 'monthly' ? 'var(--accent-color)' : 'var(--text-muted)',
            boxShadow: activeReportTab === 'monthly' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease', fontFamily: 'inherit'
          }}
        >
          Monthly Trade Report
        </button>
      </div>

      {/* Tab 1: Overall Report Log */}
      {activeReportTab === 'overall' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Analytics Summary */}
          {analytics && analytics.total_trades > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <StatCard icon={<BarChart3 size={15} />} label="Total Trades" value={analytics.total_trades} sub={`${analytics.total_wins} Wins · ${analytics.total_losses} Losses`} color="var(--accent-color)" />
              <StatCard icon={<TrendingUp size={15} />} label="Net P&L" value={`${analytics.total_net_pnl >= 0 ? '+' : ''}$${analytics.total_net_pnl.toFixed(2)}`} sub={analytics.total_net_pnl >= 0 ? 'Account profitable' : 'Net Loss incurred'} color={pnlColor} />
              <StatCard icon={<Trophy size={15} />} label="Win Rate" value={`${analytics.win_rate}%`} sub="of total trades" color={analytics.win_rate >= 50 ? 'var(--win-green)' : 'var(--loss-red)'} />
              <StatCard icon={<Target size={15} />} label="Discipline Rate" value={`${analytics.rules_followed_rate}%`} sub="Key level tap alignment" color="var(--accent-color)" />
            </div>
          )}

          {/* Filters Bar */}
          <div style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-card)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', flexShrink: 0 }}>
              <SlidersHorizontal size={13} />
              <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Filters</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />
            
            <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '260px' }}>
              <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)' }} />
              <input type="text" placeholder="Search setups..." value={searchText} onChange={e => setSearchText(e.target.value)} className="kite-input" style={{ paddingLeft: '28px', fontSize: '12.5px', height: '34px' }} />
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />
            
            {/* Outcome Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['', 'WIN', 'LOSS'].map(v => {
                const isActive = outcomeFilter === v;
                return (
                  <button key={v} onClick={() => setOutcomeFilter(v)} style={{
                    padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                    borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                    background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
                    fontFamily: 'inherit'
                  }}>{v === '' ? 'All Results' : v === 'WIN' ? 'Wins' : 'Losses'}</button>
                );
              })}
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

            {/* Session Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['', 'London', 'NY', 'Asia', 'Pre-Market'].map(v => {
                const isActive = sessionFilter === v;
                return (
                  <button key={v} onClick={() => setSessionFilter(v)} style={{
                    padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                    borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                    background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
                    fontFamily: 'inherit'
                  }}>{v || 'All Sessions'}</button>
                );
              })}
            </div>
          </div>

          {/* Compact Trade Log Table */}
          {filteredTrades.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
            }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '13.5px', margin: '0 0 6px', fontWeight: '700' }}>No trade logs match your filter</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Try clearing some filters above</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: '700' }}>
                    <th style={{ padding: '10px 16px' }}>Date</th>
                    <th style={{ padding: '10px 16px' }}>ID</th>
                    <th style={{ padding: '10px 16px' }}>Session</th>
                    <th style={{ padding: '10px 16px' }}>Asset / Setup</th>
                    <th style={{ padding: '10px 16px' }}>Direction</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Risk ($)</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>R:R</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Outcome</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Net P&L</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Balance</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => {
                    const isBuy = trade.direction === 'BUY';
                    const isWin = trade.outcome === 'WIN';
                    const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
                    
                    return (
                      <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} className="table-row-hover">
                        <td style={{ padding: '10px 16px', fontWeight: '600' }}>{trade.trade_date}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>#{trade.id}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ background: 'rgba(255, 87, 34, 0.08)', color: 'var(--accent-color)', padding: '1px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '600', border: '1px solid rgba(255, 87, 34, 0.2)' }}>
                            {trade.session || 'London'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                          {trade.bias} {trade.key_level ? `| ${trade.key_level}` : ''}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ color: isBuy ? 'var(--buy-blue)' : 'var(--sell-red)', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {isBuy ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {trade.direction}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                          ${trade.risk != null ? trade.risk.toFixed(0) : '0'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {trade.rr_ratio || '1:1'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', padding: '1px 6px', borderRadius: 'var(--radius-badge)',
                            fontSize: '9.5px', fontWeight: '800',
                            background: isWin ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
                            color: isWin ? 'var(--win-green)' : 'var(--loss-red)',
                            border: `1px solid ${isWin ? 'rgba(0, 162, 124, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`
                          }}>
                            {trade.outcome}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: pnlColor }}>
                          {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                          ${trade.balance_after ? trade.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="kite-btn kite-btn-ghost"
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto', color: 'var(--accent-color)', border: '1px solid var(--border-color)'
                            }}
                            title="View Trade Details"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Monthly Trade Report */}
      {activeReportTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {monthlyReports.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
            }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '13.5px', margin: '0 0 6px', fontWeight: '700' }}>No monthly report logs generated</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Trades will be grouped by month automatically once logged.</p>
            </div>
          ) : (
            monthlyReports.map((monthRep) => {
              const isMonthProfit = monthRep.total_net_pnl >= 0;
              const monthPnlColor = isMonthProfit ? 'var(--win-green)' : 'var(--loss-red)';
              
              return (
                <div key={monthRep.month} style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.04)'
                }}>
                  {/* Month header row */}
                  <div style={{
                    padding: '16px 20px',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1.5px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={18} style={{ color: 'var(--accent-color)' }} />
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {formatMonthName(monthRep.month)} Summary
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => handleExportMonthlyPdf(monthRep.month)}
                      disabled={monthlyExporting[monthRep.month]}
                      className="kite-btn kite-btn-ghost"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px',
                        border: '1px solid var(--border-color)', color: 'var(--accent-color)', background: 'var(--bg-card)'
                      }}
                    >
                      <Download size={12} />
                      {monthlyExporting[monthRep.month] ? 'Exporting...' : 'Export Month PDF'}
                    </button>
                  </div>

                  {/* Monthly Stats Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', padding: '16px 20px', gap: '14px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <div style={monthStatBoxStyle}>
                      <span style={monthStatLabelStyle}>Starting Balance</span>
                      <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        ${monthRep.starting_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div style={monthStatBoxStyle}>
                      <span style={monthStatLabelStyle}>Ending Balance</span>
                      <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        ${monthRep.ending_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div style={monthStatBoxStyle}>
                      <span style={monthStatLabelStyle}>Net Profit/Loss</span>
                      <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: monthPnlColor }}>
                        {monthRep.total_net_pnl > 0 ? '+' : ''}${monthRep.total_net_pnl.toFixed(2)}
                      </strong>
                    </div>
                    <div style={monthStatBoxStyle}>
                      <span style={monthStatLabelStyle}>Trades / Win Rate</span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {monthRep.total_trades} Trades ({monthRep.win_rate}%)
                      </strong>
                    </div>
                  </div>

                  {/* Month Trades list */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: '600' }}>
                          <th style={{ padding: '8px 16px' }}>Date</th>
                          <th style={{ padding: '8px 16px' }}>ID</th>
                          <th style={{ padding: '8px 16px' }}>Setup Details</th>
                          <th style={{ padding: '8px 16px' }}>Direction</th>
                          <th style={{ padding: '8px 16px', textAlign: 'right' }}>Risk ($)</th>
                          <th style={{ padding: '8px 16px', textAlign: 'center' }}>R:R</th>
                          <th style={{ padding: '8px 16px', textAlign: 'center' }}>Outcome</th>
                          <th style={{ padding: '8px 16px', textAlign: 'right' }}>Net P&L</th>
                          <th style={{ padding: '8px 16px', textAlign: 'right' }}>Account Balance</th>
                          <th style={{ padding: '8px 16px', textAlign: 'center' }}>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthRep.trades.map((trade) => {
                          const isBuy = trade.direction === 'BUY';
                          const isWin = trade.outcome === 'WIN';
                          const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
                          
                          return (
                            <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }} className="table-row-hover">
                              <td style={{ padding: '8px 16px', fontWeight: '600' }}>{trade.trade_date}</td>
                              <td style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>#{trade.id}</td>
                              <td style={{ padding: '8px 16px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {trade.session} · {trade.bias} {trade.key_level ? `(${trade.key_level})` : ''}
                                </span>
                              </td>
                              <td style={{ padding: '8px 16px' }}>
                                <span style={{ color: isBuy ? 'var(--buy-blue)' : 'var(--sell-red)', fontWeight: '700', fontSize: '10.5px' }}>
                                  {trade.direction}
                                </span>
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                                ${trade.risk != null ? trade.risk.toFixed(0) : '0'}
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                                {trade.rr_ratio || '1:1'}
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-flex', padding: '1px 5px', borderRadius: '4px',
                                  fontSize: '9px', fontWeight: '800',
                                  background: isWin ? 'rgba(0, 162, 124, 0.08)' : 'rgba(223, 81, 76, 0.08)',
                                  color: isWin ? 'var(--win-green)' : 'var(--loss-red)',
                                  border: `1px solid ${isWin ? 'rgba(0, 162, 124, 0.2)' : 'rgba(223, 81, 76, 0.2)'}`
                                }}>
                                  {trade.outcome}
                                </span>
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: pnlColor }}>
                                {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                                ${trade.balance_after ? trade.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                                <button
                                  onClick={() => setSelectedTrade(trade)}
                                  className="kite-btn kite-btn-ghost"
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto', color: 'var(--accent-color)', border: '1px solid var(--border-color)'
                                  }}
                                  title="View Details"
                                >
                                  <Eye size={11} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Trade Detail Modal (Eye Button) */}
      {selectedTrade && (
        <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  );
}

// ── Helpers & Inner Components ──

function formatMonthName(monthStr) {
  // input: "YYYY-MM" -> output: e.g. "May 2026"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
      borderRadius: 'var(--radius-card)', padding: '16px 20px', flex: 1, minWidth: '140px',
      backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: color || 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function TradeDetailModal({ trade, onClose }) {
  const isWin = trade.outcome === 'WIN';
  const isBuy = trade.direction === 'BUY';
  const pnlColor = trade.net_pnl > 0 ? 'var(--win-green)' : trade.net_pnl < 0 ? 'var(--loss-red)' : 'var(--text-muted)';
  const dirColor = isBuy ? 'var(--buy-blue)' : 'var(--sell-red)';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-card)', width: '100%', maxWidth: '600px',
        overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: isWin ? 'rgba(0, 162, 124, 0.05)' : 'rgba(223, 81, 76, 0.05)',
          borderBottom: '1.5px solid var(--border-color)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Trade #{trade.id} Details
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Logged on {trade.trade_date} {trade.trade_time || ''}
            </span>
          </div>
          <button onClick={onClose} className="kite-btn kite-btn-ghost" style={{ padding: '4px', minWidth: 'auto', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={modalLabelStyle}>Direction</div>
              <span style={{ fontWeight: '700', color: dirColor, fontSize: '13px' }}>{trade.direction}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={modalLabelStyle}>Risk ($)</div>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>${trade.risk != null ? trade.risk : '0'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={modalLabelStyle}>R:R Ratio</div>
              <span style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '13px' }}>{trade.rr_ratio || '1:1'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={modalLabelStyle}>Net P&L</div>
              <span style={{ fontWeight: '800', color: pnlColor, fontSize: '13px' }}>
                {trade.net_pnl > 0 ? '+' : ''}${trade.net_pnl.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checklist Verification */}
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '0.04em' }}>Checklist Verification</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div>Session: <strong style={{ color: 'var(--text-primary)' }}>{trade.session || '—'}</strong></div>
              <div>Bias: <strong style={{ color: 'var(--text-primary)' }}>{trade.bias || '—'}</strong></div>
              <div>Key Level: <strong style={{ color: 'var(--text-primary)' }}>{trade.key_level || '—'}</strong></div>
              <div>Key Level Tap: <strong style={{ color: trade.key_level_tap === 'YES' ? 'var(--win-green)' : 'var(--loss-red)' }}>{trade.key_level_tap || 'NO'}</strong></div>
              <div>CISD Formed: <strong style={{ color: trade.cisd === 'YES' ? 'var(--win-green)' : 'var(--loss-red)' }}>{trade.cisd || 'NO'}</strong></div>
            </div>
          </div>

          {/* Narrative Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <NarrativeBlock icon={<BookOpen size={12} />} label="Why This Trade?" content={trade.why_this_trade} color="var(--accent-color)" />
            <NarrativeBlock icon={<Brain size={12} />} label="Mindset & Psychology" content={trade.emotion_mindset} color="var(--accent-color)" />
            <NarrativeBlock icon={<ShieldAlert size={12} />} label="Improvements / Mistakes" content={trade.mistake_improve} color="var(--loss-red)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NarrativeBlock({ icon, label, content, color }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-card)',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
        {content || 'No notes logged.'}
      </p>
    </div>
  );
}

const modalLabelStyle = {
  fontSize: '9.5px',
  color: 'var(--text-muted)',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '2px'
};

const monthStatBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  background: 'var(--bg-card)',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)'
};

const monthStatLabelStyle = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};
