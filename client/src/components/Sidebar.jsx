import React from 'react';
import { TrendingUp, LayoutDashboard, List, LogOut, User } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const userEmail = localStorage.getItem('tj_email') || 'user@example.com';

  return (
    <>
      <aside className="hidden md:flex bg-zinc-900 border-r border-zinc-700/50 w-64 flex-col h-full">
        <div className="p-6 border-b border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Trading Journal</h1>
              <p className="text-zinc-500 text-xs">Professional Trading</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActivePage('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activePage === 'dashboard'
                    ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('trades')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activePage === 'trades'
                    ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <List className="w-5 h-5" />
                <span className="font-medium">Trade Log</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-zinc-700/50">
          <div className="flex items-center gap-3 mb-4 px-4 py-2">
            <div className="bg-zinc-800 p-2 rounded-full">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-400 text-sm truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 flex justify-around py-3 z-40">
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'dashboard' ? 'text-indigo-400' : 'text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => setActivePage('trades')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'trades' ? 'text-indigo-400' : 'text-zinc-400'
          }`}
        >
          <List className="w-6 h-6" />
          <span className="text-xs">Trades</span>
        </button>
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-rose-400"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </>
  );
}
