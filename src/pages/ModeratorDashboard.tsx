import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import { Shield, Flag, CheckCircle, Activity, Search, AlertTriangle, X, Loader2, PlayCircle, ShieldBan, Bot, Zap } from 'lucide-react';

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
  
  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Focus: escalated + flagged + pending issues = moderation queue
  const queue = issues.filter(i => i.escalationLevel !== 'Normal' || i.flagged || i.status === 'Pending');

  const filtered = search
    ? queue.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
    : queue;

  const pendingFlags = issues.filter(i => i.flagged).length;
  const escalated = issues.filter(i => i.escalationLevel !== 'Normal').length;
  const resolvedToday = issues.filter(i => i.status === 'Resolved' && new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  const handleForceResolve = async (id: string) => {
    setActionId(id);
    await updateIssueStatus(id, 'Resolved');
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkResolve = () => {
    setIsBulkProcessing(true);
    setTimeout(() => {
      selectedIds.forEach(id => updateIssueStatus(id, 'Resolved'));
      setSelectedIds(new Set());
      setIsBulkProcessing(false);
    }, 1500);
  };

  // Mock toxicity score generator logic based on title length or keywords
  const getToxicityScore = (title: string, flagged: boolean) => {
    const score = Math.min(99, Math.max(1, (title.length % 30) * 3 + (flagged ? 40 : 0)));
    if (score > 80) return { score, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    if (score > 50) return { score, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { score, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-40 pt-6 max-w-7xl mx-auto px-4 relative">

      {/* Flag Modal */}
      <AnimatePresence>
        {flagModalId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setFlagModalId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/20 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                     <ShieldBan className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Censor Report</h3>
                </div>
                <button onClick={() => { setFlagModalId(null); setFlagReason(''); }}
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>

              <div className="relative z-10 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 border-b border-white/[0.05] pb-2">Target Payload</p>
                <p className="text-sm font-medium text-white truncate">{issues.find(i => i.id === flagModalId)?.title}</p>
              </div>

              <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (e.g. spam, inappropriate, duplicate)..."
                className="relative z-10 w-full min-h-[120px] mb-6 rounded-2xl border border-white/[0.06] bg-black/50 px-5 py-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner leading-relaxed" />
                
              <button onClick={handleFlagSubmit} disabled={!flagReason.trim() || !!actionId}
                className="relative z-10 w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                {actionId ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Flag className="h-4 w-4" /> Finalize Flag</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", bounce: 0.3 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-4 rounded-3xl bg-zinc-950 border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl">
             <div className="flex items-center gap-3 pr-6 border-r border-white/10">
               <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                 {selectedIds.size}
               </div>
               <div>
                  <h4 className="text-white font-bold text-sm">Targets Locked</h4>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Awaiting Directive</p>
               </div>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={handleBulkResolve} disabled={isBulkProcessing}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all flex items-center gap-2">
                  {isBulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Mass Resolve
                </button>
                <button onClick={() => setSelectedIds(new Set())}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={item} className="relative p-10 lg:p-12 rounded-[2.5rem] bg-zinc-950 border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-600/10 blur-[100px] rounded-full -ml-20 -mt-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Shield className="h-3 w-3" /> Security & Trust Online
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Overwatch</span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-md leading-relaxed text-sm">Real-time content moderation matrix. Securing platform integrity and civility.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Live Traffic Socket Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Flagged Anomalies', val: pendingFlags, sub: 'Needs triage', icon: <Flag className="h-5 w-5 text-red-500" />, accent: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
          { label: 'Escalation Tier', val: escalated, sub: 'Elevated stress', icon: <AlertTriangle className="h-5 w-5 text-orange-400" />, accent: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' },
          { label: 'Threats Neutralized', val: resolvedToday, sub: '24hr rolling window', icon: <CheckCircle className="h-5 w-5 text-emerald-400" />, accent: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
          { label: 'Active Queue Load', val: queue.length, sub: 'Pending operations', icon: <Activity className="h-5 w-5 text-blue-400" />, accent: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}
            className={cn("p-8 rounded-[2rem] border border-white/[0.05] bg-zinc-950 hover:bg-zinc-900 transition-all group relative overflow-hidden", stat.glow)}>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
              <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className={cn('text-4xl font-black relative z-10', stat.accent)}>{stat.val}</div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 relative z-10">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Command Ledger */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Live Stream Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center gap-2 px-2">
             <PlayCircle className="h-4 w-4 text-zinc-500 animate-pulse" />
             <h2 className="text-xs font-black text-zinc-500 tracking-[0.15em] uppercase">Live Surveillance</h2>
           </div>
           <div className="rounded-[2.5rem] border border-white/[0.05] bg-zinc-950 p-4 h-[600px] overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
              <div className="space-y-3 h-full overflow-y-auto no-scrollbar pt-6 pb-6">
                <AnimatePresence>
                  {issues.slice(0, 8).map((issue, idx) => (
                    <motion.div key={issue.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-zinc-600">{new Date(issue.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                        {issue.flagged && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                      </div>
                      <p className="text-xs font-bold text-zinc-300 line-clamp-2">{issue.title}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />
           </div>
        </div>

        {/* Action Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase">Triage Queue ({filtered.length})</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search database..."
                className="w-full pl-11 pr-4 h-12 rounded-2xl border border-white/[0.06] bg-zinc-950 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-shadow shadow-inner" />
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/[0.05] overflow-hidden bg-zinc-950 shadow-2xl">
            {filtered.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg tracking-tight mb-1">Queue is clear.</p>
                  <p className="text-zinc-600 text-sm font-medium">Platform systems are secure and civil.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse whitespace-nowrap xl:whitespace-normal">
                  <thead className="bg-[#0f0f13] text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">
                    <tr>
                      <th className="w-12 px-6 py-5">
                         <div className="h-4 w-4 rounded border border-zinc-600 flex items-center justify-center cursor-pointer"
                           onClick={() => setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(i => i.id)))}>
                           {selectedIds.size === filtered.length && <CheckCircle className="h-3 w-3 text-indigo-400" />}
                           {selectedIds.size > 0 && selectedIds.size < filtered.length && <div className="h-2 w-2 rounded-sm bg-indigo-400" />}
                         </div>
                      </th>
                      <th className="px-6 py-5">Content Target</th>
                      <th className="px-6 py-5">AI Context</th>
                      <th className="px-6 py-5">Severity</th>
                      <th className="px-6 py-5 text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filtered.map(issue => {
                      const tox = getToxicityScore(issue.title, issue.flagged || false);
                      return (
                      <tr key={issue.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(issue.id) && "bg-indigo-500/5")}>
                        <td className="px-6 py-4">
                           <div className="h-4 w-4 rounded border border-white/20 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors"
                             onClick={() => toggleSelect(issue.id)}>
                             {selectedIds.has(issue.id) && <CheckCircle className="h-3 w-3 text-indigo-400" />}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 max-w-[280px]">{issue.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {issue.flagReason && <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-500/20 text-red-400 font-bold uppercase tracking-widest">{issue.flagReason}</span>}
                            <span className="text-[9px] text-zinc-600 font-mono">ID: {issue.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className={cn("px-2 py-1 flex items-center gap-1 rounded-md border text-[9px] font-black uppercase tracking-widest", tox.bg, tox.color)}>
                               <Bot className="h-3 w-3" /> Risk: {tox.score}%
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', priorityColor(issue.escalationLevel))}>
                            {issue.escalationLevel === 'Normal' ? 'T1-Reg' : issue.escalationLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {actionId === issue.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-amber-400 inline" />
                          ) : (
                            <>
                              {issue.status !== 'Resolved' && (
                                <button onClick={() => handleForceResolve(issue.id)}
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                  <Zap className="h-4 w-4" />
                                </button>
                              )}
                              {issue.flagged ? (
                                <button onClick={() => handleUnflag(issue.id)}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all">
                                  Unflag
                                </button>
                              ) : (
                                <button onClick={() => setFlagModalId(issue.id)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-600/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-600/20 animate-pulse hover:animate-none transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                  Flag Target
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
