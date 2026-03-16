import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Shield, Flag, CheckCircle, Scale, Activity } from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const FLAGGED_CONTENT = [
  { id: 'FLG-001', user: 'Rahul M.', type: 'Comment', reason: 'Disrespectful Language', priority: 'High', time: '2h ago' },
  { id: 'FLG-002', user: 'Anjali S.', type: 'Issue Report', reason: 'Duplicate / Spam', priority: 'Medium', time: '5h ago' },
  { id: 'FLG-003', user: 'Suresh K.', type: 'Comment', reason: 'Inappropriate Content', priority: 'Critical', time: '10m ago' },
  { id: 'FLG-004', user: 'Priya P.', type: 'Feedback', reason: 'Off-topic', priority: 'Low', time: '1d ago' },
];

export function ModeratorDashboard() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-10 pb-32 pt-6">
      {/* Header */}
      <div className="relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
              <Shield className="h-3 w-3" /> Content Oversight
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Moderator Hub</h1>
            <p className="text-zinc-500 font-medium">Monitoring platform integrity and community standards.</p>
          </div>
          <Button className="bg-amber-600 hover:bg-amber-500 text-white border-none shadow-lg shadow-amber-600/10">
            <Scale className="mr-2 h-4 w-4" /> Review Queue
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Pending Flags", val: "12", sub: "4 CRITICAL", icon: <Flag className="h-4 w-4 text-red-500" /> },
          { label: "Resolved Today", val: "45", sub: "+5 from yesterday", icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
          { label: "Reports Filtered", val: "1.2k", sub: "LAST 30 DAYS", icon: <Shield className="h-4 w-4 text-blue-500" /> },
          { label: "Avg. Review Time", val: "14m", sub: "WITHIN SLA", icon: <Activity className="h-4 w-4 text-amber-500" /> },
        ].map(stat => (
          <motion.div key={stat.label} variants={item}>
            <Card className="bg-white/[0.02] border-white/5 h-full hover:bg-white/[0.04] transition-all group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">{stat.val}</div>
                <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Moderation Queue */}
      <motion.div variants={item} className="space-y-6">
        <Card className="bg-white/[0.02] border-white/5 overflow-hidden rounded-3xl">
          <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-white">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Flagged Interactions</CardTitle>
              <CardDescription className="text-zinc-600 font-medium">Investigate and resolve community conflict reports.</CardDescription>
            </div>
            <div className="w-full lg:w-96">
              <Input icon={<Search className="h-4 w-4" />} placeholder="Search by user or reason..." className="bg-white/5 border-white/10 h-11 rounded-xl" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-white/[0.03] text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-5">Flag ID</th>
                  <th className="px-10 py-5">Reporter/Target</th>
                  <th className="px-10 py-5">Category</th>
                  <th className="px-10 py-5">Priority</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FLAGGED_CONTENT.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-5 font-mono text-[10px] text-zinc-500">{item.id}</td>
                    <td className="px-10 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-amber-400 transition-all">{item.user}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{item.time}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                       <div className="flex flex-col gap-1">
                         <span className="text-white font-medium">{item.type}</span>
                         <span className="text-[10px] text-zinc-500">{item.reason}</span>
                       </div>
                    </td>
                    <td className="px-10 py-5">
                      <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'warning' : 'outline'} className="text-[9px] px-3 lowercase font-semibold">
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="px-10 py-5 text-right space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white">Dismiss</Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest border-amber-500/20 text-amber-500 hover:bg-amber-500/10">Take Action</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
