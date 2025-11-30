import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import { FETCH_FROM_BACKEND } from '@services/apiClient';
import apiClient from '@services/apiClient';

const { api } = apiClient;
import { ReputationBadge } from '../components/ReputationBadge';

type BotAction = 'view_proposal' | 'vote_flow' | 'summarize' | 'none';

export const ChatbotScreen: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'bot', text: 'Hello! I am Mystos AI. I can help you analyze markets, summarize proposals, or manage your wallet.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // small utility to append a bot message
  const pushBotMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  // local summarizer (very simple; good enough for demo)
  function summarizeText(text: string) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 2) return text;
    // pick first sentence + one middle sentence + last sentence
    const mid = sentences[Math.floor(sentences.length / 2)];
    return `${sentences[0]} ${mid} ${sentences[sentences.length - 1]}`;
  }

  // fetch proposals list from backend
  async function fetchProposals(): Promise<any[]> {
    try {
      // prefer api if available
      const p = await (typeof FETCH_FROM_BACKEND === 'function' ? FETCH_FROM_BACKEND('proposals') : api.getProposals());
      // normalize if backend returns object(s)
      return Array.isArray(p) ? p : (p?.proposals || []);
    } catch (e) {
      console.warn('fetchProposals failed', e);
      return [];
    }
  }

  async function fetchProposalById(id: string) {
    try {
      // use direct backend route if available
      return await api.raw(`/dao/proposals/${encodeURIComponent(id)}`, 'GET');
    } catch (e) {
      // fallback to list scan
      const list = await fetchProposals();
      return list.find((x: any) => x.id === id) || null;
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const text = input.trim();
    setInput('');

    // immediate processing message
    pushBotMessage({ id: `b-${Date.now()}`, role: 'bot', text: "One sec — let me check that..." });

    const lower = text.toLowerCase();

    // small router for intents
    if (lower.includes('proposal') && lower.includes('list')) {
      // list proposals
      const proposals = await fetchProposals();
      if (!proposals.length) {
        pushBotMessage({ id: `b-${Date.now() + 1}`, role: 'bot', text: 'No proposals found.' });
        return;
      }
      const first = proposals[0];
      pushBotMessage({
        id: `b-${Date.now() + 2}`,
        role: 'bot',
        text: `I found ${proposals.length} active proposal(s). "${first.title}" is trending.`,
        action: 'view_proposal',
        payload: first
      });
      return;
    }

    if (lower.includes('proposal') && lower.match(/\b(p|prop|p)\d+\b/)) {
      // user referenced a specific proposal id like p1 or prop-101
      const match = lower.match(/\b(p(?:rop)?-?\d+)\b/);
      const pid = match ? match[1] : null;
      if (pid) {
        const proposal = await fetchProposalById(pid);
        if (proposal) {
          const summary = summarizeText(proposal.details || proposal.summary || proposal.title);
          pushBotMessage({
            id: `b-${Date.now() + 3}`,
            role: 'bot',
            text: `Here is a brief summary for "${proposal.title}":\n\n${summary}`,
            action: 'view_proposal',
            payload: proposal
          });
          return;
        }
      }
    }

    if (lower.includes('proposal') || lower.includes('dao')) {
      // general enquiry - show proposals and actions
      const proposals = await fetchProposals();
      if (proposals.length === 0) {
        pushBotMessage({ id: `b-${Date.now() + 4}`, role: 'bot', text: "I couldn't find any active proposals." });
        return;
      }
      const p0 = proposals[0];
      pushBotMessage({
        id: `b-${Date.now() + 5}`,
        role: 'bot',
        text: `I found ${proposals.length} proposals. "${p0.title}" — ${p0.summary}`,
        action: 'view_proposal',
        payload: p0
      });
      return;
    }

    if (lower.includes('summarize')) {
      // try to parse id or summarize the last proposal
      const maybeIdMatch = text.match(/\b(p(?:rop)?-?\d+)\b/i);
      if (maybeIdMatch) {
        const id = maybeIdMatch[1];
        const proposal = await fetchProposalById(id);
        if (proposal) {
          pushBotMessage({
            id: `b-${Date.now() + 6}`,
            role: 'bot',
            text: `Summary of "${proposal.title}":\n\n${summarizeText(proposal.details || proposal.summary || proposal.title)}`,
            action: 'view_proposal',
            payload: proposal
          });
          return;
        } else {
          pushBotMessage({ id: `b-${Date.now() + 7}`, role: 'bot', text: `Couldn't find proposal ${id}.` });
          return;
        }
      }

      // summarise the most recent proposal
      const proposals = await fetchProposals();
      if (!proposals.length) {
        pushBotMessage({ id: `b-${Date.now() + 8}`, role: 'bot', text: 'No proposals to summarize.' });
        return;
      }
      const p = proposals[0];
      pushBotMessage({ id: `b-${Date.now() + 9}`, role: 'bot', text: `Summary: ${summarizeText(p.summary || p.title)}`, action: 'view_proposal', payload: p });
      return;
    }

    if (lower.includes('vote')) {
      // start vote flow for the first active proposal (demo)
      const proposals = await fetchProposals();
      if (!proposals.length) {
        pushBotMessage({ id: `b-${Date.now() + 10}`, role: 'bot', text: "No active proposals to vote on." });
        return;
      }
      const p = proposals[0];
      pushBotMessage({
        id: `b-${Date.now() + 11}`,
        role: 'bot',
        text: `Ready to vote on "${p.title}". Would you like to proceed to vote now?`,
        action: 'vote_flow',
        payload: p
      });
      return;
    }

    // fallback default reply
    pushBotMessage({ id: `b-${Date.now() + 12}`, role: 'bot', text: "I'm a demo AI. Try: 'Fetch DAO proposals', 'Summarize proposal p1', or 'Vote'." });
  };

  // when user clicks an action chip in a bot message
  const handleActionClick = async (action: BotAction, payload: any) => {
    if (action === 'view_proposal') {
      const id = payload?.id || payload;
      navigate(`/proposal/${id}`);
    } else if (action === 'vote_flow') {
      const p = payload;
      const id = p?.id || p;
      if (!id) {
        // fallback: show message in chat instead of navigating to an invalid route
        pushBotMessage({ id: `b-${Date.now()}`, role: 'bot', text: 'Sorry — I could not find the proposal id to start a vote.' });
        return;
      }
      // Navigate to the vote route with the proposal id
      navigate(`/vote/${encodeURIComponent(id)}`);
    } else if (action === 'summarize') {
      const p = payload;
      const summary = summarizeText(p.details || p.summary || p.title);
      pushBotMessage({ id: `b-${Date.now() + 20}`, role: 'bot', text: `Summary: ${summary}` });
    }
  };


  // render
  return (
    <div className="flex flex-col h-screen bg-dark">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between bg-dark/80 backdrop-blur-md z-20 sticky top-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 mr-2 transition-colors"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <div>
            <h2 className="font-bold text-white flex items-center gap-2">Mystos AI <Sparkles size={14} className="text-primary" /></h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] text-primary font-mono tracking-wider">ONLINE</span>
            </div>
          </div>
        </div>
        <ReputationBadge />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-black font-medium rounded-br-none' : 'bg-card text-slate-200 border border-white/10 rounded-bl-none'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>

              {/* Action chips */}
              {msg.action === 'view_proposal' && msg.payload && (
                <div className="mt-3 grid gap-2">
                  <button
                    onClick={() => handleActionClick('view_proposal', msg.payload)}
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-lg w-full text-left flex justify-between items-center transition-colors"
                  >
                    <span className="font-bold text-primary">View Proposal Details</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActionClick('summarize', msg.payload)}
                      className="text-xs bg-card border border-primary/30 px-3 py-2 rounded-lg flex-1"
                    >
                      Summarize
                    </button>

                    <button
                      onClick={() => handleActionClick('vote_flow', msg.payload)}
                      className="text-xs bg-primary px-3 py-2 rounded-lg text-black font-bold"
                    >
                      Vote
                    </button>
                  </div>
                </div>
              )}

              {msg.action === 'vote_flow' && msg.payload && (
                <div className="mt-3">
                  <button
                    onClick={() => handleActionClick('vote_flow', msg.payload)}
                    className="text-xs bg-primary px-3 py-2 rounded-lg text-black font-bold w-full"
                  >
                    Start Vote Flow
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {['Fetch DAO proposals', 'Summarize proposal', 'Recommend vote'].map(cmd => (
          <button
            key={cmd}
            onClick={() => setInput(cmd)}
            className="whitespace-nowrap px-3 py-1.5 bg-card border border-primary/30 rounded-full text-xs text-primary hover:bg-primary hover:text-black transition-all font-mono"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-white/10 mb-20 md:mb-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Mystos..."
            className="flex-1 bg-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary border border-white/5"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black hover:bg-green-400 transition-colors shadow-[0_0_10px_rgba(0,255,163,0.3)]"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
