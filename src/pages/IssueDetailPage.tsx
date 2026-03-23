import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, MapPin, Clock, Tag, AlertTriangle, ThumbsUp, MessageCircle,
  Activity, CheckCircle2, Flag, User, Calendar, BarChart2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, upvoteIssue } = useLocalStore();
  const { isSignedIn } = useAuth();
  const [upvoting, setUpvoting] = useState(false);

  const issue = issues.find(i => i.id === id);

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6 px-4">
        <div className="p-10 rounded-3xl border border-white/5 bg-zinc-900/20 text-center space-y-4 max-w-sm w-full">
          <AlertTriangle className="h-12 w-12 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-black text-white">Issue Not Found</h2>
          <p className="text-zinc-500 text-sm font-medium">This issue may have been removed or the ID is invalid.</p>
          <button onClick={() => navigate(-1)} className="mt-2 px-6 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    Resolved: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    'In Progress': 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    Pending: 'text-zinc-400 border-white/10 bg-white/5',
    Escalated: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  const priorityColor: Record<string, string> = {
    Critical: 'text-red-400 bg-red-500/5 border-red-500/20',
    High: 'text-orange-400 bg-orange-500/5 border-orange-500/20',
    Medium: 'text-amber-400 bg-amber-500/5 border-amber-500/20',
    Low: 'text-zinc-400 bg-white/5 border-white/10',
  };

  const escalationColor: Record<string, string> = {
    Normal: 'text-emerald-400',
    'Level 1': 'text-amber-400',
    'Level 2': 'text-orange-400',
    Critical: 'text-red-500',
  };

  const timeline = [
    { label: 'Reported', date: issue.createdAt, icon: <Flag className="h-3 w-3" />, active: true },
    { label: 'Under Review', icon: <Activity className="h-3 w-3" />, active: issue.status !== 'Pending' },
    { label: 'In Progress', icon: <BarChart2 className="h-3 w-3" />, active: issue.status === 'In Progress' || issue.status === 'Resolved' },
    { label: 'Resolved', date: issue.resolvedAt ?? null, icon: <CheckCircle2 className="h-3 w-3" />, active: issue.status === 'Resolved' },
  ];

  const related = issues.filter(i => i.category === issue.category && i.id !== issue.id).slice(0, 3);

  const handleUpvote = async () => {
    if (!isSignedIn || upvoting) return;
    setUpvoting(true);
    await upvoteIssue(issue.id);
    setUpvoting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">

        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 sm:p-12 rounded-[2.5rem] border border-white/[0.04] bg-[#050505] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', statusColor[issue.status])}>
                {issue.status}
              </span>
              <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', priorityColor[issue.priority])}>
                {issue.priority} Priority
              </span>
              {issue.isPetition && (
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                  Petition
                </span>
              )}
              {issue.flagged && (
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/5 text-red-400">
                  Flagged
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">{issue.title}</h1>
            <p className="text-zinc-400 text-base leading-relaxed font-medium">{issue.description}</p>
            <div className="flex flex-wrap gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-400" />{issue.location}</span>
              <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-blue-400" />{issue.category}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(issue.createdAt).toLocaleDateString()}</span>
              <span className="text-zinc-700">Node·{issue.id.slice(0, 8)}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {issue.imageUrl && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full rounded-3xl object-cover max-h-80 border border-white/[0.04]"
              />
            )}

            {issue.isPetition && issue.petitionTarget && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-3xl border border-indigo-500/10 bg-indigo-500/[0.03] space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Petition Progress</h3>
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    {issue.upvotes} / {issue.petitionTarget} signatures
                  </span>
                </div>
                <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((issue.upvotes / issue.petitionTarget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  {Math.round((issue.upvotes / issue.petitionTarget) * 100)}% of goal reached
                </p>
              </motion.div>
            )}

            {issue.response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-8 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Official Response</h3>
                </div>
                <p className="text-zinc-300 text-sm font-medium leading-relaxed">{issue.response}</p>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl border border-white/[0.05] bg-zinc-900/20 space-y-6"
            >
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Issue Timeline</h3>
              <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-indigo-600 before:to-transparent">
                {timeline.map((step, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      'absolute -left-[27px] top-0.5 p-1.5 rounded-full border z-10',
                      step.active ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900 border-white/10'
                    )}>
                      <span className={step.active ? 'text-white' : 'text-zinc-600'}>{step.icon}</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className={cn('text-[10px] font-black uppercase tracking-widest', step.active ? 'text-white' : 'text-zinc-600')}>
                        {step.label}
                      </p>
                      {'date' in step && step.date && (
                        <p className="text-[9px] font-bold text-zinc-600">{new Date(step.date).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Actions */}
            <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</h3>
              <button
                onClick={handleUpvote}
                disabled={!isSignedIn || upvoting}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border font-black text-sm uppercase tracking-widest transition-all',
                  isSignedIn
                    ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:scale-[1.02] active:scale-95'
                    : 'border-white/5 bg-white/[0.02] text-zinc-600 cursor-not-allowed'
                )}
              >
                <ThumbsUp className={cn('h-4 w-4', upvoting && 'animate-bounce')} />
                {issue.upvotes} Upvotes
              </button>
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                <MessageCircle className="h-4 w-4 text-zinc-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{issue.commentsCount} Comments</span>
              </div>
            </div>

            {/* Meta */}
            <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">SLA</span>
                  </div>
                  <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Escalation</span>
                  </div>
                  <span className={cn('text-[10px] font-black uppercase tracking-widest', escalationColor[issue.escalationLevel])}>
                    {issue.escalationLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Reporter</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">{issue.reporterId.slice(0, 10)}…</span>
                </div>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Same Category</h3>
                <div className="space-y-3">
                  {related.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/issues/${rel.id}`}
                      className="block text-[11px] font-bold text-zinc-400 hover:text-white transition-colors truncate py-1.5 border-b border-white/[0.03] last:border-0"
                    >
                      {rel.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
