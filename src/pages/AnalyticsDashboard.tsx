import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Target, TrendingUp, Users, AlertTriangle, Activity, Globe } from 'lucide-react';
import { useLocalStore } from '@/hooks/useLocalStore';

// Temporary fallback Data for Dashboard widgets until real Analytics API is hooked up
const TEMP_ANALYTICS = {
  issuesByCategory: [
    { name: 'Infrastructure', value: 520 },
    { name: 'Sanitation', value: 380 },
    { name: 'Safety', value: 290 },
    { name: 'General', value: 130 },
  ],
  resolutionTrend: [
    { name: 'Sep', reported: 98, resolved: 72 },
    { name: 'Oct', reported: 134, resolved: 95 },
    { name: 'Nov', reported: 156, resolved: 120 },
    { name: 'Dec', reported: 142, resolved: 138 },
    { name: 'Jan', reported: 178, resolved: 155 },
    { name: 'Feb', reported: 162, resolved: 170 },
  ],
  wardHeatmap: [
    { ward: 'Ward 78 - Kukatpally', count: 210 },
    { ward: 'Ward 120 - Chandrayangutta', count: 380 },
    { ward: 'Ward 55 - Begumpet', count: 95 },
    { ward: 'Serilingampally', count: 145 },
    { ward: 'Khairatabad', count: 175 },
    { ward: 'Jubilee Hills', count: 88 },
  ],
  topPoliticians: [
    { id: '1', name: 'Corporator Ramesh Babu', district: 'Ward 78', transparencyScore: 82 },
    { id: '2', name: 'MLA Kavitha Reddy', district: 'Serilingampally', transparencyScore: 94 },
    { id: '3', name: 'Corporator Anitha Kumari', district: 'Ward 55', transparencyScore: 88 },
  ]
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

export function AnalyticsDashboard() {
  const { issues } = useLocalStore();
  
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-10 pb-32 pt-6">
      <div className="relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Analytics</h1>
          <p className="text-zinc-500 font-medium">Real-time engagement and resolution metrics across all districts.</p>
        </div>
      </div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 h-full hover:bg-white/[0.04] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Adoption</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-white">48,291</div>
              <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center">
                 <TrendingUp className="h-3 w-3 mr-1" /> +12.4% increase
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 h-full hover:border-red-500/30 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">SLA Breaches</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-red-500">
                 {issues.filter(i => i.escalationLevel !== 'Normal').length}
              </div>
              <p className="text-xs font-bold text-zinc-600 mt-2 uppercase tracking-widest">
                 System Critical
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="bg-white/[0.02] border-white/5 h-full overflow-hidden">
            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
              <div className="flex-1 p-8 border-b sm:border-b-0 sm:border-r border-white/5 hover:bg-white/[0.01] transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Avg. Resolution Time</p>
                <div className="text-3xl font-bold text-indigo-400">2.4<span className="text-lg text-zinc-600 font-semibold ml-2">Days</span></div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[85%]" />
                </div>
              </div>
               <div className="flex-1 p-8 hover:bg-white/[0.01] transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Petitions Completed</p>
                <div className="text-3xl font-bold text-blue-400">14<span className="text-lg text-zinc-600 font-semibold ml-2">Total</span></div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[62%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Resolution Trend */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="bg-white/[0.02] border-white/5 p-6">
            <CardHeader className="mb-8 flex justify-between items-center p-0">
              <div>
                <CardTitle className="text-xl font-bold text-white">Resolution Trend</CardTitle>
                <CardDescription className="text-zinc-500">Tracking performance over the last 6 months</CardDescription>
              </div>
              <Activity className="h-6 w-6 text-indigo-500/50" />
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TEMP_ANALYTICS.resolutionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                  <XAxis dataKey="name" stroke="#444" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} />
                  <YAxis stroke="#444" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: '600' }}
                  />
                  <Area type="monotone" dataKey="reported" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                  <Area type="monotone" dataKey="resolved" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories (Pie Chart) */}
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 p-6 h-full flex flex-col">
            <CardHeader className="mb-4 p-0">
              <CardTitle className="text-xl font-bold text-white">Issue Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 h-[300px] flex items-center justify-center p-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TEMP_ANALYTICS.issuesByCategory}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {TEMP_ANALYTICS.issuesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #222', backgroundColor: '#000' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', color: '#888' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-2">
        {/* Transparency Leaderboard */}
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 p-8 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-6 p-0">
              <CardTitle className="text-xl font-bold text-white">Transparency Ranking</CardTitle>
              <Target className="h-5 w-5 text-indigo-500/50" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                {TEMP_ANALYTICS.topPoliticians.map((pol, index) => (
                  <div key={pol.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-bold text-zinc-500 text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{pol.name}</p>
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{pol.district}</p>
                      </div>
                    </div>
                    <div className="w-24 flex justify-end">
                       <div className="text-right">
                          <p className="text-lg font-bold text-white">{pol.transparencyScore}%</p>
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                             <div className="h-full bg-emerald-500" style={{ width: `${pol.transparencyScore}%` }} />
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ward Heatmap Stats */}
        <motion.div variants={item}>
          <Card className="bg-white/[0.02] border-white/5 p-8 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-6 p-0">
              <CardTitle className="text-xl font-bold text-white">Geographic Distribution</CardTitle>
              <Globe className="h-5 w-5 text-blue-500/50" />
            </CardHeader>
            <CardContent className="p-0">
               <div className="space-y-6">
                  {TEMP_ANALYTICS.wardHeatmap.sort((a,b) => b.count - a.count).map((ward) => {
                    const max = Math.max(...TEMP_ANALYTICS.wardHeatmap.map(w => w.count));
                    const percentage = (ward.count / max) * 100;
                    return (
                      <div key={ward.ward} className="group">
                         <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                           <span className="text-zinc-500">{ward.ward}</span>
                           <span className="text-zinc-600">{ward.count} Issues</span>
                         </div>
                         <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-indigo-500/50"
                              style={{ 
                                backgroundColor: percentage > 70 ? '#ef4444' : ''
                              }}
                            />
                         </div>
                      </div>
                    )
                  })}
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
