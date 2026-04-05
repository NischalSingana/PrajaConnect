import { motion, Variants } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { SlaBadge } from '../components/ui/SlaBadge';
import { PlusCircle, Award, Star, TrendingUp, Sparkles, Clock, Activity, Bell, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ReportIssueModal } from '../components/issues/ReportIssueModal';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { scale: 0.98, opacity: 0, y: 10 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const NOTIF_COLORS: Record<string, string> = {
  SLA_WARNING: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  ESCALATION: 'bg-red-500/10 border-red-500/20 text-red-400',
  REPLY: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  STATUS_CHANGE: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  PETITION_MILESTONE: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
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

export function CitizenDashboard() {
  const { issues, user, notifications, isLoading } = useStore();
  const { user: clerkUser } = useUser();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const displayUser = user ?? {
    id: clerkUser?.id ?? '',
    name: clerkUser?.fullName ?? 'Citizen',
    reputationScore: 0,
    badges: [] as string[],
  };

  const myIssues = issues.filter(i => i.reporterId === displayUser.id);
  const recentNotifications = notifications.slice(0, 5);

  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length;
  const inProgressCount = myIssues.filter(i => i.status === 'In Progress').length;
  const totalUpvotes = myIssues.reduce((sum, i) => sum + i.upvotes, 0);
  const resolutionRate = myIssues.length > 0 ? Math.round((resolvedCount / myIssues.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
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
      className="max-w-7xl mx-auto space-y-12 pb-32 pt-10 px-6"
    >
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />

      {/* Hero Section */}
      <div className="relative p-12 rounded-[2.5rem] overflow-hidden border border-white/[0.03] bg-[#050505] shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Activity className="h-3 w-3" /> Citizen Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Welcome, <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{displayUser.name.split(' ')[0]}.</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-xl leading-relaxed">
              You have filed <span className="text-white font-bold">{myIssues.length}</span> civic reports.{' '}
              {resolvedCount > 0 && <><span className="text-emerald-400 font-bold">{resolvedCount}</span> have been resolved.</>}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-white text-black hover:bg-zinc-200 border-none shadow-2xl rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Report Issue
            </Button>
            <Link to="/dashboard/my-issues">
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 text-sm font-bold uppercase tracking-widest">
                My Issues <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Civic Reputation', value: displayUser.reputationScore, icon: <Award className="h-5 w-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Reports', value: myIssues.length, icon: <TrendingUp className="h-5 w-5" />, color: 'text-white', bg: 'bg-white/[0.03]' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Community Upvotes', value: totalUpvotes.toLocaleString(), icon: <Star className="h-5 w-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 group">
              <div className={cn('absolute top-6 right-6 p-2 rounded-xl group-hover:scale-110 transition-transform', stat.bg)}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">{stat.label}</span>
                <div className={cn('text-4xl font-black', stat.color)}>{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Issues Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-white tracking-[0.2em] uppercase">My Recent Reports</h2>
            <Link to="/dashboard/my-issues" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {myIssues.length === 0 ? (
            <div className="py-24 rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-4">
              <Activity className="h-10 w-10 text-zinc-800" />
              <div className="space-y-2">
                <p className="text-zinc-500 text-sm font-bold">No reports filed yet</p>
                <p className="text-zinc-700 text-xs">Spot an issue in your community? Report it and hold officials accountable.</p>
              </div>
              <Button size="sm" onClick={() => setIsReportModalOpen(true)} className="rounded-full bg-indigo-600 hover:bg-indigo-500 border-none mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> File First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myIssues.slice(0, 6).map((issue) => (
                <motion.div key={issue.id} variants={item}>
                  <Link to={`/issues/${issue.id}`} className="block group">
                    <div className="relative p-6 rounded-3xl border border-white/[0.03] bg-[#08080a] hover:bg-zinc-900/40 hover:border-indigo-500/10 transition-all duration-500">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn(
                            "h-12 w-1.5 rounded-full shrink-0",
                            issue.status === 'Resolved' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                            issue.status === 'In Progress' ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : 
                            issue.status === 'Escalated' ? "bg-red-500" : "bg-zinc-800"
                          )} />
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{issue.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                              <span>{issue.category}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {issue.upvotes} upvotes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            issue.status === 'Resolved' ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" : 
                            issue.status === 'In Progress' ? "border-amber-500/20 bg-amber-500/5 text-amber-500" : 
                            issue.status === 'Escalated' ? "border-red-500/20 bg-red-500/5 text-red-500" : "border-white/5 bg-white/5 text-zinc-500"
                          )}>
                            {issue.status}
                          </div>
                          <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick stats for In Progress and Escalated */}
          {(inProgressCount > 0 || myIssues.filter(i => i.status === 'Escalated').length > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {inProgressCount > 0 && (
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                  <div className="text-2xl font-black text-amber-400">{inProgressCount}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 mt-1">In Progress</div>
                </div>
              )}
              {myIssues.filter(i => i.status === 'Escalated').length > 0 && (
                <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="text-2xl font-black text-red-400">{myIssues.filter(i => i.status === 'Escalated').length}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-red-600 mt-1">Escalated</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Reputation Card */}
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 backdrop-blur-3xl space-y-6 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full" />
            
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Reputation Progress</span>
              <div className="text-4xl font-black text-white">{displayUser.reputationScore}</div>
              <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((displayUser.reputationScore / 1000) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                />
              </div>
              <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                <span>0 pts</span>
                <span>1000 pts Silver</span>
              </div>
            </div>

            {displayUser.badges && displayUser.badges.length > 0 && (
              <div className="pt-4 border-t border-white/[0.05] space-y-3 relative z-10">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Badges</span>
                <div className="flex flex-wrap gap-2">
                  {displayUser.badges.map((badge: string) => (
                    <span key={badge} className="px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Award className="h-3 w-3" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link to="/leaderboard" className="block relative z-10">
              <Button variant="outline" className="w-full rounded-2xl h-11 border-white/5 bg-white/[0.01] text-[9px] uppercase font-black tracking-[0.2em] hover:bg-white/5">
                View Leaderboard <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Recent Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Recent Notifications</span>
              <Link to="/dashboard/notifications" className="text-[9px] font-black text-zinc-600 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="py-10 rounded-2xl border border-dashed border-white/5 flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 text-zinc-800" />
                <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map(notif => {
                  const colorClass = NOTIF_COLORS[notif.type] ?? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
                  return (
                    <div key={notif.id} className={cn(
                      'flex items-start gap-3 p-4 rounded-2xl border transition-all',
                      notif.isRead ? 'border-white/[0.03] bg-transparent' : 'border-indigo-500/10 bg-indigo-500/[0.02]'
                    )}>
                      <div className={cn('shrink-0 mt-0.5 p-1.5 rounded-lg border', colorClass)}>
                        <Bell className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-bold leading-snug', notif.isRead ? 'text-zinc-500' : 'text-white')}>
                          {notif.title || notif.message}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mt-0.5">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Links</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'View Issue Heatmap', path: '/dashboard/map' },
                { label: 'SLA Tracker', path: '/dashboard/escalations' },
                { label: 'Petition Board', path: '/petitions' },
              ].map(link => (
                <Link key={link.path} to={link.path} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.03] hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{link.label}</span>
                  <ArrowRight className="h-3 w-3 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
