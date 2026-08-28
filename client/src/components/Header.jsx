import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, List, LogOut, Sun, Moon, BarChart3, Wallet,
  Grid, Home, HelpCircle, MessageSquare, User, Settings, ShieldCheck, Activity
} from 'lucide-react';

export default function Header({ activePage, setActivePage, onLogout, theme, toggleTheme }) {
  const userEmail = localStorage.getItem('tj_email') || 'admin@democompany.com';
  const companyName = 'Demo Company Private Limited';
  const [showAppMenu, setShowAppMenu] = useState(false);
  const appMenuRef = useRef(null);

  // Close app grid menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
        setShowAppMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '20px',
      paddingRight: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* ── Top Left: Brand Logo & Company Badge ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px' }}>
        <div style={{
          background: 'var(--accent-color)',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
        }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M8 23 L16 9 L24 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M12 23 L16 16 L20 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.4"/>
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'block', lineHeight: 1.1 }}>
            ForexFlow
          </span>
          <span style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            background: 'var(--border-subtle)',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            display: 'inline-block',
            marginTop: '2px',
            fontWeight: '600'
          }}>
            {companyName}
          </span>
        </div>
      </div>

      {/* ── Top Center: Direct Navigation Tabs ── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
        <NavTab
          label="Dashboard"
          icon={<LayoutDashboard size={14} />}
          active={activePage === 'dashboard'}
          onClick={() => setActivePage('dashboard')}
          id="nav-dashboard"
        />
        <NavTab
          label="Trade Log"
          icon={<List size={14} />}
          active={activePage === 'trades'}
          onClick={() => setActivePage('trades')}
          id="nav-trades"
        />
        <NavTab
          label="Trading Reports"
          icon={<BarChart3 size={14} />}
          active={activePage === 'reports'}
          onClick={() => setActivePage('reports')}
          id="nav-reports"
        />
        <NavTab
          label="Trade Capital"
          icon={<Wallet size={14} />}
          active={activePage === 'capital'}
          onClick={() => setActivePage('capital')}
          id="nav-capital"
        />
      </nav>

      {/* ── Top Right: ChannelKonnect Quick Action Icons & 9-Dots Grid Menu ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} ref={appMenuRef}>
        
        {/* Quick Nav Icons */}
        <TopIconButton title="Home" onClick={() => setActivePage('dashboard')}>
          <Home size={15} />
        </TopIconButton>

        <TopIconButton title="Trade Feeds" onClick={() => setActivePage('trades')}>
          <MessageSquare size={15} />
        </TopIconButton>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            width: '46px',
            height: '24px',
            position: 'relative',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            outline: 'none',
            marginRight: '4px'
          }}
        >
          <div style={{
            position: 'absolute',
            left: theme === 'dark' ? '3px' : '23px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--accent-color)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {theme === 'dark' ? <Moon size={10} color="#fff" /> : <Sun size={10} color="#fff" />}
          </div>
        </button>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 9-DOTS APP GRID LAUNCHER BUTTON (ChannelKonnect Style) */}
        {/* ═══════════════════════════════════════════════════ */}
        <button
          onClick={() => setShowAppMenu(!showAppMenu)}
          title="Console App Launcher"
          id="btn-app-grid-launcher"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: showAppMenu ? 'var(--accent-light)' : 'transparent',
            border: `1px solid ${showAppMenu ? 'var(--accent-color)' : 'var(--border-color)'}`,
            color: showAppMenu ? 'var(--accent-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative'
          }}
        >
          <Grid size={16} />
        </button>

        {/* User Profile Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--accent-color)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          border: '2px solid var(--border-color)'
        }}
        title={userEmail}
        onClick={onLogout}
        >
          {userEmail.charAt(0).toUpperCase()}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* FLOATING 9-DOTS APP GRID POPOVER MENU MODAL */}
        {/* ═══════════════════════════════════════════════════ */}
        {showAppMenu && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            width: '380px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.18), 0 0 20px rgba(0, 0, 0, 0.05)',
            padding: '20px',
            zIndex: 99999,
            animation: 'slideInDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>
                ForexFlow Console Modules
              </span>
              <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                ChannelKonnect v2
              </span>
            </div>

            {/* Grid Module Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              
              {/* Tile 1: Dashboard */}
              <AppGridTile
                label="Dashboard"
                icon={<LayoutDashboard size={20} color="#2563eb" />}
                bg="#eff6ff"
                onClick={() => { setActivePage('dashboard'); setShowAppMenu(false); }}
              />

              {/* Tile 2: Trade Logs */}
              <AppGridTile
                label="Trade Logs"
                icon={<List size={20} color="#7c3aed" />}
                bg="#f5f3ff"
                onClick={() => { setActivePage('trades'); setShowAppMenu(false); }}
              />

              {/* Tile 3: Reports */}
              <AppGridTile
                label="Reports"
                icon={<BarChart3 size={20} color="#10b981" />}
                bg="#ecfdf5"
                onClick={() => { setActivePage('reports'); setShowAppMenu(false); }}
              />

              {/* Tile 4: Capital */}
              <AppGridTile
                label="Capital"
                icon={<Wallet size={20} color="#f59e0b" />}
                bg="#fffbeb"
                onClick={() => { setActivePage('capital'); setShowAppMenu(false); }}
              />

              {/* Tile 5: Analytics */}
              <AppGridTile
                label="Analytics"
                icon={<Activity size={20} color="#06b6d4" />}
                bg="#ecfeff"
                onClick={() => { setActivePage('dashboard'); setShowAppMenu(false); }}
              />

              {/* Tile 6: Security */}
              <AppGridTile
                label="Security"
                icon={<ShieldCheck size={20} color="#059669" />}
                bg="#ecfdf5"
                onClick={() => { setShowAppMenu(false); }}
              />

              {/* Tile 7: Settings */}
              <AppGridTile
                label="Settings"
                icon={<Settings size={20} color="#4b5563" />}
                bg="#f3f4f6"
                onClick={() => { setShowAppMenu(false); }}
              />

              {/* Tile 8: Account */}
              <AppGridTile
                label="Logout"
                icon={<LogOut size={20} color="#ef4444" />}
                bg="#fef2f2"
                onClick={() => { onLogout(); setShowAppMenu(false); }}
              />

            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
              Connected as <strong style={{ color: '#475569' }}>{userEmail}</strong>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavTab({ label, icon, active, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12.5px',
        fontWeight: active ? '700' : '500',
        color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-light)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { 
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-row-hover)';
        }
      }}
      onMouseLeave={e => { 
        if (!active) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function TopIconButton({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-row-hover)';
        e.currentTarget.style.color = 'var(--accent-color)';
        e.currentTarget.style.borderColor = 'var(--accent-color)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {children}
    </button>
  );
}

function AppGridTile({ label, icon, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '12px 6px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#f1f5f9';
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: bg || '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}
