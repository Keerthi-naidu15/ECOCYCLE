
import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, Home, History, Settings, Leaf } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sage p-2 rounded-xl text-darkTeal shadow-sm">
              <Leaf size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-darkTeal">
              EcoCycle
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-darkTeal/5 px-4 py-2 rounded-full border border-darkTeal/10">
              <div className="w-1.5 h-1.5 bg-sage rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-darkTeal uppercase tracking-widest">{user.role} Active</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden glass-effect fixed bottom-0 left-0 right-0 border-t border-slate-100 h-20 flex items-center justify-around px-8 z-[60]">
        <button className="flex flex-col items-center gap-1.5 text-sage">
          <Home size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Dash</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-300">
          <History size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Logs</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-slate-300">
          <Settings size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Prefs</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
