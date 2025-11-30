import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, CheckCircle, ArrowRight } from 'lucide-react';

// --- WELCOME SCREEN ---
export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full px-6 py-12 justify-end min-h-screen bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-black to-black z-0 pointer-events-none" />
      
      <div className="relative z-10 space-y-4 mb-8">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Your Gateway to <br/> <span className="text-primary drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]">Next-Gen DeFi</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Manage your assets with AI-powered insights and military-grade encryption.
        </p>
      </div>

      <div className="relative z-10 space-y-3">
        <button 
          onClick={() => navigate('/create-wallet')}
          className="w-full bg-primary text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:scale-[1.02] transition-transform uppercase tracking-wider"
        >
          Create New Wallet
        </button>
        <button 
          onClick={() => navigate('/import-wallet')}
          className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl hover:bg-white/10 transition-colors"
        >
          Import Existing Wallet
        </button>
      </div>
    </div>
  );
};

// --- CREATE WALLET SCREEN ---
const MOCK_MNEMONIC = ["witch", "collapse", "practice", "feed", "shame", "open", "despair", "creek", "road", "again", "ice", "least"];

export const CreateWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'display' | 'verify'>('display');

  const handleVerify = () => {
    // Mock verification
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen px-6 pt-12 pb-6 flex flex-col bg-dark">
      <div className="flex items-center mb-8 relative z-10">
        <button 
            onClick={() => navigate('/welcome')} 
            className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Secure Your Wallet</h2>
      </div>

      {step === 'display' ? (
        <>
          <p className="text-slate-400 mb-6">Write down these 12 words in order. Keep them safe.</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {MOCK_MNEMONIC.map((word, i) => (
              <div key={i} className="bg-card border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-lg">
                <span className="text-[10px] text-primary mb-1 font-mono">0{i + 1}</span>
                <span className="font-bold text-white">{word}</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setStep('verify')}
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl mt-6 uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,163,0.2)]"
          >
            I've Backed It Up
          </button>
        </>
      ) : (
        <>
           <p className="text-slate-400 mb-6">Verify your phrase by entering the requested words.</p>
           <div className="space-y-4 mb-auto">
             <div>
                <label className="block text-sm text-primary font-bold mb-2 uppercase">Word #3</label>
                <input type="text" className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none focus:shadow-[0_0_10px_rgba(0,255,163,0.2)]" placeholder="e.g. practice" />
             </div>
             <div>
                <label className="block text-sm text-primary font-bold mb-2 uppercase">Word #7</label>
                <input type="text" className="w-full bg-card border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none focus:shadow-[0_0_10px_rgba(0,255,163,0.2)]" placeholder="e.g. despair" />
             </div>
           </div>
           <button 
            onClick={handleVerify}
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl mt-6 uppercase tracking-wider"
          >
            Verify & Create
          </button>
        </>
      )}
    </div>
  );
};

// --- IMPORT WALLET SCREEN ---
export const ImportWalletScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 pt-12 pb-6 flex flex-col bg-dark">
       <div className="flex items-center mb-6 relative z-10">
        <button 
            onClick={() => navigate('/welcome')} 
            className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Import Wallet</h2>
      </div>
      
      <p className="text-slate-400 mb-6">Enter your 12-word recovery phrase.</p>
      
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <input 
            key={i} 
            type="text" 
            placeholder={`${i + 1}`}
            className="bg-card border border-white/10 rounded-xl p-3 text-center text-white focus:border-primary outline-none font-bold text-sm focus:shadow-[0_0_10px_rgba(0,255,163,0.1)] transition-all"
          />
        ))}
      </div>

      <button 
        onClick={() => navigate('/dashboard')}
        className="w-full bg-primary text-black font-bold py-4 rounded-2xl mt-auto uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,163,0.3)]"
      >
        Import Wallet
      </button>
    </div>
  );
};