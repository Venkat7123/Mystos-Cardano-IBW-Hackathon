export interface Coin {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number; // Percentage
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  summary: string;
  pros: string[];
  cons: string[];
  votesFor: number;
  votesAgainst: number;
  endDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  action?: 'view_proposal' | 'vote_flow';
  payload?: any;
}

export interface ReputationData {
  score: number; // 0 - 100
  label: 'Assured' | 'OK' | 'Not Recommended';
}

export type TransactionType = 'send' | 'receive' | 'swap' | 'withdraw' | 'vote';
export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  token: string;
  amount: number;
  usdAmount: number;
  date: string; // ISO string
  network: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  fee: number;
  description?: string;
  proposalId?: string; // If vote
}

// Navigation types are handled via React Router string paths