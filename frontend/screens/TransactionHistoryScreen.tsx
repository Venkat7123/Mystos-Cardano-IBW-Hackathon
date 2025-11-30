import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Search, Filter, ArrowUpRight, ArrowDownLeft, 
  RefreshCw, LogOut, Vote, ExternalLink, Copy, Share2, 
  CheckCircle2, XCircle, Clock, MoreHorizontal, X, FileJson
} from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';
import { Transaction } from '../../types';

// --- COMPONENTS ---

const TxIcon: React.FC<{ type: string }> = ({ type }) => {
  let Icon = ArrowUpRight;
  let bgClass = 'bg-slate-800';
  let textClass = 'text-white';

  switch (type) {
    case 'receive': Icon = ArrowDownLeft; bgClass = 'bg-green-500/20'; textClass = 'text-green-400'; break;
    case 'send': Icon = ArrowUpRight; bgClass = 'bg-red-500/20'; textClass = 'text-red-400'; break;
    case 'swap': Icon = RefreshCw; bgClass = 'bg-blue-500/20'; textClass = 'text-blue-400'; break;
    case 'withdraw': Icon = LogOut; bgClass = 'bg-orange-500/20'; textClass = 'text-orange-400'; break;
    case 'vote': Icon = Vote; bgClass = 'bg-purple-500/20'; textClass = 'text-purple-400'; break;
  }

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass} ${textClass}`}>
      <Icon size={20} />
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = 'text-slate-400 bg-slate-800';
  if (status === 'confirmed') color = 'text-green-400 bg-green-500/10';
  if (status === 'failed') color = 'text-red-400 bg-red-500/10';
  if (status === 'pending') color = 'text-yellow-400 bg-yellow-500/10';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {status}
    </span>
  );
};

const DetailRow: React.FC<{ label: string; value: string; copy?: boolean }> = ({ label, value, copy }) => (
  <div className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
    <span className="text-slate-500 text-sm">{label}</span>
    <div className="flex items-center gap-2 text-right">
      <span className="text-white text-sm font-mono break-all max-w-[200px]">{value}</span>
      {copy && <button className="text-primary hover:text-white"><Copy size={12} /></button>}
    </div>
  </div>
);

// --- MAIN SCREEN ---

export const TransactionHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modal State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [activeFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await FETCH_FROM_BACKEND('transactions', { filter: activeFilter, query: searchQuery }) as Transaction[];
    setTransactions(data);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  const formatAmount = (tx: Transaction) => {
    const prefix = tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : '';
    return `${prefix}${tx.amount} ${tx.token}`;
  };

  const amountColor = (type: string) => {
    if (type === 'receive') return 'text-green-400';
    if (type === 'send' || type === 'withdraw') return 'text-white';
    return 'text-white';
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col pb-6 relative">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-dark/95 backdrop-blur-md border-b border-white/5 pb-2">
        <div className="flex items-center justify-between px-4 py-4">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
            <ChevronLeft className="text-white" size={24} />
            </button>
            <h2 className="text-lg font-bold text-white">Transaction History</h2>
            <button className="p-2 -mr-2 text-slate-400 hover:text-white">
                <Search size={20} />
            </button>
        </div>

        {/* SUMMARY ROW */}
        <div className="px-4 mb-4 flex gap-4 text-xs">
            <div className="flex-1 bg-card rounded-xl p-3 border border-white/5">
                <p className="text-slate-500 mb-1">Total Transactions</p>
                <p className="text-white font-bold text-lg">{transactions.length}</p>
            </div>
            <div className="flex-1 bg-card rounded-xl p-3 border border-white/5">
                <p className="text-slate-500 mb-1">Period Change</p>
                <p className="text-green-400 font-bold text-lg">+$540.23</p>
            </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 mb-3">
            <div className="relative">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by hash, address or token..."
                    className="w-full bg-card text-white text-sm rounded-xl py-3 pl-10 pr-4 outline-none border border-white/5 focus:border-primary/50 placeholder:text-slate-600"
                />
                <Search className="absolute left-3 top-3 text-slate-600" size={16} />
            </div>
        </div>

        {/* FILTERS */}
        <div className="flex overflow-x-auto px-4 gap-2 no-scrollbar pb-2">
            {['All', 'Send', 'Receive', 'Swap', 'Withdraw', 'Vote'].map(f => (
                <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        activeFilter === f 
                        ? 'bg-primary text-black border-primary' 
                        : 'bg-card text-slate-400 border-white/10 hover:border-white/30'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
            // Skeletons
            [1,2,3,4].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)
        ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <RefreshCw size={48} className="mb-4 text-slate-600" />
                <p className="text-slate-400">No transactions found</p>
            </div>
        ) : (
            transactions.map((tx) => (
                <div 
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="bg-card p-3 rounded-xl border border-white/5 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer shadow-sm relative overflow-hidden"
                >
                    <TxIcon type={tx.type} />
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate capitalize">
                            {tx.description || `${tx.type} ${tx.token}`}
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                            {new Date(tx.date).toLocaleDateString()}
                            <span className="w-0.5 h-0.5 bg-slate-600 rounded-full" />
                            {tx.network}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className={`font-bold text-sm ${amountColor(tx.type)}`}>
                            {formatAmount(tx)}
                        </p>
                        <div className="mt-1 flex justify-end">
                            <StatusBadge status={tx.status} />
                        </div>
                    </div>
                </div>
            ))
        )}

        {/* LOAD MORE */}
        {!loading && transactions.length > 0 && (
             <button className="w-full py-4 text-xs text-slate-500 font-bold uppercase tracking-widest hover:text-primary transition-colors">
                Load More History
             </button>
        )}
      </div>

      {/* MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
            
            <div className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-white/10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={() => setSelectedTx(null)}
                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="mb-4 scale-125">
                        <TxIcon type={selectedTx.type} />
                    </div>
                    <h3 className="text-xl font-bold text-white capitalize mb-1">{selectedTx.description}</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {formatAmount(selectedTx)}
                    </div>
                    <p className="text-slate-500 text-sm">≈ ${selectedTx.usdAmount.toFixed(2)} USD</p>
                    <div className="mt-3">
                        <StatusBadge status={selectedTx.status} />
                    </div>
                </div>

                <div className="space-y-1 mb-6">
                    <DetailRow label="Date" value={new Date(selectedTx.date).toLocaleString()} />
                    <DetailRow label="Network" value={selectedTx.network} />
                    <DetailRow label="From" value={selectedTx.fromAddress} copy />
                    <DetailRow label="To" value={selectedTx.toAddress} copy />
                    <DetailRow label="Tx Hash" value={selectedTx.hash} copy />
                    <DetailRow label="Network Fee" value={`${selectedTx.fee} ETH`} />
                    {selectedTx.proposalId && (
                         <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-slate-500 text-sm">Proposal</span>
                            <button className="text-primary text-sm font-bold flex items-center gap-1">
                                View Proposal <ExternalLink size={12} />
                            </button>
                         </div>
                    )}
                </div>

                <div className="mb-6">
                    <button 
                        onClick={() => setShowJson(!showJson)}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-wider"
                    >
                        <FileJson size={14} /> {showJson ? 'Hide' : 'Show'} Raw Data
                    </button>
                    {showJson && (
                        <pre className="mt-3 bg-black/50 p-3 rounded-xl text-[10px] text-green-400 font-mono overflow-x-auto border border-white/5">
                            {JSON.stringify(selectedTx, null, 2)}
                        </pre>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-colors">
                        <Copy size={16} /> Copy Hash
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-primary rounded-xl text-black font-bold text-sm hover:bg-green-400 transition-colors">
                        <Share2 size={16} /> Share
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};