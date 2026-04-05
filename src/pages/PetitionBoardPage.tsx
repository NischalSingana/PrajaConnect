import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { FileText, ThumbsUp, TrendingUp, Filter, Activity, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

type SortKey = 'upvotes' | 'progress' | 'newest';

export function PetitionBoardPage() {
  const { issues, isLoading, upvoteIssue } = useStore();
  const { isSignedIn } = useAuth();
  const [sort, setSort] = useState<SortKey>('upvotes');
  const [category, setCategory] = useState('All');
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signed, setSigned] = useState<Set<string>>(new Set());

  const petitions = issues.filter(i => i.isPetition);
  const categories = ['All', ...Array.from(new Set(petitions.map(p => p.category)))];

  const filtered = petitions
    .filter(p => category === 'All' || p.category === category)
    .sort((a, b) => {
      if (sort === 'upvotes') return b.upvotes - a.upvotes;
      if (sort === 'progress') {
        const pa = a.petitionTarget ? a.upvotes / a.petitionTarget : 0;
        const pb = b.petitionTarget ? b.upvotes / b.petitionTarget : 0;
        return pb - pa;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSign = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn || signed.has(id)) return;
    setSigningId(id);
    await upvoteIssue(id);
    setSigned(prev => new Set([...prev, id]));
    setSigningId(null);
  };

  const statusColor: Record<string, string> = {
    Resolved: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    'In Progress': 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    Pending: 'text-zinc-400 border-white/10 bg-white/[0.03]',
    Escalated: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText className="h-3 w-3" /> Civic Petitions
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Petition Board</h1>
          <p className="text-zinc-500 font-medium max-w-2xl">
            Sign and track petitions demanding systemic change. Every signature helps hold local authorities accountable.
          </p>
          <div className="flex items-center gap-6 pt-2 text-[10px] font-black uppercase tracking-widest flex-wrap">
            <span className="text-indigo-400">{petitions.length} total petitions</span>
            <span className="text-emerald-400">{petitions.filter(p => p.status === 'Resolved').length} resolved</span>
            <span className="text-amber-400">{petitions.filter(p => p.status === 'In Progress').length} in progress</span>
            <span className="text-zinc-500">{petitions.reduce((s, p) => s + p.upvotes, 0).toLocaleString()} total signatures</span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {(['upvotes', 'progress', 'newest'] as SortKey[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                    sort === s
                      ? 'bg-white text-black border-white'
                      : 'border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10'
                  )}
                >
                  {s === 'upvotes' ? 'Most Signed' : s === 'progress' ? 'Closest to Goal' : 'Newest'}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all',
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'border-white/[0.05] text-zinc-600 hover:text-zinc-300 hover:border-white/10'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Petition Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Activity className="h-8 w-8 text-indigo-500" />
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3"
          >
            <FileText className="h-12 w-12 text-zinc-800" />
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">No petitions found</p>
            <p className="text-zinc-700 text-xs text-center max-w-xs">No issues have been marked as petitions yet. Report an issue and mark it as a petition to start one.</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {filtered.map(petition => {
              const target = petition.petitionTarget ?? 1000;
              const pct = Math.min((petition.upvotes / target) * 100, 100);
              const achieved = pct >= 100;
              const hasSigned = signed.has(petition.id);
              const isSigning = signingId === petition.id;
              return (
                <motion.div key={petition.id} variants={item}>
                  <Link to={`/issues/${petition.id}`} className="block group">
                    <div className="p-8 rounded-[2rem] border border-white/[0.04] bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-indigo-500/20 transition-all space-y-6">

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', statusColor[petition.status])}>
                              {petition.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-500">
                              {petition.category}
                            </span>
                            {achieved && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Goal Reached
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                            {petition.title}
                          </h3>
                          <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2">
                            {petition.description}
                          </p>
                        </div>

                        {/* Sign button */}
                        {petition.status !== 'Resolved' && (
                          <button
                            onClick={(e) => handleSign(petition.id, e)}
                            disabled={!isSignedIn || hasSigned || isSigning}
                            className={cn(
                              'shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border transition-all',
                              hasSigned
                                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 cursor-default'
                                : !isSignedIn
                                ? 'border-white/[0.05] bg-white/[0.02] text-zinc-600 cursor-not-allowed'
                                : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:scale-105 active:scale-95'
                            )}
                          >
                            {hasSigned ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <ThumbsUp className={cn('h-5 w-5', isSigning && 'animate-bounce')} />
                            )}
                            <span className="text-2xl font-black">{petition.upvotes.toLocaleString()}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                              {hasSigned ? 'Signed' : 'Sign'}
                            </span>
                          </button>
                        )}

                        {petition.status === 'Resolved' && (
                          <div className="shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-2xl font-black">{petition.upvotes.toLocaleString()}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Signatures</span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className={achieved ? 'text-emerald-400' : 'text-zinc-500'}>
                            {achieved ? 'Goal reached!' : `${Math.round(pct)}% of goal`}
                          </span>
                          <span className="text-zinc-600">{target.toLocaleString()} target</span>
                        </div>
                        <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', achieved ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-600 to-blue-500')}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-zinc-700" />{petition.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-zinc-700" />
                          {new Date(petition.createdAt).toLocaleDateString()}
                        </span>
                        {!isSignedIn && (
                          <span className="ml-auto text-zinc-700">Sign in to support this petition</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
