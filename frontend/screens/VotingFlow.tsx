import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import apiClient, { FETCH_FROM_BACKEND } from '@services/apiClient';
import { RatingModal } from '../components/RatingModal';

const { api } = apiClient;

export const VotingFlowScreen: React.FC = () => {
  const [stage, setStage] = useState<'generating' | 'ready' | 'success'>('generating');
  const [showRating, setShowRating] = useState(false);
  const [proofInfo, setProofInfo] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (stage === 'generating') {
      setTimeout(() => setStage('ready'), 2500);
    }
  }, [stage]);

  const handleSubmitVote = async () => {
    // 1. Generate attestation for voting (simple)
    const attestation = {
      tx_id: `vote-${Date.now()}`,
      rater_pubkey: 'anonymous-voter',
      counterparty_id: 'prop-101',
      nonce: crypto.randomUUID()
    };

    // 2. Ask backend to generate a ZK proof (mock)
    const proof = await api.raw('/midnight/prove', 'POST', { attestation });
    setProofInfo({ ...proof, attestation });

    // 3. Submit vote normally
    await FETCH_FROM_BACKEND('submit_vote', 'prop-101');

    // 4. Move screen to success state
    setStage('success');
  };

  if (stage === 'generating') {
    return (
      <div className="h-screen bg-dark flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-dark to-dark pointer-events-none" />
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 size={80} className="text-primary animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-widest uppercase">Generating ZK-Proof</h2>
        <p className="text-primary/70 text-xs font-mono">ENCRYPTING VOTE SIGNAL...</p>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
        <RatingModal 
          isOpen={showRating} 
          onClose={() => navigate('/dashboard')} 
          proofInfo={proofInfo}
        />
        
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,255,163,0.2)]">
          <CheckCircle2 size={48} className="text-primary" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Vote Submitted!</h2>
        <p className="text-slate-400 text-sm mb-6">Your voice has been heard securely.</p>

        <div className="bg-card px-4 py-3 rounded-xl border border-primary/20 mb-8 flex items-center gap-2 shadow-lg">
          <span className="text-xs text-slate-500 font-bold">TX HASH:</span>
          <span className="text-xs font-mono text-primary">0x7f...3a91</span>
        </div>

        <button 
          onClick={() => setShowRating(true)}
          className="bg-white/5 border border-white/10 text-white font-medium px-8 py-3 rounded-full hover:bg-white/10 transition-colors uppercase text-sm tracking-wider"
        >
          Rate Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark flex flex-col p-6 pt-24">
      <div className="flex-1">
        <div className="bg-card p-6 rounded-3xl border border-primary/30 shadow-[0_0_30px_rgba(0,255,163,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <Shield size={48} className="text-primary mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]" />
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Proof Generated</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            <span className="text-primary font-mono text-xs">[DEMO MODE]</span> <br/>
            ZK-SNARK proof is ready to verify your eligibility without revealing your wallet balance.
          </p>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-primary w-full shadow-[0_0_10px_#00FFA3]" />
          </div>
          <span className="text-[10px] text-primary font-mono tracking-[0.2em] uppercase">Verified Integrity</span>
        </div>
      </div>
      
      <button 
        onClick={handleSubmitVote}
        className="w-full bg-primary text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,255,163,0.4)] hover:shadow-[0_0_30px_rgba(0,255,163,0.6)] transition-all mb-12 uppercase tracking-wider"
      >
        Submit Vote On-Chain
      </button>
    </div>
  );
};
