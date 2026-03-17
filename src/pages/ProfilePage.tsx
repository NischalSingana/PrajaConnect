import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Award, Star, FileText, CheckCircle2, Clock, Activity, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { user, issues } = useLocalStore();

  // Render immediately using Clerk's cached data — DB user merges in once /api/users/me resolves.

  const displayUser = user ?? {
    id: clerkUser?.id ?? '',
    name: clerkUser?.fullName ?? 'Citizen',
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
    role: 'citizen' as const,
    reputationScore: 0,
    badges: [] as string[],
    avatar: clerkUser?.imageUrl,
  };

  const myIssues = issues.filter(i => i.reporterId === displayUser.id);
  const resolved = myIssues.filter(i => i.status === 'Resolved').length;
  const inProgress = myIssues.filter(i => i.status === 'In Progress').length;
  const totalUpvotes = myIssues.reduce((sum, i) => sum + i.upvotes, 0);

  const roleColors: Record<string, string> = {
    citizen: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    politician: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    moderator: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    admin: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  const stats = [
    { label: 'Total Reports', value: myIssues.length, icon: <FileText className="h-5 w-5 text-indigo-400" /> },
    { label: 'Resolved', value: resolved, icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
    { label: 'In Progress', value: inProgress, icon: <Clock className="h-5 w-5 text-amber-400" /> },
    { label: 'Community Upvotes', value: totalUpvotes, icon: <Star className="h-5 w-5 text-yellow-400" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 pb-20 pt-4 px-2"
    >
      {/* Profile Hero Card */}
      <div className="relative p-10 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/30 overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={clerkUser?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${displayUser.name}`}
              alt={displayUser.name}
              className="h-28 w-28 rounded-3xl object-cover border-2 border-white/10 shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{displayUser.name}</h1>
              <p className="text-zinc-500 font-medium mt-1">
                {clerkUser?.primaryEmailAddress?.emailAddress ?? ''}
              </p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <span className={cn(
                'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
                roleColors[displayUser.role] ?? roleColors.citizen
              )}>
                {displayUser.role}
              </span>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-zinc-400">
                Rep Score: {('reputationScore' in displayUser) ? displayUser.reputationScore : 0}
              </span>
            </div>

            {/* Badges */}
            {('badges' in displayUser) && Array.isArray(displayUser.badges) && displayUser.badges.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {displayUser.badges.map((badge: string) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-wider text-indigo-400"
                  >
                    <Award className="h-3 w-3" /> {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Issues */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase">Recent Reports</h2>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>

        {myIssues.length === 0 ? (
          <div className="py-16 rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center gap-3">
            <Activity className="h-8 w-8 text-zinc-800" />
            <p className="text-zinc-600 text-sm font-medium">No reports filed yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myIssues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'h-10 w-1 rounded-full shrink-0',
                    issue.status === 'Resolved' ? 'bg-emerald-500' :
                    issue.status === 'In Progress' ? 'bg-amber-500' : 'bg-zinc-700'
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{issue.title}</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                      {issue.category} · {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'shrink-0 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                  issue.status === 'Resolved' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' :
                  issue.status === 'In Progress' ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' :
                  'border-white/5 bg-white/5 text-zinc-500'
                )}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Info */}
      <div className="p-8 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 flex items-start gap-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Shield className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Account Role</p>
          <p className="text-white font-bold capitalize text-lg">{displayUser.role}</p>
          <p className="text-zinc-500 text-sm font-medium mt-1 leading-relaxed">
            {String(displayUser.role) === 'citizen' && 'You can report civic issues, upvote community problems, and track resolution statuses in real time.'}
            {String(displayUser.role) === 'politician' && 'You can respond to citizen concerns, post updates, and manage your constituency dashboard.'}
            {String(displayUser.role) === 'moderator' && 'You can review reported content, resolve conflicts, and maintain platform integrity.'}
            {String(displayUser.role) === 'admin' && 'You have full platform oversight — manage users, view analytics, and configure system settings.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
