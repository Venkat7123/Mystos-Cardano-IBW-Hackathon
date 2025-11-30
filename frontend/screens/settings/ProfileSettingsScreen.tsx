import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Copy, User } from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

export const ProfileSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    did: 'Loading...'
  });

  useEffect(() => {
    FETCH_FROM_BACKEND('get_settings').then(data => {
      if (data && typeof data === 'object') {
        setFormData({ 
          username: data.username || '', 
          email: data.email || '', 
          did: data.did || 'did:mystos:user123' 
        });
      }
    });

  }, []);

  const handleSave = async () => {
    setLoading(true);
    await FETCH_FROM_BACKEND('update_profile', formData);
    setLoading(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-dark pt-12 px-6">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 rounded-full hover:bg-white/10">
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Edit Profile</h2>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-card rounded-full border-2 border-primary flex items-center justify-center mb-4 relative">
          <User size={40} className="text-slate-400" />
          <button className="absolute bottom-0 right-0 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full border border-dark">
            EDIT
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-primary font-bold uppercase mb-2">Username</label>
          <input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs text-primary font-bold uppercase mb-2">Email (Optional)</label>
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Decentralized ID (DID)</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="text-slate-400 font-mono text-xs truncate flex-1">{formData.did}</span>
            <Copy size={16} className="text-primary cursor-pointer" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-black font-bold py-4 rounded-xl mt-4 shadow-[0_0_20px_rgba(0,255,163,0.3)] flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};