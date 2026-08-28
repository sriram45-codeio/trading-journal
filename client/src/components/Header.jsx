import React from 'react';
import { LayoutDashboard, List, LogOut, Sun, Moon, BarChart3, Wallet } from 'lucide-react';

export default function Header({ activePage, setActivePage, onLogout, theme, toggleTheme }) {
  const userEmail = localStorage.getItem('tj_email') || 'admin@democompany.com';

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '32px' }}>
        <div style={{
          background: 'var(--accent-color)',
          width: '30px',
          height: '30px',
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
        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          ForexFlow <span style={{ fontSize: '10px', color: 'var(--accent-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Console</span>
        </span>
      </div>

      {/* Nav Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
        <NavTab
          label="Dashboard"
          icon={<LayoutDashboard size={14} />}
          active={activePage === 'dashboard'}
          onClick={() => setActivePage('dashboard')}
          id="nav-dashboard"
        />
        <NavTab
          label="Trade Log & Report"
          icon={<List size={14} />}
          active={activePage === 'trades'}
          onClick={() => setActivePage('trades')}
          id="nav-trades"
        />
        <NavTab
          label="Trade Capital"
          icon={<Wallet size={14} />}
          active={activePage === 'capital'}
          onClick={() => setActivePage('capital')}
          id="nav-capital"
        />
        <NavTab
          label="Trading Reports"
          icon={<BarChart3 size={14} />}
          active={activePage === 'reports'}
          onClick={() => setActivePage('reports')}
          id="nav-reports"
        />
      </nav>

      {/* Right User Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            width: '50px',
            height: '26px',
            position: 'relative',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            outline: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            left: theme === 'dark' ? '3px' : '25px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--accent-color)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {theme === 'dark' ? <Moon size={11} color="#fff" /> : <Sun size={11} color="#fff" />}
          </div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', pointerEvents: 'none' }}>
            <Moon size={11} style={{ color: 'var(--text-muted)', opacity: theme === 'dark' ? 0 : 0.6 }} />
            <Sun size={11} style={{ color: 'var(--text-muted)', opacity: theme === 'light' ? 0 : 0.6 }} />
          </div>
        </button>

        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          maxWidth: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {userEmail}
        </span>
        
        <button
          onClick={onLogout}
          id="btn-logout"
          className="kite-btn kite-btn-ghost"
          style={{ padding: '5px 12px', fontSize: '12px' }}
        >
          <LogOut size={13} />
          Logout
        </button>
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
        gap: '7px',
        padding: '6px 14px',
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
