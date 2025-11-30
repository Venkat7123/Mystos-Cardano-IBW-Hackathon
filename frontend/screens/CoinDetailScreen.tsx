import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowUpRight } from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';
import { Coin } from '../../types';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock chart data
const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  price: 100 + Math.random() * 40 - 20
}));

export const CoinDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coin, setCoin] = useState<Coin | null>(null);

  useEffect(() => {
    if (id) {
      FETCH_FROM_BACKEND('coin_detail', id).then(data => setCoin(data as Coin));
    }
  }, [id]);

  if (!coin) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"/></div>;

  return (
    <div className="min-h-screen flex flex-col bg-dark pb-20">
      <div className="px-6 pt-8 pb-4 flex justify-between items-center z-10 relative">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="font-bold text-lg text-white">{coin.name}</h2>
        <div className="w-8" />
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-bold text-white">${coin.price.toFixed(2)}</h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
             <span className={`px-2 py-1 rounded-lg text-xs font-bold ${coin.change24h >= 0 ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                {coin.change24h > 0 ? '+' : ''}{coin.change24h}%
             </span>
             <span className="text-slate-500 text-sm">Past 24 Hours</span>
        </div>
      </div>

      <div className="h-64 w-full mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark pointer-events-none z-10" />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00FFA3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#00FFA3' }}
            />
            <Area type="monotone" dataKey="price" stroke="#00FFA3" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="px-6 space-y-6">
          <div className="bg-card p-5 rounded-2xl border border-white/10 shadow-lg shadow-black">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-2 tracking-widest">Your Position</h3>
              <div className="flex justify-between items-center">
                  <span className="text-white text-lg font-medium">{coin.balance} {coin.symbol}</span>
                  <span className="text-slate-400 text-sm">= ${(coin.balance * coin.price).toFixed(2)}</span>
              </div>
          </div>

          <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">About {coin.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                  {coin.name} is a high-performance blockchain utilized for builders. 
                  This is a mocked description fetched from the backend for the demo.
              </p>
          </div>

          <button 
            onClick={() => navigate('/action/buy')}
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:shadow-[0_0_25px_rgba(0,255,163,0.5)] transition-all flex items-center justify-center gap-2"
          >
             Buy {coin.symbol} <ArrowUpRight size={18} />
          </button>
      </div>
    </div>
  );
};