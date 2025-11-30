import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, User, Moon, Bell, History, 
  Fingerprint, Shield, Key, Info, FileText, Lock, LogOut, Trash2
} from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-2 px-4 mt-6">{title}</h3>
);

const SettingRow: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  rightElement?: React.ReactNode;
  danger?: boolean;
}> = ({ icon: Icon, label, onClick, rightElement, danger }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-4 bg-card border-b border-white/5 active:bg-white/5 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl last:border-0 ${danger ? 'text-red-400' : 'text-white'}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={danger ? 'text-red-400' : 'text-slate-400'} />
      <span className="text-[15px] font-medium">{label}</span>
    </div>
    {rightElement || <ChevronRight size={16} className="text-slate-600" />}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-700'}`}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [biometrics, setBiometrics] = React.useState(true);
  const [twoFactor, setTwoFactor] = React.useState(false);

  const handleLogout = () => {
    navigate('/welcome');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your wallet? This action is irreversible.')) {
        await FETCH_FROM_BACKEND('delete_wallet');
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-dark/95 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <div className="w-8" />
      </div>

      <div className="px-4">
        {/* Account Section */}
        <SectionHeader title="Account" />
        <div className="rounded-xl overflow-hidden border border-white/10">
          <SettingRow icon={User} label="Profile" onClick={() => navigate('/settings/profile')} />
          <SettingRow icon={Moon} label="Change Theme" onClick={() => navigate('/settings/theme')} />
          <SettingRow icon={Bell} label="Push Notifications" onClick={() => navigate('/settings/notifications')} />
          <SettingRow icon={History} label="View Transaction History" onClick={() => navigate('/history')} />
        </div>

        {/* Security Section */}
        <SectionHeader title="Security" />
        <div className="rounded-xl overflow-hidden border border-white/10">
          <SettingRow 
            icon={Fingerprint} 
            label="Biometric Login" 
            rightElement={<Toggle checked={biometrics} onChange={() => setBiometrics(!biometrics)} />}
          />
          <SettingRow 
            icon={Shield} 
            label="Enable 2FA" 
            rightElement={<Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />}
          />
          <SettingRow icon={Key} label="View Recovery Phrase" onClick={() => navigate('/settings/recovery')} />
        </div>

        {/* About Section */}
        <SectionHeader title="About" />
        <div className="rounded-xl overflow-hidden border border-white/10">
          <SettingRow 
            icon={Info} 
            label="App Version" 
            rightElement={<span className="text-slate-500 text-sm">v1.2.0</span>}
          />
          <SettingRow icon={FileText} label="Terms & Conditions" onClick={() => {}} />
          <SettingRow icon={Lock} label="Privacy Policy" onClick={() => {}} />
        </div>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <div className="mt-2 space-y-3">
          <button 
            onClick={handleLogout}
            className="w-full bg-card border border-white/10 text-red-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
          
          <div 
             onClick={handleDelete}
             className="flex items-center justify-between px-4 py-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          >
             <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                 <Trash2 size={16} /> Delete Wallet
             </div>
             <ChevronRight size={14} className="text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};