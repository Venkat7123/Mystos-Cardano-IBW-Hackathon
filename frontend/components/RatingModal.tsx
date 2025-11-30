import React, { useState } from 'react';
import { Star, X, Shield } from 'lucide-react';
import { submitRatingWithMidnight } from '../services/midnight';

// Mock signer for demo mode - simulates wallet signing
const createMockSigner = () => ({
  signMessage: async (message: string): Promise<string> => {
    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a mock signature (in production, this would be a real cryptographic signature)
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
});

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proofInfo?: any;   // NEW: we show vote proof inside rating modal if needed
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, proofInfo }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setStatus('Generating ZK proof...');
    
    try {
      // Use mock signer for demo mode
      const mockSigner = createMockSigner();
      
      setStatus('Signing attestation...');
      
      const result = await submitRatingWithMidnight({
        signer: mockSigner,
        chain: 'eth',
        raterPubkey: 'anonymous-user',
        counterpartyId: proofInfo?.attestation?.counterparty_id || 'demo-rating',
        asset: 'VOTE',
        rating,
        comment
      });

      console.log('Midnight rating result:', result);
      setStatus('ZK proof verified!');
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setComment('');
        setStatus('');
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Rating submission failed:', e);
      setStatus('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10">
        
        {!submitted ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Rate Experience</h3>
              <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
            </div>

            {proofInfo && (
              <div className="mb-4 text-xs text-slate-400">
                <p>Vote Proof ID:</p>
                <code>{proofInfo.proofId}</code>
                <p className="mt-1">Proof Hash:</p>
                <code>{proofInfo.proofHash}</code>
              </div>
            )}
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-95"
                >
                  <Star 
                    size={32} 
                    className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} 
                  />
                </button>
              ))}
            </div>

            <textarea 
              placeholder="Tell us what you think..." 
              className="w-full bg-dark/50 rounded-xl p-3 text-sm text-white mb-4 border border-white/5 focus:outline-none focus:border-primary"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {status && (
              <div className="flex items-center gap-2 mb-4 text-xs text-primary">
                <Shield size={14} className="animate-pulse" />
                <span>{status}</span>
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="w-full bg-primary text-black font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Shield size={16} className="animate-spin" />
                  <span>Processing ZK Proof...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Submit with Midnight ZK</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-green-500 fill-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
            <p className="text-slate-400">Your feedback helps Mystos improve.</p>
          </div>
        )}
      </div>
    </div>
  );
};
