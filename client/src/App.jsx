import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradeLog from './components/TradeLog';
import TradingReports from './components/report/TradingReports';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('tj_theme') || 'dark');

  useEffect(() => {
    const token = localStorage.getItem('tj_token');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('tj_theme', theme);
  }, [theme]);

  const handleAuthSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('tj_token');
    localStorage.removeItem('tj_email');
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!isAuthenticated) {
    return (
      <div className={theme === 'light' ? 'light' : ''} style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div 
      className={theme === 'light' ? 'light' : ''} 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        background: 'var(--bg-primary)', 
        overflow: 'hidden' 
      }}
    >
      {/* Premium Left Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout} 
      />

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onLogout={handleLogout} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'trades' && <TradeLog />}
          {activePage === 'reports' && <TradingReports />}
        </main>
      </div>
    </div>
  );
}
