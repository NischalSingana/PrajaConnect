import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { useAuth } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { ReportIssueModal } from '@/components/issues/ReportIssueModal';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search, Plus, Clock, CheckCircle2,
  MapPin, ThumbsUp, MessageSquare, Flame, AlertTriangle, Activity,
  X, Star, FileText, Filter
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Infrastructure', 'Sanitation', 'Safety', 'Electricity',
  'Water', 'Roads', 'Parks', 'Environment', 'Transport', 'General'
];

const SORT_TABS = [
  { id: 'trending', label: 'Trending', icon: <Flame className="h-3.5 w-3.5" /> },
  { id: 'recent', label: 'Recent', icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { id: 'critical', label: 'Critical', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
];

const STATUS_COLORS: Record<string, { dot: string; badge: string }> = {
  Resolved:    { dot: 'bg-emerald-500', badge: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
  'In Progress': { dot: 'bg-amber-500', badge: 'border-amber-500/20 bg-amber-500/5 text-amber-400' },
  Pending:     { dot: 'bg-zinc-600',   badge: 'border-white/10 bg-white/5 text-zinc-500' },
  Escalated:   { dot: 'bg-red-500',    badge: 'border-red-500/20 bg-red-500/5 text-red-400' },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 26 }
  },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } }
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function IssueCardSkeleton() {
  return (
    <div className="p-6 rounded-[1.75rem] border border-white/[0.03] bg-zinc-900/10 animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-white/[0.05] rounded-full" />
          <div className="h-5 w-3/4 bg-white/[0.05] rounded-full" />
        </div>
        <div className="h-6 w-16 bg-white/[0.04] rounded-lg" />
      </div>
      <div className="h-3 w-full bg-white/[0.03] rounded-full" />
      <div className="h-3 w-2/3 bg-white/[0.03] rounded-full" />
      <div className="flex gap-4 pt-2">
        <div className="h-3 w-12 bg-white/[0.04] rounded-full" />
        <div className="h-3 w-12 bg-white/[0.04] rounded-full" />
        <div className="h-3 w-20 bg-white/[0.04] rounded-full" />
      </div>
    </div>
  );
}

