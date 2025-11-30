import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Smartphone, Check } from 'lucide-react';
import { useTheme } from '../../components/ThemeContext';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

export const ThemeSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState<'light' | 'dark' | 'system'>(theme);

  const handleSelect = async (val: 'light' | 'dark' | 'system') => {
    setSelected(val);
    if (val !== 'system') {
        setTheme(val);
    }
    await FETCH_FROM_BACKEND('set_theme', { theme: val });
  };

  const Option: React.FC<{ id: 'light' | 'dark' | 'system'; icon: React.ElementType; label: string }> = ({ id, icon: Icon, label }) => (
    <div 
      onClick={() => handleSelect(id)}
      className={`flex items-center justify-between p-4 bg-card border-b border-white/5 last:border-0 cursor-pointer transition-colors ${selected === id ? 'bg-primary/5' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={selected === id ? 'text-primary' : 'text-slate-400'} />
        <span className={`text-[15px] font-medium ${selected === id ? 'text-primary' : 'text-white'}`}>{label}</span>
      </div>
      {selected === id && (
        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check size={12} className="text-black" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pt-12 px-6">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 rounded-full hover:bg-white/10">
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Appearance</h2>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10">
        <Option id="light" icon={Sun} label="Light Mode" />
        <Option id="dark" icon={Moon} label="Dark Mode" />
        <Option id="system" icon={Smartphone} label="System Default" />
      </div>
    </div>
  );
};