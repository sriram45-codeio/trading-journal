import React from 'react';
import { TrendingUp, LayoutDashboard, List, LogOut, User, BarChart3, Wallet } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const userEmail = localStorage.getItem('tj_email') || 'user@example.com';

  const getLinkStyle = (page) => {
    const isActive = activePage === page;
    return {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-btn)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      fontSize: '13.5px',
      fontWeight: '600',
      textAlign: 'left',
      fontFamily: 'inherit',
      background: isActive ? 'rgba(255, 87, 34, 0.08)' : 'transparent',
      color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
      boxShadow: 'none',
      borderLeft: isActive ? '3.5px solid var(--accent-color)' : '3.5px solid transparent',
    };
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex w-64 flex-col h-full"
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1.5px solid var(--border-color)',
        }}
      >
        <div 
          className="p-6" 
          style={{ borderBottom: '1.5px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              style={{
                background: 'var(--accent-color)',
                padding: '8px',
                borderRadius: 'var(--radius-btn)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(255, 87, 34, 0.2)'
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                FOREXFLOW
              </h1>
              <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Premium Suite
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <button
                onClick={() => setActivePage('dashboard')}
                style={getLinkStyle('dashboard')}
                id="sidebar-tab-dashboard"
                onMouseEnter={e => {
                  if (activePage !== 'dashboard') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (activePage !== 'dashboard') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('trades')}
                style={getLinkStyle('trades')}
                id="sidebar-tab-trades"
                onMouseEnter={e => {
                  if (activePage !== 'trades') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (activePage !== 'trades') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <List className="w-4 h-4" />
                <span>Report</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('capital')}
                style={getLinkStyle('capital')}
                id="sidebar-tab-capital"
                onMouseEnter={e => {
                  if (activePage !== 'capital') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (activePage !== 'capital') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>Trade Capital</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('reports')}
                style={getLinkStyle('reports')}
                id="sidebar-tab-reports"
                onMouseEnter={e => {
                  if (activePage !== 'reports') {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-row-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (activePage !== 'reports') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Trading Reports</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4" style={{ borderTop: '1.5px solid var(--border-color)' }}>
          <div 
            className="flex items-center gap-3 mb-4 px-4 py-2"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div 
              style={{
                background: 'var(--bg-secondary)',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-btn)',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-row-hover)';
              e.currentTarget.style.borderColor = 'var(--accent-color)';
              e.currentTarget.style.color = 'var(--accent-color)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 z-40"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1.5px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => setActivePage('dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: activePage === 'dashboard' ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Dashboard</span>
        </button>
        <button
          onClick={() => setActivePage('trades')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: activePage === 'trades' ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
        >
          <List className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Report</span>
        </button>
        <button
          onClick={() => setActivePage('capital')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: activePage === 'capital' ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
        >
          <Wallet className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Capital</span>
        </button>
        <button
          onClick={() => setActivePage('reports')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: activePage === 'reports' ? 'var(--accent-color)' : 'var(--text-secondary)',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
        >
          <BarChart3 className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Reports</span>
        </button>
        <button
          onClick={onLogout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: '#f43f5e',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
        >
          <LogOut className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Logout</span>
        </button>
      </div>
    </>
  );
}
