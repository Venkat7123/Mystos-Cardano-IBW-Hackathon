import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-900/40 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 bg-black border border-primary/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,163,0.3)] mb-8">
           <Shield size={48} className="text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">Mystos</h1>
        <div className="h-1 w-12 bg-primary rounded-full mb-3" />
        <p className="text-primary text-xs font-mono tracking-[0.3em] uppercase">Secure. Private. AI.</p>
      </div>
    </div>
  );
};