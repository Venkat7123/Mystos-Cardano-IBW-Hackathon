// src/services/api.ts
// Frontend API client - connects to the Express backend

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

// Mock data for fallback when backend is unavailable
const MOCK_COINS = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', balance: 0.125, price: 64200.5, change24h: 2.5 },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: 1.45, price: 2650.0, change24h: -1.2 },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 5430.0, price: 1.0, change24h: 0.01 },
  { id: 'sol', symbol: 'SOL', name: 'Solana', balance: 45.2, price: 145.2, change24h: 5.3 },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', balance: 200.0, price: 0.4, change24h: -0.8 }
];

async function callApi(path: string, method = 'GET', body?: any) {
  // Add timestamp to prevent caching
  const separator = path.includes('?') ? '&' : '?';
  const url = `${API_BASE}${path}${method === 'GET' ? `${separator}_t=${Date.now()}` : ''}`;
  const opts: RequestInit = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    credentials: 'include',
    cache: 'no-store',  // Prevent caching to always get fresh data
  };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed ${res.status}: ${text}`);
  }
  return res.json();
}

// Safe API call that returns fallback on error
async function safeCallApi<T>(path: string, fallback: T, method = 'GET', body?: any): Promise<T> {
  try {
    return await callApi(path, method, body);
  } catch (e) {
    console.warn(`API call to ${path} failed, using fallback:`, e);
    return fallback;
  }
}

const api = {
  // Auth
  login: (pubkey: string, signature: string, chain: string) =>
    callApi('/auth/login', 'POST', { pubkey, signature, chain }),
  logout: () => callApi('/auth/logout', 'POST'),
  me: () => callApi('/auth/me', 'GET'),

  // Wallet
  registerWallet: (pubkey: string) => callApi('/wallet/register', 'POST', { pubkey }),

  // Coins & balance (backend uses /tx/coins)
  getBalance: async () => {
    try {
      const coins = await callApi('/tx/coins', 'GET');
      const totalUSD = coins.reduce((s: number, c: any) => s + (c.balance * c.price), 0);
      return totalUSD;
    } catch (e) {
      console.warn('getBalance failed, using mock:', e);
      const total = MOCK_COINS.reduce((s, c) => s + (c.balance * c.price), 0);
      return total;
    }
  },
  getCoins: () => safeCallApi('/tx/coins', MOCK_COINS, 'GET'),

  // Transactions (backend uses /tx/*)
  getTxHistory: () => safeCallApi('/tx/history', [], 'GET'),
  // send expects: { to_address, token, amount, note? }
  send: (payload: { to_address: string; token: string; amount: number; note?: string }) =>
    callApi('/tx/send', 'POST', payload),
  // receive expects: { from_address, token, amount, note? }
  receive: (payload: { from_address: string; token: string; amount: number; note?: string }) =>
    callApi('/tx/receive', 'POST', payload),

  // Rating
  submitRating: (payload: any) =>
    callApi('/rating/submit', 'POST', payload).catch((e) => {
      console.warn('submitRating failed, returning fallback ok', e);
      return { status: 'ok' };
    }),

  // DAO
  getProposals: () => safeCallApi('/dao/proposals', [
    { 
      id: 'prop-101', 
      title: 'Treasury Allocation Q1', 
      description: 'Proposal to allocate 10% of treasury funds for ecosystem development grants.',
      summary: 'This proposal aims to boost ecosystem growth by funding promising projects.',
      pros: ['Encourages innovation', 'Attracts new developers', 'Diversifies ecosystem'],
      cons: ['Reduces treasury reserves', 'Risk of unsuccessful projects', 'Opportunity cost'],
      votesFor: 1234,
      votesAgainst: 456,
      endDate: '2025-12-15'
    },
    { 
      id: 'prop-102', 
      title: 'Protocol Upgrade v2.0', 
      description: 'Major protocol upgrade introducing improved scalability and lower fees.',
      summary: 'Upgrade to next-gen consensus mechanism for better performance.',
      pros: ['Faster transactions', 'Lower gas fees', 'Better security'],
      cons: ['Migration complexity', 'Potential bugs', 'Learning curve'],
      votesFor: 2100,
      votesAgainst: 320,
      endDate: '2025-12-20'
    }
  ], 'GET'),

  // Reputation
  reputation: (did?: string) => safeCallApi(`/reputation${did ? `/${encodeURIComponent(did)}` : ''}`, { score: 92, label: 'Assured' }, 'GET'),

  // helper: server-side QR image URL
  getReceiveQrUrl: (address: string) => `${API_BASE}/receive/${encodeURIComponent(address)}/qr`,

  // Swap: client-side mock quoting; backend swap endpoint optional
  swapQuoteClient: (fromAmount: number, fromToken: string, toToken: string) => {
    const mockRates: Record<string, number> = {
      'ETH-USDT': 2650, 'BTC-USDT': 64200, 'SOL-USDT': 145,
      'USDT-ETH': 1/2650, 'USDT-BTC': 1/64200, 'USDT-SOL': 1/145,
      'ETH-BTC': 2650/64200, 'BTC-ETH': 64200/2650,
      'ETH-SOL': 2650/145, 'SOL-ETH': 145/2650,
      'BTC-SOL': 64200/145, 'SOL-BTC': 145/64200,
    };
    const rate = mockRates[`${fromToken}-${toToken}`] || 1;
    const toAmount = (fromAmount || 0) * rate;
    return { toAmount, rate };
  },

  // raw
  raw: callApi,
};

// Backwards-compat shim for existing FETCH_FROM_BACKEND calls
export async function FETCH_FROM_BACKEND(key: string, ...args: any[]): Promise<any> {
  switch (key) {
    case 'balance': {
      return (await api.getBalance());
    }
    case 'coin_list':
    case 'coins':
      return api.getCoins();
    case 'coin_detail': {
      const coins = await api.getCoins();
      return coins.find((c: any) => c.id === args[0]) || coins[0];
    }
    case 'tx_history':
    case 'txs':
    case 'transactions':
      return api.getTxHistory();
    case 'dao_proposals':
    case 'proposals':
      return api.getProposals();
    case 'rating_submit':
    case 'submit_rating':
      return api.submitRating(args[0]);
    case 'tx_send': {
      // expects payload: { to_address, token, amount, note? }
      const p = args[0] || {};
      return api.send({
        to_address: p.to_address || p.to,
        token: p.token || p.asset,
        amount: Number(p.amount),
        note: p.note
      });
    }
    case 'tx_receive': {
      // expects payload: { from_address, token, amount, note? }
      const p = args[0] || {};
      return api.receive({
        from_address: p.from_address || p.from,
        token: p.token || p.asset,
        amount: Number(p.amount),
        note: p.note
      });
    }
    case 'wallet_register':
      return api.registerWallet(args[0] as string);
    case 'auth_login':
      return api.login(...(args as [string, string, string]));
    case 'auth_logout':
      return api.logout();
    case 'auth_me':
      return api.me();
    case 'get_settings':
      return { 
        username: 'MystosUser', 
        email: 'user@mystos.io', 
        did: 'did:mystos:abc123xyz',
        theme: 'dark',
        notifications: true 
      };
    case 'set_theme':
    case 'update_profile':
    case 'delete_wallet':
    case 'submit_vote':
    case 'set_push_notifications':
    case 'support_ticket':
      console.log(`[API Stub] ${key}`, args);
      return { status: 'ok' };
    case 'swap_quote': {
      const { fromAmount, fromToken, toToken } = args[0] || {};
      return api.swapQuoteClient(fromAmount, fromToken, toToken);
    }
    case 'swap_execute':
      // if you later implement a server swap, adjust this to call it
      return api.raw('/tx/swap', 'POST', args[0]);
    case 'reputation':
      return api.reputation(args[0]);
    case 'get_receive_address':
      return '0x1234567890abcdef1234567890abcdef12345678';
    case 'withdraw':
      console.log(`[API Stub] withdraw`, args);
      return { status: 'ok' };
    case 'send':
      console.log(`[API Stub] send`, args);
      return { status: 'ok' };
    default:
      console.warn(`Unknown backend key: ${key}`);
      return null;
  }
}

export default { FETCH_FROM_BACKEND, api };
