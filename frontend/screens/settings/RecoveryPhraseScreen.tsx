import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, AlertTriangle, Fingerprint } from 'lucide-react';

export const RecoveryPhraseScreen: React.FC = () => {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  
  // Mock Phrase
  const phrase = ["witch", "collapse", "practice", "feed", "shame", "open", "despair", "creek", "road", "again", "ice", "least"];

  const handleBiometricCheck = () => {
      // Stub
      setTimeout(() => setVerified(true), 1000);
  };

  return (
    <div className="min-h-screen bg-dark pt-12 px-6 flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 rounded-full hover:bg-white/10">
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-xl font-bold text-white">Recovery Phrase</h2>
      </div>

      {!verified ? (
          <div className="flex-1 flex flex-col items-center justify-center pb-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Fingerprint size={40} className="text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Authentication Required</h3>
              <p className="text-slate-400 text-center text-sm max-w-xs mb-8">
                  Please verify your identity to view your secret recovery phrase.
              </p>
              <button 
                onClick={handleBiometricCheck}
                className="w-full bg-primary text-black font-bold py-4 rounded-xl uppercase tracking-wide"
              >
                  Verify Identity
              </button>
          </div>
      ) : (
          <div className="animate-in fade-in zoom-in duration-300">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 mb-6">
                 <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
                 <div>
                     <h4 className="text-red-400 text-sm font-bold mb-1">Security Warning</h4>
                     <p className="text-xs text-slate-300 leading-relaxed">
                         NEVER share this phrase. Anyone with these 12 words can steal your funds instantly.
                     </p>
                 </div>
             </div>

             <div className="grid grid-cols-3 gap-3 mb-8">
                {phrase.map((word, i) => (
                    <div key={i} className="bg-card border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-lg relative overflow-hidden group">
                        <span className="text-[10px] text-slate-600 absolute top-1 left-2 font-mono">0{i + 1}</span>
                        <span className="font-bold text-white text-sm mt-2">{word}</span>
                    </div>
                ))}
            </div>

            <p className="text-center text-slate-500 text-xs">
                Write these down on paper and store in a secure location.
            </p>
          </div>
      )}
    </div>
  );
};