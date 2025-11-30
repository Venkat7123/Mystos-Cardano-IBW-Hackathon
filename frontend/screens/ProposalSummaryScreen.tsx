import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';
import apiClient from '@services/apiClient'; // adjust path if needed
const { api } = apiClient;
type ProposalShape = {
  id?: string;
  title?: string;
  summary?: string;
  details?: string;
  pros?: string[] | null;
  cons?: string[] | null;
  endDate?: string;
  [k: string]: any;
};

export const ProposalSummaryScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<ProposalShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      try {
        let p: any = null;
        // 1) If id provided, try GET /dao/proposals/:id (preferred)
        if (id) {
          try {
            const resp = await api.raw(`/dao/proposals/${encodeURIComponent(id)}`, 'GET');
            if (mounted) {
              setDebugInfo({ source: 'api.raw /dao/proposals/:id', response: resp });
            }
            p = resp;
          } catch (e) {
            // record error and fallback to list
            if (mounted) {
              setDebugInfo((d:any) => ({ ...d, idFetchError: String(e) }));
            }
            // fallback below...
          }
        }

        // 2) If still no proposal, fetch list via FETCH_FROM_BACKEND('proposals')
        if (!p) {
          try {
            const list = await FETCH_FROM_BACKEND('proposals');
            if (mounted) {
              setDebugInfo((d:any) => ({ ...d, sourceList: list }));
            }
            if (Array.isArray(list) && list.length > 0) {
              // if id exists, try to find that id, else take first
              p = id ? list.find((x: any) => String(x.id) === String(id)) || list[0] : list[0];
            } else {
              // not an array: maybe object with .proposals
              if (list && typeof list === 'object' && Array.isArray((list as any).proposals)) {
                p = (list as any).proposals[0];
              } else {
                // store raw payload in debug
                if (mounted) setDebugInfo((d:any) => ({ ...d, unexpectedListShape: list }));
              }
            }
          } catch (e) {
            if (mounted) setDebugInfo((d:any) => ({ ...d, listFetchError: String(e) }));
          }
        }

        // 3) If still missing, set not found
        if (!p) {
          if (mounted) {
            setProposal(null);
            setLoading(false);
            setError('Proposal not found');
          }
          return;
        }

        // 4) Normalize shape (guarantee arrays)
        const normalized: ProposalShape = {
          id: p.id ?? p.proposalId ?? 'unknown',
          title: p.title ?? p.name ?? 'Untitled proposal',
          summary: p.summary ?? p.details ?? 'No summary available',
          details: p.details ?? p.summary ?? '',
          pros: Array.isArray(p.pros) ? p.pros : (p.pros ? [String(p.pros)] : []),
          cons: Array.isArray(p.cons) ? p.cons : (p.cons ? [String(p.cons)] : []),
          endDate: p.endDate ?? p.deadline ?? 'TBD',
          raw: p
        };

        if (mounted) {
          setProposal(normalized);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Proposal load error', err);
        if (mounted) {
          setError(String(err.message ?? err));
          setDebugInfo((d:any) => ({ ...d, unexpectedError: String(err) }));
          setLoading(false);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono">INITIALIZING AI SUMMARY...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <div className="bg-card p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Error loading proposal</h3>
          <p className="text-slate-400 text-sm mb-3">{error}</p>
          <pre className="text-xs p-2 bg-gray-900/40 rounded max-h-48 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          <div className="mt-4 flex gap-2">
            <button onClick={() => location.reload()} className="px-3 py-2 bg-primary rounded text-black font-bold">Retry</button>
            <button onClick={() => navigate('/dao')} className="px-3 py-2 border rounded text-white">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <div className="bg-card p-6 rounded-xl text-center">
          <h3 className="text-lg font-bold text-white mb-2">Proposal not found</h3>
          <p className="text-slate-400 text-sm mb-4">We couldn't find the requested proposal.</p>
          <pre className="text-xs p-2 bg-gray-900/40 rounded max-h-48 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          <button onClick={() => navigate('/dao')} className="px-4 py-2 bg-primary rounded-lg text-black font-bold">Back to Proposals</button>
        </div>
      </div>
    );
  }

  // Safe render using fallback arrays
  const pros = proposal.pros ?? [];
  const cons = proposal.cons ?? [];

  return (
    <div className="min-h-screen bg-dark px-6 pt-8 pb-24">
       <div className="flex items-center mb-6 relative z-10">
        <button 
            onClick={() => navigate(-1)} 
            className="p-3 -ml-3 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h2 className="ml-2 text-lg font-bold text-white">Proposal Analysis</h2>
      </div>

      <div className="bg-card rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-xl rounded-full" />

        <div>
             <span className="text-[10px] font-bold text-black bg-primary px-2 py-0.5 rounded-sm tracking-widest">ACTIVE PROPOSAL</span>
             <h1 className="text-2xl font-bold text-white mt-3 mb-1">{proposal.title}</h1>
             <p className="text-slate-500 text-xs font-mono">DEADLINE: {proposal.endDate}</p>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-white/5">
             <div className="flex items-center gap-2 mb-2 text-primary">
                <FileText size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">AI Summary</span>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed">
                 {proposal.summary}
             </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/10 p-4 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-2 mb-2 text-green-400">
                    <ThumbsUp size={16} />
                    <span className="text-xs font-bold">PROS</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {pros.length ? pros.map((p: any, idx: number) => <li key={`${p}-${idx}`}>{p}</li>) : <li className="text-slate-500">No pros listed.</li>}
                </ul>
            </div>
             <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                    <ThumbsDown size={16} />
                    <span className="text-xs font-bold">CONS</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {cons.length ? cons.map((c: any, idx: number) => <li key={`${c}-${idx}`}>{c}</li>) : <li className="text-slate-500">No cons listed.</li>}
                </ul>
            </div>
        </div>

        <button 
            onClick={() => navigate(`/vote/${proposal.id}`)}
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(0,255,163,0.3)] mt-4 uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,255,163,0.5)] transition-all"
        >
            Vote on Proposal
        </button>

        {/* Debug panel */}
        <details className="mt-4 text-xs text-slate-400">
          <summary className="cursor-pointer">Debug: raw proposal payload</summary>
          <pre className="text-xs p-2 bg-gray-900/40 rounded max-h-48 overflow-auto">{JSON.stringify(proposal.raw ?? proposal, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};
