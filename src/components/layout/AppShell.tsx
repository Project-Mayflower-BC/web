import React from 'react';

export type ViewTab = 'hub' | 'board' | 'review';

interface AppShellProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, onSelectTab, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Persistent Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">PROJECT MAYFLOWER</span>
            <span className="text-xs text-slate-400 ml-2">Catan Strategy & Review Engine</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectTab('hub')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'hub' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Hub
          </button>
          <button
            onClick={() => onSelectTab('board')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'board' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Board Viewer (UI-03)
          </button>
          <button
            onClick={() => onSelectTab('review')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'review' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Game Review (UI-04/05)
          </button>
        </nav>
      </header>

      {/* Dynamic Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {children}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-900 px-6 py-3 text-center text-xs text-slate-500">
        Project Mayflower • CS Capstone Walking Skeleton Demo
      </footer>
    </div>
  );
}