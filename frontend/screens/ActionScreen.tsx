import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowDown, Copy, Share2, Info, ChevronDown, ChevronUp, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { RatingModal } from '../components/RatingModal';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

// --- SHARED COMPONENTS ---

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-card p-4 rounded-xl border border-white/10 shadow-sm mb-4">
    <label className="block text-xs text-primary uppercase font-bold tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

const ActionHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center mb-6 relative z-10">
    <button
      onClick={onBack}
      className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
    >
      <ChevronLeft className="text-white" size={24} />
    </button>
    <h2 className="ml-2 text-xl font-bold text-white capitalize">{title}</h2>
  </div>
);

// --- 1) SEND SCREEN ---



const SendView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [token, setToken] = useState('ETH');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAddressValid = address.length === 0;
  const isAddressInvalid = address.length > 0;
  const canSubmit = address.length > 0 &&  parseFloat(amount) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const result = await FETCH_FROM_BACKEND('tx_send', { to_address: address, token, amount: parseFloat(amount), note });
      if (result?.error) {
        setError(result.message || 'Transaction failed');
        setLoading(false);
        return;
      }
      setLoading(false);
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Transaction failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <InputGroup label="Select Token">
        <select
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full bg-transparent text-white outline-none font-medium text-lg appearance-none"
        >
          <option value="ETH" className="bg-card">Ethereum (ETH)</option>
          <option value="BTC" className="bg-card">Bitcoin (BTC)</option>
          <option value="SOL" className="bg-card">Solana (SOL)</option>
          <option value="USDT" className="bg-card">Tether (USDT)</option>
        </select>
      </InputGroup>

      <InputGroup label="Recipient Address">
        <input
          type="text"
          placeholder="0x... or wallet address"
          value={address}
          onChange={(e) => { setAddress(e.target.value); setError(null); }}
          className={`w-full bg-transparent text-sm text-white outline-none font-mono placeholder:text-slate-600 }`}
        />
      </InputGroup>

      <InputGroup label="Amount">
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
        />
      </InputGroup>

      <div className="flex justify-between items-center px-2 text-xs text-slate-400">
        <span>Network Fee (Auto)</span>
        <span className="font-mono text-white">0.002 ETH</span>
      </div>

      <InputGroup label="Note (Optional)">
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's this for?"
          className="w-full bg-transparent text-sm text-white outline-none resize-none placeholder:text-slate-600"
        />
      </InputGroup>

      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all uppercase tracking-wide mt-4 disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Send Now'}
      </button>
    </div>
  );
};

// --- 2) RECEIVE SCREEN ---

