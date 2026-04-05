import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SlaBadge } from '@/components/ui/SlaBadge';
import {
  Plus, Search, X, Filter, Activity, Clock, ThumbsUp, MapPin,
  CheckCircle2, AlertTriangle, FileDown, Trash2, ExternalLink,
  FileText, SortAsc, SortDesc
} from 'lucide-react';
import { ReportIssueModal } from '@/components/issues/ReportIssueModal';
import type { Issue } from '@/types';

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'];
const CATEGORIES = ['All', 'Infrastructure', 'Sanitation', 'Safety', 'Electricity', 'Water', 'Roads', 'Environment', 'General'];
const SORTS = [
  { id: 'newest', label: 'Newest', icon: <SortDesc className="h-3 w-3" /> },
  { id: 'oldest', label: 'Oldest', icon: <SortAsc className="h-3 w-3" /> },
  { id: 'upvotes', label: 'Most Upvoted', icon: <ThumbsUp className="h-3 w-3" /> },
];

const STATUS_STYLES: Record<string, string> = {
  Resolved:      'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  'In Progress': 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  Pending:       'border-white/10 bg-white/5 text-zinc-500',
  Escalated:     'border-red-500/20 bg-red-500/5 text-red-400',
};

const cardV: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function IssueCard({ issue, onDelete }: { issue: Issue; onDelete: (id: string) => void }) {
  const st = STATUS_STYLES[issue.status] ?? STATUS_STYLES.Pending;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(res => setTimeout(res, 300));
    onDelete(issue.id);
  };

  return (
    <motion.div variants={cardV} initial="hidden" animate="show" exit="exit" layout>
      <div className={cn(
        'group relative p-6 rounded-[1.75rem] border transition-all duration-300',
        'border-white/[0.04] bg-zinc-900/10 hover:border-indigo-500/15 hover:bg-zinc-900/25'
      )}>
        {/* Status bar top */}
        <div className={cn(
          'absolute top-0 left-6 right-6 h-0.5 rounded-b-full',
          issue.status === 'Resolved' ? 'bg-emerald-500/40' :
          issue.status === 'In Progress' ? 'bg-amber-500/40' :
          issue.status === 'Escalated' ? 'bg-red-500/40' : 'bg-transparent'
        )} />

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border', st)}>
                {issue.status}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-600">
                {issue.category || 'General'}
              </span>
              {issue.isPetition && (
                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" /> Petition
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">
              {issue.title}
            </h3>

            {/* Description */}
            {issue.description && (
              <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{issue.description}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-700">
              {issue.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{issue.location}</span>}
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(issue.createdAt)}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{issue.upvotes} upvotes</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="shrink-0 flex flex-col items-end gap-3">
            <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
            <div className="flex items-center gap-2">
              <Link
                to={`/issues/${issue.id}`}
                className="h-8 w-8 flex items-center justify-center rounded-xl border border-white/[0.05] text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl border border-white/[0.05] text-zinc-700 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-8 px-2 text-[9px] font-black uppercase rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleting ? '…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-xl border border-white/[0.05] text-zinc-600 hover:text-white transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MyIssuesPage() {
  const { issues, isLoading } = useStore();
  const { user: clerkUser } = useUser();
  const { isSignedIn } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  const myIssues = useMemo(
    () => issues.filter(i => i.reporterId === clerkUser?.id && !deleted.has(i.id)),
    [issues, clerkUser, deleted]
  );

  const filtered = useMemo(() => {
    let list = [...myIssues];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q));
    }
    if (status !== 'All') list = list.filter(i => i.status === status);
    if (category !== 'All') list = list.filter(i => (i.category || 'General') === category);
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sort === 'upvotes') list.sort((a, b) => b.upvotes - a.upvotes);
    return list;
  }, [myIssues, search, status, category, sort]);

  const handleDelete = (id: string) => setDeleted(prev => new Set([...prev, id]));

  const exportCSV = () => {
    const header = 'Title,Status,Category,Location,Upvotes,Created At';
    const rows = filtered.map(i =>
      `"${i.title}","${i.status}","${i.category || 'General'}","${i.location || ''}",${i.upvotes},"${new Date(i.createdAt).toLocaleDateString()}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-issues.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const resolved   = myIssues.filter(i => i.status === 'Resolved').length;
  const inProgress = myIssues.filter(i => i.status === 'In Progress').length;
  const escalated  = myIssues.filter(i => i.status === 'Escalated').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-32 space-y-8">
      <ReportIssueModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Activity className="h-3 w-3" /> My Reports
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Issues</h1>
          <p className="text-zinc-500 font-medium">
            {myIssues.length} total · <span className="text-emerald-400">{resolved} resolved</span>
            {inProgress > 0 && <> · <span className="text-amber-400">{inProgress} in progress</span></>}
            {escalated > 0 && <> · <span className="text-red-400">{escalated} escalated</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/10 transition-all disabled:opacity-30"
          >
            <FileDown className="h-3.5 w-3.5" /> Export
          </button>
          {isSignedIn && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="h-3.5 w-3.5" /> New Report
            </button>
          )}
        </div>
      </div>

      {/* Status quick-filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => {
          const count = s === 'All' ? myIssues.length : myIssues.filter(i => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                status === s ? 'bg-white text-black border-white' : 'border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10'
              )}
            >
              {s === 'Resolved' && <CheckCircle2 className="h-3 w-3" />}
              {s === 'Escalated' && <AlertTriangle className="h-3 w-3" />}
              {s}
              <span className={cn('opacity-60', status === s ? 'opacity-100' : '')}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search + advanced filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your issues..."
              className="w-full pl-11 pr-10 h-11 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10">
                <X className="h-3.5 w-3.5 text-zinc-500" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              'flex items-center gap-2 px-4 h-11 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all',
              showFilters ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/10'
            )}
          >
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              {/* Sort */}
              <div className="flex gap-2 flex-wrap">
                {SORTS.map(s => (
                  <button key={s.id} onClick={() => setSort(s.id)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                      sort === s.id ? 'bg-indigo-600 text-white border-indigo-500' : 'border-white/[0.05] text-zinc-600 hover:text-white hover:border-white/10')}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              {/* Category */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={cn('px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                      category === c ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'border-white/[0.05] text-zinc-700 hover:text-zinc-300 hover:border-white/10')}>
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
          {isLoading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </p>
        {(search || status !== 'All' || category !== 'All') && (
          <button onClick={() => { setSearch(''); setStatus('All'); setCategory('All'); }}
            className="text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-400 transition-colors flex items-center gap-1">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[1.75rem] border border-white/[0.03] bg-white/[0.01] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-24 rounded-[2.5rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-4"
        >
          <FileText className="h-12 w-12 text-zinc-800" />
          <div className="text-center space-y-1">
            <p className="text-zinc-500 font-bold text-sm">
              {myIssues.length === 0 ? "You haven't filed any issues yet" : 'No issues match your filters'}
            </p>
            {myIssues.length === 0 && (
              <button onClick={() => setIsReportOpen(true)}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all mx-auto">
                <Plus className="h-3.5 w-3.5" /> File First Report
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div className="space-y-4" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map(issue => (
              <IssueCard key={issue.id} issue={issue} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
