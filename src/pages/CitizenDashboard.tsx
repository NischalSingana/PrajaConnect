import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SlaBadge } from '../components/ui/SlaBadge';
import { PlusCircle, MapPin, MessageSquare, Award, Star, TrendingUp, Sparkles } from 'lucide-react';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';

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
  const { issues, user } = useLocalStore();
  
  if (!user) return null;

  const myIssues = issues.filter(i => i.reporterId === user.id);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-10 pb-32 pt-6"
    >
      {/* Header */}
      <div className="relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Citizen Overview</h1>
            <p className="text-zinc-500 font-medium">Welcome back, {user.name}. Here is your community activity summary.</p>
          </div>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-indigo-500/20 shadow-lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Report Issue
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Reputation Badge */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/10 relative overflow-hidden h-full">
            <div className="absolute -right-6 -top-6 opacity-10">
              <Award className="w-32 h-32 text-indigo-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Community Reputation</CardTitle>
              <Star className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              <div className="text-4xl font-bold text-white">{user.reputationScore}</div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {user.badges.map(b => (
                  <Badge key={b} variant="outline" className="bg-white/5 text-[9px] border-white/5 text-zinc-400 lowercase font-medium">
                    {b}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 h-full transition-all hover:bg-white/[0.04]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Reports</CardTitle>
              <MapPin className="h-3.5 w-3.5 text-indigo-500/50" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-4xl font-bold text-white">{myIssues.length}</div>
              <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Active Tickets</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 h-full transition-all hover:bg-white/[0.04]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resolved Issues</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500/50" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-4xl font-bold text-emerald-500">
                 {myIssues.filter(i => i.status === 'Resolved').length}
              </div>
              <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 h-full transition-all hover:bg-white/[0.04]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Global Upvotes</CardTitle>
              <Sparkles className="h-3.5 w-3.5 text-blue-500/50" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-4xl font-bold text-white">
                 {myIssues.reduce((sum, issue) => sum + issue.upvotes, 0).toLocaleString()}
              </div>
              <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Signatures</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Reports Section */}
      <div className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-white">Recent Reports</h2>
          <Button variant="ghost" size="sm" className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">View Analytics</Button>
        </motion.div>
        
        <motion.div variants={container} className="grid grid-cols-1 gap-4">
          {myIssues.length === 0 ? (
             <Card className="p-20 text-center border-dashed border-white/5 bg-white/[0.01]">
                <p className="text-zinc-600 font-medium italic">You haven't reported any issues yet.</p>
             </Card>
          ) : (
            myIssues.map((issue) => (
              <motion.div
                key={issue.id}
                variants={item}
                whileHover={{ x: 4 }}
                className="transition-all"
              >
                <Card className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 cursor-pointer group rounded-2xl">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
                    <div className={cn(
                      "h-12 w-1 rounded-full shrink-0",
                      issue.status === 'Resolved' ? "bg-emerald-500" : issue.status === 'In Progress' ? "bg-amber-500" : "bg-zinc-800"
                    )} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-all">{issue.title}</h3>
                        {issue.isPetition && (
                           <Badge className="text-[8px] px-2 bg-indigo-500/10 text-indigo-400 border-none uppercase font-bold tracking-widest">Petition</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                        <span className="font-mono text-[10px]">{issue.id}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> {issue.commentsCount} Comments</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 mt-6 md:mt-0">
                    <Badge 
                      className={cn(
                        "text-[9px] px-3 font-bold uppercase tracking-wider border-none",
                        issue.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-500" : 
                        issue.status === 'In Progress' ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-zinc-400"
                      )}
                    >
                      {issue.status}
                    </Badge>
                    <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
      
      {/* Mobile Floating Trigger */}
      <Button className="fixed bottom-10 right-10 h-14 w-14 rounded-full shadow-2xl sm:hidden border-none bg-indigo-600 text-white" size="icon">
        <PlusCircle className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
