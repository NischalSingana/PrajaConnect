import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Trophy, Star, TrendingUp, Award, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const MOCK_POLITICIANS = [
  { name: 'MLA Kavitha Reddy', district: 'Serilingampally', resolutionRate: 94, avgHours: 18, rating: 4.8 },
  { name: 'Corporator Anitha Kumari', district: 'Ward 55 – Begumpet', resolutionRate: 88, avgHours: 22, rating: 4.6 },
  { name: 'J Surya Kiran', district: 'KL University', resolutionRate: 82, avgHours: 31, rating: 4.3 },
  { name: 'MLA Ramesh Babu', district: 'Khairatabad', resolutionRate: 77, avgHours: 38, rating: 4.1 },
  { name: 'Corporator Priya Nair', district: 'Jubilee Hills', resolutionRate: 71, avgHours: 44, rating: 3.9 },
];

const RANK_STYLE: Record<number, { bg: string; text: string; icon: string }> = {
  0: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: '🥇' },
  1: { bg: 'bg-zinc-400/10 border-zinc-400/20', text: 'text-zinc-300', icon: '🥈' },
  2: { bg: 'bg-orange-600/10 border-orange-600/20', text: 'text-orange-400', icon: '🥉' },
};

type Tab = 'citizens' | 'politicians';

export function LeaderboardPage() {
  const { issues } = useLocalStore();
  const [tab, setTab] = useState<Tab>('citizens');

  const citizenMap: Record<string, { id: string; reports: number; resolved: number; upvotes: number }> = {};
  issues.forEach(issue => {
    if (!citizenMap[issue.reporterId]) {
      citizenMap[issue.reporterId] = { id: issue.reporterId, reports: 0, resolved: 0, upvotes: 0 };
    }
    citizenMap[issue.reporterId].reports += 1;
    if (issue.status === 'Resolved') citizenMap[issue.reporterId].resolved += 1;
    citizenMap[issue.reporterId].upvotes += issue.upvotes;
  });

  const citizens = Object.values(citizenMap)
    .sort((a, b) => b.resolved * 10 + b.upvotes - (a.resolved * 10 + a.upvotes))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Trophy className="h-3 w-3" /> Community Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Leaderboard</h1>
          <p className="text-zinc-500 font-medium max-w-md mx-auto">
            Recognising the citizens and representatives driving real change.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex gap-2 p-1 rounded-2xl border border-white/[0.05] bg-zinc-900/20 w-fit mx-auto"
        >
          {(['citizens', 'politicians'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                tab === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              )}
            >
              {t === 'citizens' ? <><Users className="h-3 w-3 inline mr-1.5" />Citizens</> : <><Star className="h-3 w-3 inline mr-1.5" />Politicians</>}
            </button>
          ))}
        </motion.div>

        {/* Citizens Tab */}
        {tab === 'citizens' && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {citizens.length === 0 ? (
              <div className="py-20 rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center gap-3">
                <Activity className="h-10 w-10 text-zinc-800" />
                <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">No data yet</p>
              </div>
            ) : citizens.map((c, idx) => {
              const rank = RANK_STYLE[idx];
              return (
                <motion.div key={c.id} variants={item}>
                  <div className={cn(
                    'flex items-center justify-between p-6 rounded-3xl border transition-all hover:scale-[1.01]',
                    rank ? rank.bg : 'border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-900/40'
                  )}>
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        'h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border',
                        rank ? `${rank.bg} ${rank.text}` : 'bg-white/[0.03] border-white/[0.05] text-zinc-500'
                      )}>
                        {rank ? rank.icon : `#${idx + 1}`}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">Citizen {c.id.slice(0, 8)}…</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                          {c.reports} reports · {c.resolved} resolved
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 justify-end">
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-white font-black">{c.upvotes.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">upvotes</span>
                      </div>
                      <div className={cn('text-[10px] font-black uppercase tracking-widest', rank ? rank.text : 'text-zinc-500')}>
                        {c.reports > 0 ? Math.round((c.resolved / c.reports) * 100) : 0}% resolution
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Politicians Tab */}
        {tab === 'politicians' && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {MOCK_POLITICIANS.map((pol, idx) => {
              const rank = RANK_STYLE[idx];
              return (
                <motion.div key={pol.name} variants={item}>
                  <div className={cn(
                    'flex items-center justify-between p-6 rounded-3xl border transition-all hover:scale-[1.01]',
                    rank ? rank.bg : 'border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-900/40'
                  )}>
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        'h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border shrink-0',
                        rank ? `${rank.bg} ${rank.text}` : 'bg-white/[0.03] border-white/[0.05] text-zinc-500'
                      )}>
                        {rank ? rank.icon : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{pol.name}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 truncate">{pol.district}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1 ml-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Award className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-white font-black">{pol.resolutionRate}%</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">resolved</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className={cn('text-[10px] font-black', rank ? rank.text : 'text-zinc-500')}>{pol.rating} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
