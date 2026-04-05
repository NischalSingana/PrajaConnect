import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { useAuth, useUser } from '@clerk/clerk-react';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/constants';
import type { Issue } from '@/types';
import {
  ArrowLeft, ThumbsUp, MapPin, Calendar, Tag, User, Activity,
  CheckCircle2, Clock, AlertTriangle, Megaphone, MessageSquare,
  Share2, Flag, ExternalLink, Send, Loader2, Image as ImageIcon, Star
} from 'lucide-react';

const STATUS_STYLES: Record<string, { badge: string; glow: string; label: string }> = {
  Resolved:      { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', glow: 'shadow-emerald-500/10',  label: 'Resolved' },
  'In Progress': { badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',       glow: 'shadow-amber-500/10',   label: 'In Progress' },
  Pending:       { badge: 'border-white/10 bg-white/5 text-zinc-400',                glow: '',                       label: 'Pending' },
  Escalated:     { badge: 'border-red-500/30 bg-red-500/10 text-red-400',             glow: 'shadow-red-500/10',     label: 'Escalated' },
};

const ESCALATION_COLOR: Record<string, string> = {
  Critical: 'text-red-400', 'Level 2': 'text-orange-400', 'Level 1': 'text-amber-400', Normal: 'text-zinc-500'
};

interface LocalComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CommentBubble({ comment, isFirst }: { comment: LocalComment; isFirst?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-4 p-5 rounded-2xl border transition-all',
        isFirst ? 'border-indigo-500/10 bg-indigo-500/[0.03]' : 'border-white/[0.03] bg-white/[0.01]'
      )}
    >
      <div className="shrink-0 h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-[11px] font-black text-white overflow-hidden">
        {comment.avatar ? (
          <img src={comment.avatar} alt={comment.author} className="h-full w-full object-cover" />
        ) : (
          comment.author.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-black text-white uppercase tracking-widest">{comment.author}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 shrink-0">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{comment.text}</p>
      </div>
    </motion.div>
  );
}

const timelineVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const tlItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }
};

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, upvoteIssue, isLoading: storeLoading } = useLocalStore();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [upvoted, setUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [fetchedIssue, setFetchedIssue] = useState<Issue | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [fetching, setFetching] = useState(false);

  const issue = issues.find(i => i.id === id) ?? fetchedIssue;

  // If the issue isn't in the store (e.g. direct navigation / page refresh),
  // fetch it directly from the API.
  useEffect(() => {
    if (!id || issue) return;
    if (storeLoading) return; // wait for store to finish first

    setFetching(true);
    fetch(`${API_URL}/api/issues/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Issue) => setFetchedIssue(data))
      .catch(() => setFetchError(true))
      .finally(() => setFetching(false));
  }, [id, issue, storeLoading]);

  useEffect(() => {
    if (!issue) return;
    const stored = localStorage.getItem(`comments_${issue.id}`);
    if (stored) setComments(JSON.parse(stored));
  }, [issue?.id]);

  if (storeLoading || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Activity className="h-8 w-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 font-bold">{fetchError ? 'Failed to load issue' : 'Issue not found'}</p>
          <Link to="/issues" className="text-indigo-400 text-sm font-bold hover:underline">← Back to feed</Link>
        </div>
      </div>
    );
  }

  const st = STATUS_STYLES[issue.status] ?? STATUS_STYLES.Pending;

  const handleUpvote = async () => {
    if (!isSignedIn || upvoted) return;
    setUpvoted(true);
    await upvoteIssue(issue.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(issue.title)}`, '_blank');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isSignedIn || submitting) return;
    setSubmitting(true);
    await new Promise(res => setTimeout(res, 300));
    const newComment: LocalComment = {
      id: Date.now().toString(),
      author: user?.fullName ?? user?.firstName ?? 'Citizen',
      avatar: user?.imageUrl,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${issue.id}`, JSON.stringify(updated));
    setCommentText('');
    setSubmitting(false);
  };

  /* Timeline events derived from issue data */
  const timeline = [
    { icon: <Flag className="h-3.5 w-3.5" />, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'Issue Reported', time: issue.createdAt, desc: 'Civic complaint filed and assigned tracking ID.' },
    ...(issue.status === 'In Progress' || issue.status === 'Resolved' || issue.status === 'Escalated'
      ? [{ icon: <Activity className="h-3.5 w-3.5" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Under Review', time: issue.createdAt, desc: 'Assigned to concerned department.' }]
      : []),
    ...(issue.response
      ? [{ icon: <Megaphone className="h-3.5 w-3.5" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Official Response', time: issue.createdAt, desc: issue.response }]
      : []),
    ...(issue.escalationLevel !== 'Normal'
      ? [{ icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: `Escalated — ${issue.escalationLevel}`, time: issue.createdAt, desc: 'SLA deadline breached. Escalation triggered.' }]
      : []),
    ...(issue.status === 'Resolved'
      ? [{ icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Resolved', time: issue.createdAt, desc: 'Issue successfully closed and marked as resolved.' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              src={lightboxImg}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-full max-h-full object-contain rounded-3xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">

        {/* Back nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/10 transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >

          {/* Hero section */}
          <div className={cn(
            'relative p-8 sm:p-10 rounded-[2.5rem] border overflow-hidden',
            'border-white/[0.05] bg-zinc-900/20',
            issue.escalationLevel === 'Critical' && 'border-red-500/10'
          )}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
            {issue.status === 'Resolved' && (
              <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-600/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            )}

            <div className="relative z-10 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', st.badge)}>
                  {st.label}
                </span>
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-500">
                  {issue.category || 'General'}
                </span>
                {issue.isPetition && (
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                    Petition
                  </span>
                )}
                {issue.escalationLevel !== 'Normal' && (
                  <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/5', ESCALATION_COLOR[issue.escalationLevel])}>
                    {issue.escalationLevel}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {issue.title}
              </h1>

              {/* Description */}
              {issue.description && (
                <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
                  {issue.description}
                </p>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { icon: <MapPin className="h-3.5 w-3.5" />, label: 'Location', value: issue.location || '—' },
                  { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Filed', value: new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: <Tag className="h-3.5 w-3.5" />, label: 'Priority', value: issue.escalationLevel },
                  { icon: <Clock className="h-3.5 w-3.5" />, label: 'SLA Deadline', value: issue.slaDeadline ? new Date(issue.slaDeadline).toLocaleDateString('en-IN') : '—' },
                ].map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      {m.icon} {m.label}
                    </div>
                    <p className="text-sm font-bold text-white truncate">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Actions bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleUpvote}
                  disabled={!isSignedIn || upvoted}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all',
                    upvoted
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 cursor-default'
                      : !isSignedIn
                      ? 'border-white/[0.04] text-zinc-700 cursor-default'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-400 active:scale-95'
                  )}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {issue.upvotes.toLocaleString()} upvotes
                  {upvoted && <span className="text-[8px]">✓</span>}
                </button>
                <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </div>
                <div className="ml-auto">
                  <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: images + timeline + official response */}
            <div className="lg:col-span-2 space-y-8">

              {/* Images */}
              {issue.imageUrl && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5" /> Attached Photo
                  </h2>
                  <button
                    onClick={() => setLightboxImg(issue.imageUrl!)}
                    className="relative w-full aspect-video max-w-sm rounded-2xl overflow-hidden border border-white/[0.05] hover:border-white/10 transition-all group"
                  >
                    <img src={issue.imageUrl} alt="Issue photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>
              )}

              {/* Official Response */}
              {issue.response && (
                <div className="p-6 rounded-[2rem] border border-blue-500/15 bg-blue-500/[0.04] space-y-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Megaphone className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Official Response</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{issue.response}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" /> Resolution Timeline
                </h2>
                <motion.div variants={timelineVariants} initial="hidden" animate="show" className="relative space-y-0">
                  <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-indigo-500/20 via-white/[0.04] to-transparent" />
                  {timeline.map((event, i) => (
                    <motion.div key={i} variants={tlItem} className="flex gap-5 pb-6 relative">
                      <div className={cn('shrink-0 h-10 w-10 rounded-2xl border flex items-center justify-center z-10 bg-black', event.color)}>
                        {event.icon}
                      </div>
                      <div className="pt-1.5 flex-1 space-y-1">
                        <p className="text-sm font-black text-white">{event.label}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">{event.desc}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{timeAgo(event.time)}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Comments */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" /> Discussion ({comments.length})
                  </h2>
                </div>

                {isSignedIn ? (
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-[11px] font-black text-white overflow-hidden">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (user?.firstName ?? 'C').charAt(0)
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <textarea
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Share your thoughts on this issue..."
                          rows={3}
                          className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || submitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Post
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] text-center">
                    <p className="text-zinc-500 text-sm">
                      <Link to="/login" className="text-indigo-400 hover:underline font-bold">Sign in</Link> to join the discussion
                    </p>
                  </div>
                )}

                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((c, i) => <CommentBubble key={c.id} comment={c} isFirst={i === 0} />)}
                  </div>
                ) : (
                  <div className="py-10 rounded-2xl border border-dashed border-white/[0.04] flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-zinc-800" />
                    <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest">No comments yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Quick Stats */}
              <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Issue Stats</h3>
                {[
                  { label: 'Community Upvotes', value: issue.upvotes, icon: <ThumbsUp className="h-3.5 w-3.5 text-indigo-400" /> },
                  { label: 'Comments', value: comments.length, icon: <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> },
                  ...(issue.isPetition && issue.petitionTarget ? [{ label: 'Petition Target', value: issue.petitionTarget, icon: <Star className="h-3.5 w-3.5 text-yellow-400" /> }] : []),
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      {s.icon} {s.label}
                    </div>
                    <span className="text-white font-black">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* SLA tracker */}
              <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">SLA Status</h3>
                <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                {issue.slaDeadline && (
                  <p className="text-xs text-zinc-500">
                    Deadline: {new Date(issue.slaDeadline).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>

              {/* Reporter info */}
              <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Reported By</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Community Member</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">Verified Citizen</p>
                  </div>
                </div>
              </div>

              {/* Petition progress (if applicable) */}
              {issue.isPetition && issue.petitionTarget && (
                <div className="p-6 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.03] space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Petition Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-zinc-500">{issue.upvotes.toLocaleString()} signatures</span>
                      <span className="text-zinc-600">{issue.petitionTarget.toLocaleString()} target</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((issue.upvotes / issue.petitionTarget) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
                      />
                    </div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      {Math.round((issue.upvotes / issue.petitionTarget) * 100)}% of goal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