const ReceiveView: React.FC = () => {
  const [address, setAddress] = useState('Loading...');

  useEffect(() => {
    FETCH_FROM_BACKEND('get_receive_address').then((data) => {
      // Handle both string and object responses
      if (typeof data === 'string') {
        setAddress(data);
      } else if (data && typeof data === 'object' && 'address' in data) {
        setAddress((data as { address: string }).address);
      } else {
        setAddress('0x1234...5678'); // fallback
      }
    });

  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    // Could add toast here
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className="bg-white p-4 rounded-3xl shadow-lg">
        {/* Placeholder QR Code */}
        <div className="w-48 h-48 bg-white flex flex-wrap content-center justify-center relative">
          <div className="absolute inset-0 border-4 border-black rounded-xl"></div>
          <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-1 rounded-full"><div className="w-8 h-8 bg-primary rounded-full" /></div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-center text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Your Ethereum Address</label>
        <div className="bg-card border border-white/10 rounded-xl p-4 flex items-center justify-between gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleCopy}>
          <p className="font-mono text-sm text-white truncate">{address}</p>
          <Copy size={16} className="text-primary flex-shrink-0" />
        </div>
      </div>

      <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-white font-semibold hover:bg-white/10 transition-colors">
        <Share2 size={18} /> Share Address
      </button>
    </div>
  );
};

// --- 3) SWAP SCREEN ---

const SwapView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<{ toAmount: number; rate: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, { balance: number; price: number }>>({});

  // Fetch balances on mount
  useEffect(() => {
    FETCH_FROM_BACKEND('coin_list').then((coins: any[]) => {
      const balanceMap: Record<string, { balance: number; price: number }> = {};
      coins.forEach((c: any) => {
        balanceMap[c.symbol] = { balance: c.balance, price: c.price };
      });
      setBalances(balanceMap);
    }).catch(console.error);
  }, []);

  // Mock rates for conversion
  const RATES: Record<string, number> = {
    'ETH-USDT': 2650, 'BTC-USDT': 64200, 'SOL-USDT': 145,
    'USDT-ETH': 1/2650, 'USDT-BTC': 1/64200, 'USDT-SOL': 1/145,
    'ETH-BTC': 2650/64200, 'BTC-ETH': 64200/2650,
    'ETH-SOL': 2650/145, 'SOL-ETH': 145/2650,
    'BTC-SOL': 64200/145, 'SOL-BTC': 145/64200,
  };

  // Calculate quote locally when inputs change
  useEffect(() => {
    const numAmount = parseFloat(amount);
    
    // Don't calculate if amount is invalid or tokens are the same
    if (!amount || isNaN(numAmount) || numAmount <= 0 || fromToken === toToken) {
      setQuote(null);
      return;
    }

    setQuoteLoading(true);
    
    // Simulate API delay for quote
    const timer = setTimeout(() => {
      const rate = RATES[`${fromToken}-${toToken}`] || 1;
      const toAmount = numAmount * rate;
      setQuote({ toAmount, rate });
      setQuoteLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken]);

  // Prevent same token selection
  const handleFromTokenChange = (newToken: string) => {
    if (newToken === toToken) {
      // Swap the tokens
      setToToken(fromToken);
    }
    setFromToken(newToken);
  };

  const handleToTokenChange = (newToken: string) => {
    if (newToken === fromToken) {
      // Swap the tokens
      setFromToken(toToken);
    }
    setToToken(newToken);
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const canSwap = quote && parseFloat(amount) > 0 && fromToken !== toToken && !quoteLoading;

  const handleSwap = async () => {
    if (!canSwap) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Execute swap - this would call backend to update balances
      const result = await FETCH_FROM_BACKEND('swap_execute', { 
        fromToken, 
        toToken, 
        fromAmount: parseFloat(amount),
        toAmount: quote?.toAmount
      });
      
      if (result?.error) {
        setError(result.message || 'Swap failed');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Swap failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <InputGroup label="From">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(null); }}
            className="flex-1 bg-transparent w-4 text-2xl font-bold text-white outline-none placeholder:text-slate-700"
          />
          <select
            value={fromToken}
            onChange={(e) => handleFromTokenChange(e.target.value)}
            className="bg-gradient-to-r from-primary/20 to-primary/10 w-[100px] text-black rounded-xl px-4 py-2 outline-none font-bold border border-primary/30 hover:border-primary/50 transition-all cursor-pointer appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat shadow-[0_0_10px_rgba(0,255,163,0.1)]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300FFA3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}
          >
            <option value="ETH" className="bg-dark text-white">ETH</option>
            <option value="BTC" className="bg-dark text-white">BTC</option>
            <option value="SOL" className="bg-dark text-white">SOL</option>
            <option value="USDT" className="bg-dark text-white">USDT</option>
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Balance: {balances[fromToken]?.balance?.toFixed(6) ?? '...'} {fromToken}
          <span className="text-slate-600 ml-1">≈ ${((balances[fromToken]?.balance ?? 0) * (balances[fromToken]?.price ?? 0)).toFixed(2)}</span>
        </p>
      </InputGroup>

      <div className="flex justify-center -my-3 relative z-10">
        <button 
          onClick={handleSwapTokens}
          className="bg-dark p-2 rounded-full border border-white/10 shadow-lg hover:border-primary/50 hover:bg-primary/10 transition-all"
        >
          <ArrowDown className="text-primary" size={20} />
        </button>
      </div>

      <InputGroup label="To (Estimate)">
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={quoteLoading ? '...' : (quote?.toAmount !== undefined ? quote.toAmount.toFixed(4) : '')}
            className="flex-1 w-4 bg-transparent text-2xl font-bold text-primary outline-none placeholder:text-slate-800"
          />
          <select
            value={toToken}
            onChange={(e) => handleToTokenChange(e.target.value)}
            className="bg-gradient-to-r from-primary/20 to-primary/10 w-[100px] text-black rounded-xl px-4 py-2 outline-none font-bold border border-primary/30 hover:border-primary/50 transition-all cursor-pointer appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat shadow-[0_0_10px_rgba(0,255,163,0.1)]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300FFA3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}
          >
            <option value="USDT" className="bg-dark text-white">USDT</option>
            <option value="ETH" className="bg-dark text-white">ETH</option>
            <option value="SOL" className="bg-dark text-white">SOL</option>
            <option value="BTC" className="bg-dark text-white">BTC</option>
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Balance: {balances[toToken]?.balance?.toFixed(6) ?? '...'} {toToken}
          <span className="text-slate-600 ml-1">≈ ${((balances[toToken]?.balance ?? 0) * (balances[toToken]?.price ?? 0)).toFixed(2)}</span>
        </p>
        {quote?.rate !== undefined && (
          <p className="text-xs text-slate-500 mt-1">
            Rate: 1 {fromToken} ≈ {quote.rate < 0.0001 ? quote.rate.toExponential(4) : quote.rate.toFixed(6)} {toToken}
          </p>
        )}
        {fromToken === toToken && amount && (
          <p className="text-xs text-yellow-400 mt-2">Select different tokens to swap</p>
        )}
      </InputGroup>

      <button
        onClick={handleSwap}
        disabled={loading || !canSwap}
        className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all uppercase tracking-wide mt-4 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : quoteLoading ? 'Getting Quote...' : 'Swap Now'}
      </button>
    </div>
  );
};

// --- 4) WITHDRAW SCREEN ---

const WithdrawView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleWithdraw = async () => {
    setLoading(true);
    await FETCH_FROM_BACKEND('withdraw', { amount, address });
    setLoading(false);
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-blue-400 text-sm font-bold mb-1">Important Info</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Withdrawals to external wallets usually take 10-30 minutes depending on network congestion. Ensure the network matches the destination address.
          </p>
        </div>
      </div>

      <InputGroup label="Select Asset">
        <select className="w-full bg-transparent text-white outline-none font-medium text-lg appearance-none">
          <option className="bg-card">Ethereum (ETH)</option>
          <option className="bg-card">Bitcoin (BTC)</option>
        </select>
      </InputGroup>

      <InputGroup label="Destination Address">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          type="text"
          placeholder="Enter wallet address"
          className="w-full bg-transparent text-sm text-white outline-none font-mono placeholder:text-slate-600"
        />
      </InputGroup>

      <InputGroup label="Amount">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          placeholder="0.00"
          className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
        />
      </InputGroup>

      <div className="flex justify-between items-center px-2 text-xs text-slate-400">
        <span>Transaction Fee</span>
        <span className="font-mono text-white">0.005 ETH</span>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={loading || !amount || !address}
        className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all uppercase tracking-wide mt-4 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Withdraw Funds'}
      </button>
    </div>
  );
};

// --- 5) SUPPORT SCREEN ---

const SupportView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const faqs = [
    { q: "How do I reset my wallet?", a: "You can reset your wallet by re-entering your 12-word seed phrase in the Import Wallet screen." },
    { q: "Is Mystos non-custodial?", a: "Yes. You own your keys. Mystos never has access to your private key or seed phrase." },
    { q: "What networks are supported?", a: "Currently we support Ethereum, Solana, and Bitcoin mainnets." },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await FETCH_FROM_BACKEND('support_ticket', {});
    setLoading(false);
    onComplete();
  };

  return (
    <div className="space-y-8 pb-8">
      {/* FAQ Section */}
      <section>
        <h3 className="text-white font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <div key={idx} className="bg-card border border-white/10 rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-white/5"
              >
                <span className="text-sm font-medium text-slate-200">{item.q}</span>
                {activeFaq === idx ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-slate-500" />}
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-0 text-xs text-slate-400 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section>
        <h3 className="text-white font-bold mb-4">Contact Support</h3>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-primary"
          />
          <textarea
            rows={4}
            placeholder="Describe your issue..."
            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white text-sm outline-none resize-none focus:border-primary"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Submit Ticket'}
          </button>
        </div>
      </section>

      {/* Live Chat */}
      <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-full text-black">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Live Chat</p>
            <p className="text-xs text-primary">Available 24/7</p>
          </div>
        </div>
        <button className="text-xs font-bold bg-primary text-black px-4 py-2 rounded-lg hover:bg-green-400 transition-colors">
          Start Chat
        </button>
      </div>
    </div>
  );
};

// --- MAIN WRAPPER ---

export const ActionScreen: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [showRating, setShowRating] = useState(false);

  // Validate type
  const safeType = type || 'send';

  const handleBack = () => navigate('/dashboard');

  const handleActionComplete = () => {
    // Trigger rating modal
    setShowRating(true);
  };

  const handleRatingClose = () => {
    setShowRating(false);
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (safeType) {
      case 'send': return <SendView onComplete={handleActionComplete} />;
      case 'receive': return <ReceiveView />;
      case 'swap': return <SwapView onComplete={handleActionComplete} />;
      case 'withdraw': return <WithdrawView onComplete={handleActionComplete} />;
      case 'support': return <SupportView onComplete={handleActionComplete} />;
      default: return <div className="text-white">Unknown action</div>;
    }
  };

  return (
    <div className="min-h-screen px-6 pt-12 bg-dark text-white pb-20">
      <RatingModal isOpen={showRating} onClose={handleRatingClose} />

      <ActionHeader title={safeType} onBack={handleBack} />

      <div className="animate-in slide-in-from-right duration-300">
        {renderContent()}
      </div>
    </div>
  );
};