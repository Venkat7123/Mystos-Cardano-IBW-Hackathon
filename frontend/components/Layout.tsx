import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowDownLeft, RefreshCw, LogOut, CircleHelp, Menu } from 'lucide-react';
import { ReputationBadge } from './ReputationBadge';
import { MenuDrawer } from './MenuDrawer';
import { useTheme } from './ThemeContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const actions = [
    { icon: Send, label: 'Send', path: '/action/send' },
    { icon: ArrowDownLeft, label: 'Receive', path: '/action/receive' },
    { icon: RefreshCw, label: 'Swap', path: '/action/swap' },
    { icon: LogOut, label: 'Withdraw', path: '/action/withdraw' },
    { icon: CircleHelp, label: 'Support', path: '/action/support' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-xl border-t border-white/5 pb-6 pt-3 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {actions.map((act) => {
            const isActive = location.pathname === act.path;
            return (
              <button 
                key={act.label}
                onClick={() => navigate(act.path)}
                className="flex flex-col items-center gap-1 group w-14"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,163,0.4)]' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                  <act.icon size={20} className={isActive ? "text-black" : "text-slate-400 group-hover:text-white"} />
                </div>
                <span className={`text-[9px] font-medium tracking-wide ${isActive ? 'text-primary' : 'text-slate-500'}`}>{act.label}</span>
              </button>
            )
        })}
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthScreen = ['/', '/welcome', '/create-wallet', '/import-wallet'].includes(location.pathname);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const showHeader = location.pathname === '/dashboard';
  const showBottomNav = !isAuthScreen;

  return (
    <div className="min-h-screen bg-dark text-white flex justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-dark relative flex flex-col min-h-screen shadow-2xl overflow-hidden transition-colors duration-300">
        
        <MenuDrawer 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            isDarkMode={theme === 'dark'}
            toggleTheme={toggleTheme}
        />

        {showHeader && (
          <header className="px-6 py-5 flex justify-between items-center bg-transparent z-40 sticky top-0 backdrop-blur-sm">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <Menu size={24} className="text-white" />
            </button>
            <ReputationBadge />
          </header>
        )}

        <main className={`flex-1 overflow-y-auto relative ${showBottomNav ? 'pb-28' : ''}`}>
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};