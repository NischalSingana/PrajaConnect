import { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '@/context/StoreContext';
import { Link } from 'react-router-dom';
import {
  Award, Activity, CheckCircle2, Clock, Star, TrendingUp,
  FileText, ArrowRight, MapPin, ThumbsUp, Flame, Shield, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

const CATEGORY_COLORS: Record<string, string> = {
  Infrastructure: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  Sanitation:     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Safety:         'bg-red-500/10 border-red-500/20 text-red-400',
  Electricity:    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  Water:          'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  Roads:          'bg-orange-500/10 border-orange-500/20 text-orange-400',
  Environment:    'bg-green-500/10 border-green-500/20 text-green-400',
  General:        'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
};

const BADGE_META: Record<string, { icon: string; desc: string; color: string }> = {
  'First Reporter':    { icon: '🎯', desc: 'Filed your first civic issue',          color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300' },
  'Problem Solver':    { icon: '⚡', desc: 'Had 5+ issues resolved',                 color: 'border-blue-500/20 bg-blue-500/5 text-blue-300' },
  'Community Voice':   { icon: '📣', desc: 'Collected 50+ upvotes',                  color: 'border-violet-500/20 bg-violet-500/5 text-violet-300' },
  'Persistent Civic':  { icon: '🔥', desc: 'Reported issues for 30 consecutive days', color: 'border-orange-500/20 bg-orange-500/5 text-orange-300' },
  'Petition Leader':   { icon: '📜', desc: 'Started a petition with 100+ signatures', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' },
  'Verified Citizen':  { icon: '✅', desc: 'Identity verified by moderator',          color: 'border-teal-500/20 bg-teal-500/5 text-teal-300' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { issues, user: storeUser, isLoading } = useStore();

  const myIssues = useMemo(
    () => issues.filter(i => i.reporterId === (storeUser?.id || clerkUser?.id)),
    [issues, storeUser, clerkUser]
  );

  const resolved   = myIssues.filter(i => i.status === 'Resolved').length;
  const inProgress = myIssues.filter(i => i.status === 'In Progress').length;
  const totalVotes = myIssues.reduce((s, i) => s + i.upvotes, 0);
  const resRate    = myIssues.length ? Math.round((resolved / myIssues.length) * 100) : 0;
  const repScore   = storeUser?.reputationScore ?? 0;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    myIssues.forEach(i => { map[i.category || 'General'] = (map[i.category || 'General'] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [myIssues]);

  const recentActivity = myIssues
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const badges: string[] = storeUser?.badges ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Activity className="h-8 w-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-32 space-y-10"
    >
      {/* ── Hero Card ── */}
      <motion.div variants={item}
        className="relative p-8 sm:p-12 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 blur-[80px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="relative">
            <img
              src={clerkUser?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${clerkUser?.fullName}`}
              alt={clerkUser?.fullName ?? ''}
              className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white/5"
            />
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-indigo-600 border-2 border-black flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{clerkUser?.fullName || 'Citizen'}</h1>
              <p className="text-zinc-500 font-medium mt-1">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                <Shield className="h-3 w-3" /> Verified Citizen
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-[9px] font-black uppercase tracking-widest text-yellow-400">
                <Star className="h-3 w-3" /> {repScore} Reputation
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/[0.05] bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Member since {clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>

          {/* Reputation ring */}
          <div className="shrink-0">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1f1f2e" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${Math.min((repScore / 1000) * 264, 264)} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-white">{repScore}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 leading-none">pts</span>
              </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 text-center mt-2">
              {repScore < 100 ? 'Newcomer' : repScore < 500 ? 'Active' : repScore < 1000 ? 'Champion' : 'Legend'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Issues Filed',   value: myIssues.length, icon: <FileText className="h-4 w-4" />,    color: 'text-white',         bg: 'bg-white/[0.03]' },
          { label: 'Resolved',       value: resolved,         icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-400',  bg: 'bg-emerald-500/10' },
          { label: 'Upvotes Earned', value: totalVotes,       icon: <ThumbsUp className="h-4 w-4" />,    color: 'text-indigo-400',   bg: 'bg-indigo-500/10' },
          { label: 'In Progress',    value: inProgress,       icon: <Clock className="h-4 w-4" />,       color: 'text-amber-400',    bg: 'bg-amber-500/10' },
        ].map(s => (
          <motion.div key={s.label} variants={item}>
            <div className="p-6 sm:p-7 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 hover:bg-zinc-900/25 transition-all group">
              <div className={cn('inline-flex p-2 rounded-xl mb-4', s.bg)}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div className={cn('text-3xl font-black', s.color)}>{s.value.toLocaleString()}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Recent Activity
            </h2>
            <Link to="/dashboard/my-issues" className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-indigo-400 transition-colors flex items-center gap-1">
              All Issues <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-16 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3">
              <FileText className="h-10 w-10 text-zinc-800" />
              <p className="text-zinc-600 text-sm font-bold">No activity yet</p>
              <Link to="/issues" className="text-indigo-400 text-xs font-bold hover:underline">Browse issues →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((issue) => (
                <motion.div key={issue.id} variants={item}>
                  <Link to={`/issues/${issue.id}`} className="block group">
                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.03] bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-indigo-500/10 transition-all">
                      <div className={cn(
                        'shrink-0 h-2 w-2 rounded-full',
                        issue.status === 'Resolved' ? 'bg-emerald-500' :
                        issue.status === 'In Progress' ? 'bg-amber-500 animate-pulse' :
                        issue.status === 'Escalated' ? 'bg-red-500' : 'bg-zinc-700'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">{issue.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-700">
                          <span>{issue.category || 'General'}</span>
                          {issue.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{issue.location}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{timeAgo(issue.createdAt)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                        <ThumbsUp className="h-3 w-3" />
                        {issue.upvotes}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-6">

          {/* Resolution progress */}
          <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Impact
            </h3>
            {[
              { label: 'Resolution Rate', value: resRate, color: resRate >= 70 ? '#10b981' : resRate >= 40 ? '#f59e0b' : '#ef4444' },
              { label: 'Community Reach', value: Math.min(totalVotes, 100), color: '#6366f1' },
            ].map(stat => (
              <div key={stat.label} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">{stat.label}</span>
                  <span style={{ color: stat.color }}>{stat.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5" /> Top Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryBreakdown.map(([cat, count]) => (
                  <div
                    key={cat}
                    className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest', CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.General)}
                  >
                    {cat}
                    <span className="opacity-60">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Award className="h-3.5 w-3.5" /> Achievements
            </h3>
            {badges.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-3xl">🌱</div>
                <p className="text-zinc-600 text-xs font-bold">No badges yet</p>
                <p className="text-zinc-700 text-[9px] leading-relaxed">Start filing issues to earn your first badge.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {badges.map(badge => {
                  const meta = BADGE_META[badge] ?? { icon: '🏆', desc: badge, color: 'border-zinc-500/20 bg-zinc-500/5 text-zinc-400' };
                  return (
                    <div key={badge} className={cn('flex items-center gap-3 p-3 rounded-2xl border', meta.color)}>
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{badge}</p>
                        <p className="text-[9px] text-zinc-600 mt-0.5">{meta.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
