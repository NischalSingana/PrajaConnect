import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { SlaBadge } from '../components/ui/SlaBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Filter, TrendingUp, AlertCircle, CheckCircle2, Clock, Loader2, Activity,
  MessageSquare, X, Send, ChevronDown
} from 'lucide-react';
import { IssueStatus } from '../types';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const STATUS_OPTIONS: IssueStatus[] = ['Pending', 'In Progress', 'Resolved', 'Escalated'];

const statusColor = (s: string) => ({
  'Resolved': 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  'In Progress': 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  'Escalated': 'border-red-500/20 bg-red-500/5 text-red-400',
  'Pending': 'border-white/10 bg-white/5 text-zinc-400',
}[s] ?? 'border-white/10 bg-white/5 text-zinc-400');

export function PoliticianDashboard() {
  const { issues, updateIssueStatus, respondToIssue } = useLocalStore();
  const { user } = useUser();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [respondIssueId, setRespondIssueId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const district = (user?.publicMetadata?.district as string) || 'All Constituencies';

  // Real stats from DB issues
  const pending = issues.filter(i => i.status === 'Pending').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const escalated = issues.filter(i => i.status === 'Escalated').length;
  const total = issues.length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const transparencyScore = Math.min(100, resolutionRate + Math.min(20, issues.filter(i => i.response).length));

  // Monthly chart data (last 6 months) from real issues
  const chartData = useMemo(() => {
    const months: Record<string, { reported: number; resolved: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      months[key] = { reported: 0, resolved: 0 };
    }
    issues.forEach(iss => {
      const key = new Date(iss.createdAt).toLocaleString('default', { month: 'short' });
      if (months[key]) {
        months[key].reported++;
        if (iss.status === 'Resolved') months[key].resolved++;
      }
    });
    return Object.entries(months).map(([name, v]) => ({ name, ...v }));
  }, [issues]);

  const filtered = filterStatus === 'All' ? issues : issues.filter(i => i.status === filterStatus);

  const handleStatusChange = async (id: string, status: IssueStatus) => {
    setUpdatingId(id);
    await updateIssueStatus(id, status);
    setUpdatingId(null);
  };

  const handleRespond = async () => {
    if (!respondIssueId || !responseText.trim()) return;
    setSubmitting(true);
    const ok = await respondToIssue(respondIssueId, responseText.trim());
    setSubmitting(false);
    if (ok) { setRespondIssueId(null); setResponseText(''); }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-7xl mx-auto px-4">
      {/* Respond Modal */}
      {respondIssueId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Post Official Response</h3>
              <button onClick={() => { setRespondIssueId(null); setResponseText(''); }}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest">
              Issue: {issues.find(i => i.id === respondIssueId)?.title}
            </p>
            <textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="Write your official update or response here..."
              className="w-full min-h-[120px] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 leading-relaxed"
            />
            <button onClick={handleRespond} disabled={submitting || !responseText.trim()}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Response</>}
            </button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" /> Constituency Manager
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Politician Command Centre</h1>
            <p className="text-zinc-500 font-medium">{district} — Real-time civic issue management</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {['All', 'Pending', 'In Progress', 'Escalated'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  filterStatus === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/20')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Transparency Score', val: `${transparencyScore}%`, sub: 'Platform Rating', icon: <Activity className="h-5 w-5 text-indigo-400" /> },
          { label: 'Resolution Rate', val: `${resolutionRate}%`, sub: `${resolved} of ${total} resolved`, icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
          { label: 'Pending Issues', val: pending, sub: `${escalated} escalated`, icon: <AlertCircle className="h-5 w-5 text-red-400" /> },
          { label: 'In Progress', val: inProgress, sub: 'Active now', icon: <Clock className="h-5 w-5 text-amber-400" /> },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}
            className="p-7 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
              <div className="h-9 w-9 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stat.val}</div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div variants={item} className="p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20">
        <div className="mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">Resolution Trend</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Monthly reported vs resolved — real data</p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="name" stroke="#444" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
              <YAxis stroke="#444" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'white', opacity: 0.02 }}
                contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #222', borderRadius: '14px', fontSize: '11px' }} />
              <Bar dataKey="reported" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} name="Reported" />
              <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Issues Table */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-400" /> {filterStatus === 'All' ? 'All' : filterStatus} Issues
            <span className="text-zinc-600 text-sm font-medium">({filtered.length})</span>
          </h2>
        </div>

        <div className="rounded-[2rem] border border-white/[0.05] overflow-hidden bg-zinc-900/10">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-zinc-800" />
              <p className="text-zinc-600 text-sm font-medium">No issues in this category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-white/[0.02] text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">SLA</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(issue => (
                    <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[250px]">{issue.title}</p>
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{issue.id}</p>
                        {issue.response && (
                          <p className="text-[10px] text-indigo-400 mt-1 italic truncate max-w-[240px]">✓ Response posted</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {issue.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Status Dropdown */}
                        <div className="relative inline-block">
                          {updatingId === issue.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                          ) : (
                            <select
                              value={issue.status}
                              onChange={e => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                              className={cn('pl-3 pr-7 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border cursor-pointer appearance-none bg-transparent',
                                statusColor(issue.status))}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>)}
                            </select>
                          )}
                          {updatingId !== issue.id && <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-zinc-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setRespondIssueId(issue.id); setResponseText(issue.response || ''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/20 transition-all">
                          <MessageSquare className="h-3 w-3" /> {issue.response ? 'Edit Reply' : 'Respond'}
                        </button>
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
