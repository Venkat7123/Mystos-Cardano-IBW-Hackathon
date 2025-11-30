import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { FETCH_FROM_BACKEND } from '@services/apiClient';
import { ReputationData } from '../../types';

export const ReputationBadge: React.FC = () => {
  const [reputation, setReputation] = useState<ReputationData | null>(null);

  useEffect(() => {
    FETCH_FROM_BACKEND('reputation').then((data) => {
      setReputation(data as ReputationData);
    });

  }, []);

  if (!reputation) return <div className="animate-pulse w-20 h-6 bg-white/10 rounded-full" />;

  let colorClass = '';
  let Icon = ShieldCheck;

  if (reputation.score >= 90) {
    colorClass = 'bg-green-500/20 text-green-400 border-green-500/30';
    Icon = ShieldCheck;
  } else if (reputation.score >= 80) {
    colorClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    Icon = ShieldAlert;
  } else {
    colorClass = 'bg-red-500/20 text-red-400 border-red-500/30';
    Icon = ShieldX;
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colorClass} text-xs font-semibold backdrop-blur-md`}>
      <Icon size={12} />
      <span>{reputation.label}</span>
    </div>
  );
};