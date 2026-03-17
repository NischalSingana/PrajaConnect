import { motion, Variants } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { SlaBadge } from '../components/ui/SlaBadge';
import { PlusCircle, Award, Star, TrendingUp, Sparkles, Clock, Activity } from 'lucide-react';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ReportIssueModal } from '../components/issues/ReportIssueModal';
import { useUser } from '@clerk/clerk-react';

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

export function CitizenDashboard() {
  const { issues, user, isLoading } = useLocalStore();
  const { user: clerkUser } = useUser();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Build display user immediately from Clerk (cached, instant).
  // DB user (with reputationScore & badges) merges in once the fetch completes.
  const displayUser = user ?? {
    id: clerkUser?.id ?? '',
    name: clerkUser?.fullName ?? 'Citizen',
    reputationScore: 0,
    badges: [] as string[],
  };

  const myIssues = issues.filter(i => i.reporterId === displayUser.id);

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
          <div className="space-y-6">
            <div className="hero-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Activity className="h-3 w-3" /> Citizen Performance Index
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Civic <span className="bg-gradient-primary bg-clip-text text-transparent">Nexus.</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-xl leading-relaxed">
              Managing your community contributions. Your reports have initiated <span className="text-white font-bold">{myIssues.length}</span> improvement actions.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsReportModalOpen(true)}
            className="md:w-auto w-full bg-white text-black hover:bg-zinc-200 border-none shadow-2xl rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Report Issue
          </Button>
        </div>
      </div>

      {/* Executive Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div variants={item}>
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 backdrop-blur-3xl group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
               <Award className="h-5 w-5" />
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Civic Reputation</span>
              <div className="text-4xl font-black text-white">{displayUser.reputationScore}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                {displayUser.badges.slice(0, 3).map(badge => (
                  <span key={badge} className="px-2 py-0.5 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-[8px] font-black uppercase tracking-wider text-indigo-400">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 backdrop-blur-3xl group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-white/[0.03] text-zinc-500 group-hover:scale-110 transition-transform">
               <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Improvement Nodes</span>
              <div className="text-4xl font-black text-white">{myIssues.length}</div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">Active Reports</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 backdrop-blur-3xl group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
               <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Resolution Integrity</span>
              <div className="text-4xl font-black text-emerald-500">
                {myIssues.length > 0 ? Math.round((myIssues.filter(i => i.status === 'Resolved').length / myIssues.length) * 100) : 0}%
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">Operational Efficacy</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 backdrop-blur-3xl group">
            <div className="absolute top-6 right-6 p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
               <Star className="h-5 w-5" />
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Community Endorsement</span>
              <div className="text-4xl font-black text-white">
                {myIssues.reduce((sum, i) => sum + i.upvotes, 0).toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">Global Validations</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Dashboard Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Reports & Timeline Section */}
        <div className="lg:col-span-2 space-y-12">
          {/* Operational Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-white tracking-[0.2em] uppercase">Operational Nodes</h2>
              <div className="h-px w-24 bg-white/[0.05]" />
            </div>

            <div className="space-y-4">
              {myIssues.length === 0 ? (
                <div className="py-24 rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-4">
                  <Activity className="h-10 w-10 text-zinc-800" />
                  <p className="text-zinc-600 text-sm font-medium">No system activity detected.</p>
                </div>
              ) : (
                myIssues.map((issue) => (
                  <motion.div key={issue.id} variants={item}>
                    <div className="group relative p-6 rounded-3xl border border-white/[0.03] bg-[#08080a] hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500 cursor-pointer">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn(
                            "h-12 w-1.5 rounded-full shrink-0",
                            issue.status === 'Resolved' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                            issue.status === 'In Progress' ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-zinc-800"
                          )} />
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{issue.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                              <span className="text-zinc-700">NODE·{issue.id.slice(0, 8)}</span>
                              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                              {issue.isPetition && <span className="text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/10">Petition Entry</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            issue.status === 'Resolved' ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" : 
                            issue.status === 'In Progress' ? "border-amber-500/20 bg-amber-500/5 text-amber-500" : "border-white/5 bg-white/5 text-zinc-500"
                          )}>
                            {issue.status}
                          </div>
                          <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <h2 className="text-lg font-black text-white tracking-[0.2em] uppercase">Cognitive Timeline</h2>
              <div className="h-px flex-1 bg-white/[0.05]" />
            </div>
            
            <div className="relative pl-8 space-y-10 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-indigo-600 before:via-blue-500 before:to-transparent">
              {[
                { type: 'Reputation', label: 'Reputation Milestone', desc: 'Threshold reached: Gained +50 Civic Influence.', time: '2 hours ago', icon: <Award className="h-3 w-3" /> },
                { type: 'SLA', label: 'Resolution Updated', desc: 'Ticket NODE·A8B2 moved to "In Progress" by GHMC Ward Office.', time: '5 hours ago', icon: <Activity className="h-3 w-3 text-emerald-500" /> },
                { type: 'Support', label: 'Community Support', desc: 'Your report on "Main Road Pothole" received 15 new upvotes.', time: '1 day ago', icon: <TrendingUp className="h-3 w-3 text-blue-400" /> },
              ].map((activity, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[27px] top-1 px-1.5 py-1.5 rounded-full bg-zinc-950 border border-white/10 z-10 group-hover:bg-indigo-600 transition-colors">
                    {activity.icon}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{activity.label}</span>
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{activity.time}</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-12">
          {/* Reputation Progress Card */}
          <div className="relative p-8 rounded-[2.5rem] border border-white/[0.05] bg-zinc-900/20 backdrop-blur-3xl space-y-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Impact Level Progress</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest">Level 4</span>
              </div>
              <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(displayUser.reputationScore / 2000) * 100}%` }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                />
              </div>
              <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                <span>Bronze Tier</span>
                <span>Silver Tier Next</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.05] space-y-6 relative z-10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Core Certificates</h3>
              {[
                { label: 'Early Adopter', sub: 'Founding community member', icon: <Award className="text-amber-500" /> },
                { label: 'Master Reporter', sub: 'Verified reporter status', icon: <Star className="text-blue-500" /> },
              ].map((cert, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                    {cert.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{cert.label}</p>
                    <p className="text-[9px] font-bold text-zinc-600 italic uppercase tracking-wider">{cert.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full relative z-10 rounded-2xl h-12 border-white/5 bg-white/[0.01] text-[9px] uppercase font-black tracking-[0.2em] hover:bg-white/5">
              Generate Performance Report
            </Button>
          </div>

          {/* AI Optimizer Card */}
          <div className="relative p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 space-y-4 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-center gap-3 text-indigo-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Insights</span>
            </div>
            <p className="relative z-10 text-xs text-zinc-400 font-medium leading-relaxed">
              Based on your activity pattern, your reports are <span className="text-white font-bold">2.4x</span> more likely to reach "Resolved" status due to high-fidelity descriptions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
