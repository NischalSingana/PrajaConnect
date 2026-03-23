import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, ThumbsUp, MessageCircle, Filter, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlaBadge } from '@/components/ui/SlaBadge';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

type SortKey = 'newest' | 'upvotes' | 'status';

const STATUS_COLOR: Record<string, string> = {
  Resolved:     'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  'In Progress':'text-amber-400  border-amber-500/20  bg-amber-500/5',
  Pending:      'text-zinc-400   border-white/10      bg-white/[0.03]',
  Escalated:    'text-red-400    border-red-500/20    bg-red-500/5',
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: 'bg-red-500',
  High:     'bg-orange-500',
  Medium:   'bg-amber-500',
  Low:      'bg-zinc-600',
};

const STATUS_ORDER: Record<string, number> = { Escalated: 0, Pending: 1, 'In Progress': 2, Resolved: 3 };

export function MyIssuesPage() {
  const { issues } = useLocalStore();
  const { user } = useUser();
  const [sort, setSort] = useState<SortKey>('newest');
  const [statusFilter, setStatusFilter] = useState('All');

  const myIssues = issues.filter(i => i.reporterId === user?.id);

  const statuses = ['All', ...Array.from(new Set(myIssues.map(i => i.status)))];

  const filtered = myIssues
    .filter(i => statusFilter === 'All' || i.status === statusFilter)
    .sort((a, b) => {
      if (sort === 'upvotes') return b.upvotes - a.upvotes;
      if (sort === 'status')  return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const summary = {
    total:      myIssues.length,
    resolved:   myIssues.filter(i => i.status === 'Resolved').length,
    inProgress: myIssues.filter(i => i.status === 'In Progress').length,
    escalated:  myIssues.filter(i => i.status === 'Escalated').length,
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-10 pb-32 pt-6 px-4">

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] border border-white/[0.04] bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText className="h-3 w-3" /> My Reports
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Issues</h1>
          <p className="text-zinc-500 font-medium">All civic issues you have reported.</p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: summary.total,      color: 'text-white' },
          { label: 'Resolved',    value: summary.resolved,   color: 'text-emerald-400' },
          { label: 'In Progress', value: summary.inProgress, color: 'text-amber-400' },
          { label: 'Escalated',   value: summary.escalated,  color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <motion.div key={label} variants={item}>
            <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20">
              <div className={cn('text-3xl font-black', color)}>{value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">{label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          {(['newest', 'upvotes', 'status'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                sort === s ? 'bg-white text-black border-white' : 'border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10'
              )}
            >
              {s === 'newest' ? 'Newest' : s === 'upvotes' ? 'Most Upvoted' : 'By Status'}
            </button>
          ))}
        </div>
        {statuses.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all',
                  statusFilter === s
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'border-white/[0.05] text-zinc-600 hover:text-zinc-300'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Issue list */}
      {myIssues.length === 0 ? (
        <motion.div variants={item}
          className="py-24 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3"
        >
          <FileText className="h-12 w-12 text-zinc-800" />
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">You haven't reported any issues yet</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item}
          className="py-16 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3"
        >
          <Activity className="h-10 w-10 text-zinc-800" />
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">No issues match this filter</p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="space-y-4">
          {filtered.map(issue => (
            <motion.div key={issue.id} variants={item}>
              <Link to={`/issues/${issue.id}`} className="block group">
                <div className="p-7 rounded-[2rem] border border-white/[0.04] bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-indigo-500/10 transition-all space-y-5">

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', STATUS_COLOR[issue.status])}>
                          {issue.status}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[issue.priority])} />
                          {issue.priority}
                        </span>
                        {issue.isPetition && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                            Petition
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-snug truncate">
                        {issue.title}
                      </h3>
                      <p className="text-zinc-500 text-sm font-medium line-clamp-1">{issue.description}</p>
                    </div>
                    <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                  </div>

                  <div className="flex items-center gap-5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-700" />{issue.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="h-3 w-3 text-zinc-700" />{issue.upvotes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-3 w-3 text-zinc-700" />{issue.commentsCount}
                    </span>
                    <span className="flex items-center gap-1.5 ml-auto">
                      <Clock className="h-3 w-3 text-zinc-700" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
