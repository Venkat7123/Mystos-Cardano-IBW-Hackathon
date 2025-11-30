import React, { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, TrendingUp, Bot, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FETCH_FROM_BACKEND } from '@services/apiClient';

import { Coin } from '../../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState<number | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [balanceData, coinsData] = await Promise.all([
        FETCH_FROM_BACKEND('balance'),
        FETCH_FROM_BACKEND('coin_list')
      ]);
      setBalance(balanceData as number);
      setCoins(coinsData as Coin[]);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch data on mount and when navigating back to dashboard
  useEffect(() => {
    fetchData();
  }, [fetchData, location.key]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Mini mock data for sparklines
  const sparkData = [
    { data: [30, 40, 35, 50, 45, 60, 55] },
    { data: [60, 55, 60, 70, 65, 80, 75] },
    { data: [20, 15, 25, 20, 30, 25, 40] },
    { data: [40, 45, 40, 55, 50, 65, 70] },
  ];

  return (
    <div className="px-6 pb-6 relative min-h-screen bg-dark">
      {/* Balance Card */}
      <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl shadow-primary/5 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10 transition-all duration-1000 group-hover:bg-primary/30" />
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <span className="text-sm font-medium uppercase tracking-wider">Total Balance</span>
                <button onClick={() => setHidden(!hidden)} className="hover:text-primary transition-colors">
                    {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={fetchData} disabled={refreshing} className="hover:text-primary transition-colors disabled:opacity-50">
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
                {balance !== null && !hidden ? formatCurrency(balance) : '****'}
            </h1>
            <div className="flex items-center gap-2 text-black bg-primary self-start inline-flex px-3 py-1 rounded-full text-xs font-bold">
                <TrendingUp size={14} />
                <span>+2.45% (24h)</span>
            </div>
        </div>
      </div>

      {/* Coins List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200">Assets</h3>
        
        {coins.length === 0 ? (
           // Skeletons
           [1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-white/5" />)
        ) : (
            coins.map((coin, index) => (
                <div 
                    key={coin.id}
                    onClick={() => navigate(`/coin/${coin.id}`)}
                    className="bg-card hover:bg-white/5 transition-all p-4 rounded-2xl flex items-center justify-between border border-white/10 cursor-pointer active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                            {coin.symbol[0]}
                        </div>
                        <div>
                            <p className="font-bold text-white">{coin.name}</p>
                            <p className="text-xs text-slate-500">{coin.symbol}</p>
                        </div>
                    </div>
                    
                    {/* Mini Sparkline */}
                    <div className="w-16 h-8 opacity-70">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparkData[index % 4].data.map(v => ({ v }))}>
                                <Line type="monotone" dataKey="v" stroke={(coin.change24h ?? 0) >= 0 ? "#00FFA3" : "#ef4444"} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-right">
                         <p className="font-bold text-white text-sm">{coin.balance?.toFixed(4)} {coin.symbol}</p>
                         <p className="text-xs text-slate-400">
                             {formatCurrency(coin.balance * coin.price)}
                         </p>
                         <p className="text-xs text-slate-500 mt-0.5">
                             @ {formatCurrency(coin.price)}
                         </p>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* AI Floating Button */}
      <button 
        onClick={() => navigate('/chat')}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-[0_0_20px_rgba(0,255,163,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] border border-black"
      >
        <Bot size={28} />
      </button>
    </div>
  );
};