export function PublicIssueFeed() {
  const { issues, isLoading, upvoteIssue, stats } = useLocalStore();
  const { isSignedIn } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [sort, setSort] = useState('trending');
  const [category, setCategory] = useState('All');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...issues];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      list = list.filter(i => i.category === category);
    }

    if (sort === 'trending') return list.sort((a, b) => b.upvotes - a.upvotes);
    if (sort === 'recent') return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'resolved') return list.filter(i => i.status === 'Resolved').sort((a, b) => b.upvotes - a.upvotes);
    if (sort === 'critical') return list.filter(i => i.escalationLevel !== 'Normal' || i.status === 'Escalated');
    return list;
  }, [issues, debouncedSearch, sort, category]);

  const handleUpvote = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn || upvotedIds.has(id)) return;
    setUpvotedIds(prev => new Set([...prev, id]));
    await upvoteIssue(id);
  };

  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = issues.length ? Math.round((resolvedCount / issues.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <ReportIssueModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">

        {/* ── Header ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Activity className="h-3 w-3" />
                Live Issue Feed
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Community Issues</h1>
              <p className="text-zinc-500 font-medium">
                {issues.length.toLocaleString()} reports · {resolutionRate}% resolved
              </p>
            </div>

            {isSignedIn && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="shrink-0 flex items-center gap-2 h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="h-4 w-4" /> Report Issue
              </button>
            )}
          </div>

          {/* Platform stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Reports', value: stats.issues.toLocaleString(), color: 'text-white' },
              { label: 'Resolved', value: resolvedCount.toLocaleString(), color: 'text-emerald-400' },
              { label: 'Active Citizens', value: stats.citizens.toLocaleString(), color: 'text-indigo-400' },
              { label: 'Avg. Resolution', value: stats.avgResponseTime, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl border border-white/[0.04] bg-zinc-900/20">
                <div className={cn('text-xl font-black', s.color)}>{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search + Sort ── */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search issues, locations, categories..."
                className="w-full pl-11 pr-10 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
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
                'flex items-center gap-2 px-4 h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all',
                showFilters || category !== 'All'
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                  : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-white hover:border-white/10'
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {category !== 'All' && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            </button>
          </div>

          {/* Sort Tabs */}
          <div className="flex gap-2 flex-wrap">
            {SORT_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSort(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                  sort === tab.id
                    ? 'bg-white text-black border-white'
                    : 'border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10 bg-white/[0.02]'
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter (collapsible) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                        category === cat
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'border-white/[0.05] text-zinc-600 hover:text-zinc-300 hover:border-white/10'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Results info ── */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            {isLoading ? 'Loading…' : `${filtered.length} issue${filtered.length !== 1 ? 's' : ''} found`}
            {search && <span className="text-indigo-400 ml-2">for "{search}"</span>}
          </p>
          {(search || category !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* ── Cards ── */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <IssueCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 rounded-[2.5rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-4"
          >
            <Search className="h-12 w-12 text-zinc-800" />
            <div className="text-center space-y-1">
              <p className="text-zinc-500 font-bold text-sm">No issues found</p>
              <p className="text-zinc-700 text-xs">Try adjusting your search or filters</p>
            </div>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setSort('trending'); }}
              className="px-5 py-2 rounded-xl border border-white/[0.05] text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/10 transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((issue, idx) => {
                const sc = STATUS_COLORS[issue.status] ?? STATUS_COLORS.Pending;
                const hasUpvoted = upvotedIds.has(issue.id);

                return (
                  <motion.div
                    key={issue.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  >
                    <Link to={`/issues/${issue.id}`} className="block group">
                      <div className={cn(
                        'relative p-6 sm:p-7 rounded-[1.75rem] border transition-all duration-300',
                        'border-white/[0.04] bg-zinc-900/10',
                        'hover:border-indigo-500/15 hover:bg-zinc-900/30',
                        issue.escalationLevel === 'Critical' && 'border-red-500/10 hover:border-red-500/20'
                      )}>

                        {/* Critical/Escalated ribbon */}
                        {issue.escalationLevel === 'Critical' && (
                          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[1.75rem] bg-gradient-to-r from-red-600 to-orange-500" />
                        )}

                        <div className="flex items-start gap-4">
                          {/* Status indicator */}
                          <div className="shrink-0 mt-1.5">
                            <div className={cn(
                              'h-2 w-2 rounded-full',
                              sc.dot,
                              issue.status === 'In Progress' && 'animate-pulse'
                            )} />
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Category + badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-600">
                                {issue.category || 'General'}
                              </span>
                              <span className={cn('px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border', sc.badge)}>
                                {issue.status}
                              </span>
                              {issue.isPetition && (
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 flex items-center gap-1">
                                  <FileText className="h-2.5 w-2.5" /> Petition
                                </span>
                              )}
                              {issue.escalationLevel !== 'Normal' && (
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/5 text-red-400">
                                  {issue.escalationLevel}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                              {issue.title}
                            </h3>

                            {/* Description */}
                            {issue.description && (
                              <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                                {issue.description}
                              </p>
                            )}

                            {/* Footer meta */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 flex-wrap">
                                {issue.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-zinc-700" />
                                    {issue.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-zinc-700" />
                                  {timeAgo(issue.createdAt)}
                                </span>
                                {issue.commentsCount !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-zinc-700" />
                                    {issue.commentsCount}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />

                                {/* Upvote */}
                                <button
                                  onClick={(e) => handleUpvote(e, issue.id)}
                                  disabled={!isSignedIn || hasUpvoted}
                                  className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all',
                                    hasUpvoted
                                      ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400 cursor-default'
                                      : !isSignedIn
                                      ? 'border-white/[0.04] bg-white/[0.02] text-zinc-700 cursor-default'
                                      : 'border-white/[0.05] bg-white/[0.02] text-zinc-500 hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-400 active:scale-95'
                                  )}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  {issue.upvotes.toLocaleString()}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Login CTA ── */}
        {!isSignedIn && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.03] text-center space-y-4"
          >
            <Star className="h-8 w-8 text-indigo-500/40 mx-auto" />
            <div>
              <p className="text-white font-black text-lg">Join the movement</p>
              <p className="text-zinc-500 text-sm mt-1">Sign in to report issues, upvote, and track resolutions.</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              Sign In Free
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
