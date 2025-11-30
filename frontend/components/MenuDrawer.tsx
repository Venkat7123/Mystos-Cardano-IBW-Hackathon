import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Settings, History, Moon, Sun, Bell, CircleHelp, LogOut, ChevronRight } from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
      onClose();
      navigate(path);
  };

  // Explicit order as requested: Profile, Settings, History, Theme, Notifications, Support, Logout
  const menuItems = [
    { label: 'Profile', icon: User, action: () => handleNav('/settings/profile') },
    { label: 'Settings', icon: Settings, action: () => handleNav('/settings') },
    { label: 'Transaction History', icon: History, action: () => handleNav('/history') },
    { label: 'Change Theme', icon: isDarkMode ? Moon : Sun, action: toggleTheme },
    { label: 'Push Notifications', icon: Bell, action: () => handleNav('/settings/notifications') },
    { label: 'Help & Support', icon: CircleHelp, action: () => handleNav('/action/support') },
    { label: 'Logout', icon: LogOut, action: () => handleNav('/welcome') },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-[75%] max-w-sm bg-card border-r border-white/10 z-[110] shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/10 shrink-0">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-white" />
            </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {menuItems.map((item, index) => (
                <button 
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group min-h-[48px]"
                >
                    <div className="flex items-center gap-4">
                        <item.icon size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-white group-hover:text-primary transition-colors text-base">
                            {item.label}
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                </button>
            ))}
        </div>
      </div>
    </>
  );
};