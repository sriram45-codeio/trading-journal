import React from 'react';
import { TrendingUp, LayoutDashboard, List, LogOut, User, BarChart3, Wallet } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const userEmail = localStorage.getItem('tj_email') || 'admin@democompany.com';

  const getLinkStyle = (page) => {
    const isActive = activePage === page;
    return {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      fontSize: '13px',
      fontWeight: isActive ? '700' : '500',
      textAlign: 'left',
      fontFamily: 'inherit',
      background: isActive ? 'var(--accent-light)' : 'transparent',
      color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
    };
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex w-64 flex-col h-full"
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        <div 
          className="p-5" 
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              style={{
                background: 'var(--accent-color)',
                padding: '7px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                FOREXFLOW
              </h1>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Console Console v2
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <button
                onClick={() => setActivePage('dashboard')}
                style={getLinkStyle('dashboard')}
                id="sidebar-tab-dashboard"
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
              >
                <List className="w-4 h-4" />
                <span>Trade Log & Report</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('capital')}
                style={getLinkStyle('capital')}
                id="sidebar-tab-capital"
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
              >
                <BarChart3 className="w-4 h-4" />
                <span>Trading Reports</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div 
            className="flex items-center gap-3 mb-3 px-3 py-2"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          >
            <div 
              style={{
                background: 'var(--bg-secondary)',
                padding: '5px',
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
              <p style={{ margin: 0, fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.color = '#ef4444';
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
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2.5 z-40"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => setActivePage('dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: activePage === 'dashboard' ? 'var(--accent-color)' : 'var(--text-secondary)',
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
            color: '#ef4444',
          }}
        >
          <LogOut className="w-5 h-5" />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>Logout</span>
        </button>
      </div>
    </>
  );
}
