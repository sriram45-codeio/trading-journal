import React from 'react';
import { LayoutDashboard, List, LogOut, Sun, Moon } from 'lucide-react';

export default function Header({ activePage, setActivePage, onLogout, theme, toggleTheme }) {
  const userEmail = localStorage.getItem('tj_email') || 'user@example.com';

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      height: '54px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '20px',
      paddingRight: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Sleek Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '36px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f35936 0%, #ff7f50 100%)',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(243, 89, 54, 0.3)'
        }}>
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M8 23 L16 9 L24 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M12 23 L16 16 L20 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.4"/>
          </svg>
        </div>
        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Journal
        </span>
      </div>

      {/* Nav Links styled as modern rounded pills */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
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
      </nav>

      {/* Right side items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Premium Sliding Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            width: '54px',
            height: '28px',
            position: 'relative',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          {/* Animated sliding slider circle */}
          <div style={{
            position: 'absolute',
            left: theme === 'dark' ? '3px' : '27px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: theme === 'dark' ? '#f35936' : '#4184f3',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {theme === 'dark' ? (
              <Moon size={11} color="#fff" />
            ) : (
              <Sun size={11} color="#fff" />
            )}
          </div>
          
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', pointerEvents: 'none' }}>
            <Moon size={12} style={{ color: theme === 'dark' ? '#f35936' : 'var(--text-muted)', opacity: theme === 'dark' ? 0 : 0.5 }} />
            <Sun size={12} style={{ color: theme === 'light' ? '#4184f3' : 'var(--text-muted)', opacity: theme === 'light' ? 0 : 0.5 }} />
          </div>
        </button>

        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
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
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-btn)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '5px 12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.color = '#df514c'; 
            e.currentTarget.style.borderColor = 'rgba(223, 81, 76, 0.5)';
            e.currentTarget.style.background = 'rgba(223, 81, 76, 0.05)';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.color = 'var(--text-secondary)'; 
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'none';
          }}
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
        gap: '8px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-btn)',
        fontSize: '13px',
        fontWeight: active ? '600' : '500',
        color: active ? '#f35936' : 'var(--text-secondary)',
        background: active ? 'rgba(243, 89, 54, 0.08)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
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
