import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { SlaBadge } from '../components/ui/SlaBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, CheckCircle2, Loader2, Activity,
  MessageSquare, X, Send, ChevronDown, Sparkles, Flame, ThumbsUp, ShieldAlert
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
  const [aiGenerating, setAiGenerating] = useState(false);

  const district = (user?.publicMetadata?.district as string) || 'All Constituencies';

  const pending = issues.filter(i => i.status === 'Pending').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const escalated = issues.filter(i => i.status === 'Escalated').length;
  const total = issues.length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  const urgentIssues = issues.filter(i => i.status !== 'Resolved' && i.escalationLevel !== 'Normal').slice(0, 4);

  // Mock Sentiment derived from issues
  const sentiment = useMemo(() => {
    const positiveMock = resolved * 2 + issues.filter(i => i.upvotes > 5).length;
    const negMock = escalated * 3 + pending;
    const totalSent = Math.max(1, positiveMock + negMock);
    return Math.round((positiveMock / totalSent) * 100);
  }, [resolved, escalated, pending, issues]);

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

  const simulateAIPolish = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setResponseText("Thank you for bringing this to my attention. My team has officially acknowledged the situation and we are currently working with local authorities to ensure a swift and comprehensive resolution. We are committed to maintaining the highest standards for our community and appreciate your active citizenship.");
      setAiGenerating(false);
    }, 1500);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-7xl mx-auto px-4">
      {/* Smart Respond Modal */}
      <AnimatePresence>
        {respondIssueId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setRespondIssueId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-indigo-500/20 rounded-[2rem] p-8 space-y-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Official Response</h3>
                </div>
                <button onClick={() => { setRespondIssueId(null); setResponseText(''); }}
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>

              <div className="relative z-10 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 border-b border-white/[0.05] pb-2">Target Issue</p>
                <p className="text-sm font-medium text-white truncate">{issues.find(i => i.id === respondIssueId)?.title}</p>
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Your Message</label>
                  <button onClick={simulateAIPolish} disabled={aiGenerating || responseText.length > 0} 
                    className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 uppercase tracking-widest font-black transition-colors disabled:opacity-50">
                    {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <Sparkles className="h-3 w-3 inline" />}
                    Generate Smart Reply
                  </button>
                </div>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Type your official administrative update here..."
                  className="w-full min-h-[160px] rounded-2xl border border-white/[0.06] bg-black/50 px-5 py-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed shadow-inner"
                />
              </div>

              <div className="relative z-10 pt-2">
                <button onClick={handleRespond} disabled={submitting || !responseText.trim() || aiGenerating}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Broadcast Update</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div variants={item} className="relative p-10 lg:p-12 rounded-[2.5rem] bg-zinc-950 border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -mr-20 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <TrendingUp className="h-3 w-3" /> Area Authority Online
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Constituency <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Command Center</span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-md leading-relaxed text-sm">Overseeing {district}. Real-time analytics and direct citizen engagement portal.</p>
          </div>
          <div className="flex bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-2xl shadow-inner backdrop-blur-sm self-start md:self-auto">
            {['All', 'Pending', 'In Progress', 'Escalated'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn('px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                  filterStatus === s ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Core Insights & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Issues Feed - Live action */}
        <motion.div variants={item} className="lg:col-span-1 p-8 rounded-[2.5rem] bg-zinc-950 border border-red-500/10 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Flame className="h-5 w-5 text-red-500" /> Critical Escapes
             </h3>
             <span className="flex h-5 w-5 bg-red-500/10 rounded-full items-center justify-center">
               <span className="h-2 w-2 rounded-full bg-red-500 animate-ping absolute" />
               <span className="h-2 w-2 rounded-full bg-red-500" />
             </span>
          </div>
          <div className="space-y-4">
            {urgentIssues.length > 0 ? urgentIssues.map(issue => (
              <div key={issue.id} className="p-4 rounded-2xl bg-white/[0.02] border border-red-500/10 hover:border-red-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-red-400 bg-red-500/10">Priority Override</span>
                  <span className="text-[10px] text-zinc-500 font-mono">#{issue.id.slice(0, 5)}</span>
                </div>
                <p className="text-sm font-bold text-white mb-2 leading-snug">{issue.title}</p>
                <button onClick={() => { setRespondIssueId(issue.id); setResponseText(issue.response || ''); }} 
                   className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">
                   Intercept & Respond →
                </button>
              </div>
            )) : (
               <div className="h-40 flex flex-col items-center justify-center text-center opacity-60">
                 <ShieldAlert className="h-8 w-8 text-zinc-600 mb-2" />
                 <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Zero Critical Threats</p>
               </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Analytics area */}
        <motion.div variants={item} className="lg:col-span-2 grid gap-6 grid-cols-2">
           {/* Sentiment Analyzer */}
           <div className="col-span-2 sm:col-span-1 p-8 rounded-[2.5rem] bg-zinc-950 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Activity className="h-24 w-24" /></div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Constituency Sentiment</p>
              <h2 className="text-4xl font-black text-white tracking-tight mb-6">{sentiment}% <span className="text-lg text-emerald-400">+</span></h2>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-emerald-400 flex items-center gap-1"><ThumbsUp className="h-3 w-3"/> Positive</span>
                  <span className="text-rose-400">Negative Focus</span>
                </div>
                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden flex">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${sentiment}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100-sentiment}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-rose-500" />
                </div>
                <p className="text-[10px] text-zinc-600 pt-2 leading-relaxed">AI analysis indicates a highly supportive community reaction based on your recent conflict resolutions.</p>
              </div>
           </div>

           {/* Metrics Grid inside */}
           <div className="col-span-2 sm:col-span-1 grid grid-rows-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/10 flex flex-col justify-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Clearance Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{resolutionRate}%</span>
                  <span className="text-xs font-bold text-zinc-500">Vol. {total}</span>
                </div>
              </div>
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-900/10 to-transparent border border-amber-500/10 flex flex-col justify-center">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">Active Engagements</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{inProgress}</span>
                  <span className="text-xs font-bold text-zinc-500">In Progress</span>
                </div>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Wide Graph */}
      <motion.div variants={item} className="p-8 lg:p-10 rounded-[2.5rem] bg-zinc-950 border border-white/[0.05] shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-600/5 blur-[80px]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Resolution Efficiency</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">Cross-referencing reported issues vs closed dockets</p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-xl mt-4 sm:mt-0">
            System Nominal
          </div>
        </div>
        <div className="h-[320px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="name" stroke="#666" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#666" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} dx={-8} />
              <RechartsTooltip 
                cursor={{ fill: 'white', opacity: 0.02 }}
                contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #1f1f22', borderRadius: '14px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              />
              <Bar dataKey="reported" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={16} name="Newly Reported" />
              <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} barSize={16} name="Successfully Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Main Command Ledger */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase px-2">Official Queue Directory</h2>
        <div className="rounded-[2.5rem] border border-white/[0.05] overflow-hidden bg-zinc-950 shadow-2xl">
          {filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-zinc-600" />
              </div>
              <div>
                <p className="text-white font-bold text-lg tracking-tight mb-1">Queue cleared.</p>
                <p className="text-zinc-600 text-sm font-medium">No pressing matters in this category.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse whitespace-nowrap lg:whitespace-normal">
                <thead className="bg-[#0f0f13] text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">
                  <tr>
                    <th className="px-8 py-5">Case File</th>
                    <th className="px-8 py-5">Category & Meta</th>
                    <th className="px-8 py-5">Platform Status</th>
                    <th className="px-8 py-5">Time Compliance</th>
                    <th className="px-8 py-5 text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map(issue => (
                    <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/5 flex items-center justify-center font-black text-[10px] text-indigo-400">
                             {/* @ts-expect-error backend dynamically returns authorName in some queries */}
                             {issue.authorName?.charAt(0) || 'U'}
                           </div>
                           <div>
                             <p className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 max-w-[280px]">{issue.title}</p>
                             {issue.response ? (
                               <p className="text-[10px] text-emerald-400 mt-1 font-bold uppercase tracking-widest">✓ Response Issued</p>
                             ) : (
                               <p className="text-[10px] text-zinc-600 font-mono mt-1">ID: {issue.id}</p>
                             )}
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/[0.08] text-[9px] font-black uppercase tracking-[0.15em] text-zinc-300">
                          {issue.category}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="relative inline-block min-w-[140px]">
                          {updatingId === issue.id ? (
                            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest"><Loader2 className="h-3 w-3 animate-spin"/> Syncing...</div>
                          ) : (
                            <select
                              value={issue.status}
                              onChange={e => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                              className={cn('w-full pl-4 pr-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors cursor-pointer appearance-none bg-transparent',
                                statusColor(issue.status))}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>)}
                            </select>
                          )}
                          {updatingId !== issue.id && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => { setRespondIssueId(issue.id); setResponseText(issue.response || ''); }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 border justify-center border-indigo-400/50 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:bg-indigo-500 transition-all">
                          {issue.response ? 'Update Reply' : 'Issue Reply'}
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
