import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Save, CheckCircle2 } from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

export const NotificationSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await FETCH_FROM_BACKEND('set_push_notifications', { enabled });
    setLoading(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen px-6 pt-12 bg-dark">
      <div className="flex items-center mb-8 relative z-10">
        <button 
            onClick={() => navigate(-1)} 
            className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Push Notifications</h2>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-xl mb-6">
         <div className="flex items-center justify-between mb-4">
             <span className="font-bold text-white text-lg">Enable Push Notifications</span>
             <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-primary' : 'bg-slate-700'}`}
             >
                 <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
         </div>
         
         <p className="text-slate-400 text-sm leading-relaxed mb-6">
             Notifications alert you about new proposals, votes, and important wallet activity.
         </p>

         <div className="flex items-center gap-2 py-3 px-4 bg-white/5 rounded-xl border border-white/5">
             <CheckCircle2 size={16} className={enabled ? "text-green-400" : "text-slate-500"} />
             <span className="text-sm font-medium text-slate-300">
                 Permission: <span className={enabled ? "text-green-400" : "text-slate-500"}>{enabled ? "Granted" : "Denied"}</span>
             </span>
         </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
      >
        <Save size={20} /> {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};