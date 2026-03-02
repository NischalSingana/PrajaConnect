import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, Flag, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { TransparencyGauge } from '../components/ui/TransparencyGauge';
import { SlaBadge } from '../components/ui/SlaBadge';
import { useLocalStore } from '@/hooks/useLocalStore';

// Temporary fallback Data for Dashboard widgets until real Analytics API is hooked up
const TEMP_POLITICIAN = {
  district: "Ward 78 — Kukatpally",
  transparencyScore: 82,
  avgResponseTimeHours: 14.5,
  resolutionRate: 78
};

const TEMP_ANALYTICS = {
  resolutionTrend: [
    { name: 'Sep', reported: 98, resolved: 72 },
    { name: 'Oct', reported: 134, resolved: 95 },
    { name: 'Nov', reported: 156, resolved: 120 },
    { name: 'Dec', reported: 142, resolved: 138 },
    { name: 'Jan', reported: 178, resolved: 155 },
    { name: 'Feb', reported: 162, resolved: 170 },
  ]
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function PoliticianDashboard() {
  const { issues } = useLocalStore();
  const urgentIssues = issues.filter(i => i.escalationLevel !== 'Normal' || i.status === 'Pending').slice(0, 5);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-10 pb-32 pt-6"
    >
      {/* Header */}
      <div className="relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">District Overview</h1>
            <p className="text-zinc-500 font-medium">Monitoring {TEMP_POLITICIAN.district} infrastructure and public response.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="border-white/10 hover:bg-white/10"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none">Broadcast Update</Button>
          </div>
        </div>
      </div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-4">
        {/* Transparency Score Card */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="bg-white/[0.02] border-white/5 h-full flex flex-col justify-center items-center py-10 relative overflow-hidden group rounded-3xl">
            <TransparencyGauge score={TEMP_POLITICIAN.transparencyScore} />
            <div className="mt-4 text-center">
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Global Rating</p>
               <h3 className="text-white font-bold text-lg leading-tight">Civic Transparency</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-3 grid gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-white/[0.02] border-white/5 p-2 rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Response Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{TEMP_POLITICIAN.avgResponseTimeHours}h</div>
              <p className="text-xs font-bold text-indigo-400 mt-2 flex items-center">
                 <Sparkles className="h-3 w-3 mr-1" /> OPTIMIZED
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/[0.02] border-white/5 p-2 rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-500">{TEMP_POLITICIAN.resolutionRate}%</div>
              <p className="text-xs font-bold text-emerald-500/80 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> IMPROVING</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500/[0.02] border-red-500/10 p-2 rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-500">{issues.length * 12}</div>
              <p className="text-xs font-bold text-red-500/80 mt-1 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> ACTION REQUIRED</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart Section */}
      <motion.div variants={item}>
        <Card className="bg-white/[0.02] border-white/5 p-8 rounded-3xl">
          <CardHeader className="mb-8 p-0">
            <CardTitle className="text-2xl font-bold text-white">Resolution Trend</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">Monthly performance across reported vs resolved issues</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEMP_ANALYTICS.resolutionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                <XAxis dataKey="name" stroke="#444" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'white', opacity: 0.03 }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px' }}
                />
                <Bar dataKey="reported" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={24} name="Reported" />
                <Bar dataKey="resolved" fill="#0ea5e9" radius={[6, 6, 6, 6]} barSize={24} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Table Section */}
      <motion.div variants={item} className="space-y-6">
        <div className="flex items-center gap-2 px-2">
           <Flag className="h-4 w-4 text-red-500" />
           <h2 className="text-xl font-bold text-white">Urgent Actions Required</h2>
        </div>
        
        <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/[0.02] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-white/[0.03] text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Issue ID</th>
                  <th className="px-8 py-5">Title</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">SLA Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {urgentIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-5 font-mono text-[10px] text-zinc-500">{issue.id}</td>
                    <td className="px-8 py-5 font-bold text-white group-hover:text-indigo-400 transition-all">{issue.title}</td>
                    <td className="px-8 py-5">
                      {issue.escalationLevel !== 'Normal' ? (
                         <Badge variant="destructive" className="px-3 lowercase font-semibold truncate max-w-[100px]">{issue.escalationLevel}</Badge>
                      ) : (
                         <Badge variant="outline" className="px-3 lowercase font-semibold">Standard</Badge>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
