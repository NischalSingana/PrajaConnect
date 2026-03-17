import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import { Shield, Flag, CheckCircle, Activity, Search, AlertTriangle, X, Loader2 } from 'lucide-react';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const priorityColor = (level: string) => ({
  'Critical': 'border-red-500/30 bg-red-500/10 text-red-400',
  'Level 2': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  'Level 1': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  'Normal': 'border-white/10 bg-white/5 text-zinc-500',
}[level] ?? 'border-white/10 bg-white/5 text-zinc-500');

export function ModeratorDashboard() {
  const { issues, updateIssueStatus, flagIssue } = useLocalStore();
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [flagModalId, setFlagModalId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  // Focus: escalated + flagged + pending issues = moderation queue
  const queue = issues.filter(i =>
    i.escalationLevel !== 'Normal' || i.flagged || i.status === 'Pending'
  );

  const filtered = search
    ? queue.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
    : queue;

  const pendingFlags = issues.filter(i => i.flagged).length;
  const escalated = issues.filter(i => i.escalationLevel !== 'Normal').length;
  const resolvedToday = issues.filter(i => {
    const d = new Date(i.createdAt);
    const today = new Date();
    return i.status === 'Resolved' && d.toDateString() === today.toDateString();
  }).length;

  const handleForceResolve = async (id: string) => {
    setActionId(id);
    await updateIssueStatus(id, 'Resolved');
    setActionId(null);
  };

  const handleFlagSubmit = async () => {
    if (!flagModalId) return;
    setActionId(flagModalId);
    await flagIssue(flagModalId, true, flagReason);
    setActionId(null);
    setFlagModalId(null);
    setFlagReason('');
  };

  const handleUnflag = async (id: string) => {
    setActionId(id);
    await flagIssue(id, false);
    setActionId(null);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-7xl mx-auto px-4">

      {/* Flag Modal */}
      {flagModalId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#0a0a0c] border border-amber-500/20 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Flag Issue</h3>
              </div>
              <button onClick={() => { setFlagModalId(null); setFlagReason(''); }}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
              Issue: {issues.find(i => i.id === flagModalId)?.title}
            </p>
            <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)}
              placeholder="Reason for flagging (e.g. spam, inappropriate, duplicate)..."
              className="w-full min-h-[100px] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            <button onClick={handleFlagSubmit} disabled={!flagReason.trim() || !!actionId}
              className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              {actionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Flag className="h-4 w-4" /> Submit Flag</>}
            </button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Shield className="h-3 w-3" /> Content Oversight
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Moderator Hub</h1>
            <p className="text-zinc-500 font-medium">Monitoring platform integrity — real-time queue.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Flagged Issues', val: pendingFlags, sub: 'Awaiting review', icon: <Flag className="h-4 w-4 text-red-400" />, accent: 'text-red-400' },
          { label: 'Escalated', val: escalated, sub: 'Above Normal level', icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, accent: 'text-amber-400' },
          { label: 'Resolved Today', val: resolvedToday, sub: 'Platform-wide', icon: <CheckCircle className="h-4 w-4 text-emerald-400" />, accent: 'text-emerald-400' },
          { label: 'Queue Size', val: queue.length, sub: 'Needs attention', icon: <Activity className="h-4 w-4 text-blue-400" />, accent: 'text-blue-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}
            className="p-7 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
              <div className="h-9 w-9 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className={cn('text-3xl font-black', stat.accent)}>{stat.val}</div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Queue Table */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase">Moderation Queue ({filtered.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-11 pr-4 h-11 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/[0.05] overflow-hidden bg-zinc-900/10">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Shield className="h-8 w-8 text-zinc-800" />
              <p className="text-zinc-600 text-sm font-medium">Queue is clear. Good work.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-white/[0.02] text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Escalation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Flag</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(issue => (
                    <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white truncate max-w-[220px] group-hover:text-amber-400 transition-colors">{issue.title}</p>
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{issue.id}</p>
                        {issue.flagReason && <p className="text-[10px] text-red-400 mt-0.5 italic truncate max-w-[200px]">{issue.flagReason}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', priorityColor(issue.escalationLevel))}>
                          {issue.escalationLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                          issue.status === 'Resolved' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
                          issue.status === 'In Progress' ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' :
                          'border-white/10 bg-white/5 text-zinc-500')}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {issue.flagged
                          ? <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-400"><Flag className="h-3 w-3" /> Flagged</span>
                          : <span className="text-[9px] text-zinc-700 uppercase">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {actionId === issue.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400 inline" />
                        ) : (
                          <>
                            {issue.status !== 'Resolved' && (
                              <button onClick={() => handleForceResolve(issue.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-600/20 transition-all">
                                Resolve
                              </button>
                            )}
                            {issue.flagged ? (
                              <button onClick={() => handleUnflag(issue.id)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all">
                                Unflag
                              </button>
                            ) : (
                              <button onClick={() => setFlagModalId(issue.id)}
                                className="px-3 py-1.5 rounded-xl bg-amber-600/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-600/20 transition-all">
                                Flag
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
