import { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Target, TrendingUp, Users, AlertTriangle, Activity, Globe, CheckCircle2, Zap } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; trend?: string;
}) {
  return (
    <motion.div variants={item}
      className="p-7 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        <div className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:border-white/10 transition-all">
          {icon}
        </div>
      </div>
      <div className={cn('text-3xl font-black', accent)}>{value}</div>
      {trend && <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{trend}</p>}
      {sub && !trend && <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">{sub}</p>}
    </motion.div>
  );
}

export function AnalyticsDashboard() {
  const { issues, stats } = useStore();

  /* ── Derived real data ── */
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    issues.forEach(i => { map[i.category || 'General'] = (map[i.category || 'General'] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [issues]);

  const statusData = useMemo(() => [
    { name: 'Resolved',    value: issues.filter(i => i.status === 'Resolved').length,    fill: '#10b981' },
    { name: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, fill: '#f59e0b' },
    { name: 'Pending',     value: issues.filter(i => i.status === 'Pending').length,     fill: '#6366f1' },
    { name: 'Escalated',   value: issues.filter(i => i.status === 'Escalated').length,   fill: '#ef4444' },
  ].filter(d => d.value > 0), [issues]);

  const trendData = useMemo(() => {
    const monthMap: Record<string, { reported: number; resolved: number }> = {};
    issues.forEach(i => {
      const m = MONTHS[new Date(i.createdAt).getMonth()];
      if (!monthMap[m]) monthMap[m] = { reported: 0, resolved: 0 };
      monthMap[m].reported++;
      if (i.status === 'Resolved') monthMap[m].resolved++;
    });
    const ordered = MONTHS.filter(m => monthMap[m]).map(m => ({ name: m, ...monthMap[m] }));
    return ordered;
  }, [issues]);

  const locationData = useMemo(() => {
    const map: Record<string, number> = {};
    issues.forEach(i => {
      if (i.location) map[i.location] = (map[i.location] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([ward, count]) => ({ ward: ward.length > 28 ? ward.substring(0, 28) + '…' : ward, count }));
  }, [issues]);

  const slaBreach = issues.filter(i => i.escalationLevel !== 'Normal').length;
  const resolutionRate = issues.length ? Math.round((issues.filter(i => i.status === 'Resolved').length / issues.length) * 100) : 0;
  const petitionCount = issues.filter(i => i.isPetition).length;

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.04] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Activity className="h-3 w-3" /> Live Analytics
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Global Analytics</h1>
            <p className="text-zinc-500 font-medium">Real-time engagement and resolution metrics · {issues.length} total reports</p>
          </div>
          <div className="text-right">
            <div className={cn('text-4xl font-black', resolutionRate >= 70 ? 'text-emerald-400' : resolutionRate >= 40 ? 'text-amber-400' : 'text-red-400')}>
              {resolutionRate}%
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Resolution Rate</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Citizens" value={stats.citizens.toLocaleString()} icon={<Users className="h-4 w-4 text-indigo-400" />} accent="text-white" trend="+12.4% this month" />
        <StatCard label="SLA Breaches" value={slaBreach} sub="Needs attention" icon={<AlertTriangle className="h-4 w-4 text-red-400" />} accent="text-red-400" />
        <StatCard label="Avg. Resolution" value={stats.avgResponseTime} sub="Audit verified" icon={<Zap className="h-4 w-4 text-indigo-400" />} accent="text-indigo-400" />
        <StatCard label="Petitions Filed" value={petitionCount} sub="Community driven" icon={<Target className="h-4 w-4 text-blue-400" />} accent="text-blue-400" />
      </motion.div>

      {/* Charts row 1 */}
      <motion.div variants={container} className="grid gap-6 lg:grid-cols-3">

        {/* Resolution trend chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.04] bg-zinc-900/10 h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-white">Resolution Trend</h2>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Reports vs. Resolved over time</p>
              </div>
              <Activity className="h-5 w-5 text-indigo-500/40" />
            </div>
            {trendData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-zinc-700 text-sm font-bold">Insufficient data for trends</div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff04" />
                    <XAxis dataKey="name" stroke="#444" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                    <YAxis stroke="#444" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #1f1f2e', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} itemStyle={{ fontWeight: 700, fontSize: 12 }} />
                    <Area type="monotone" dataKey="reported" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradReported)" name="Reported" />
                    <Area type="monotone" dataKey="resolved" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#gradResolved)" name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status breakdown pie */}
        <motion.div variants={item}>
          <div className="p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.04] bg-zinc-900/10 h-full flex flex-col">
            <h2 className="text-lg font-black text-white mb-1">Status Breakdown</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6">Current distribution</p>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={70} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #1f1f2e', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status pills */}
            <div className="space-y-2 mt-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div variants={container} className="grid gap-6 lg:grid-cols-2">

        {/* Category bar chart */}
        <motion.div variants={item}>
          <div className="p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.04] bg-zinc-900/10">
            <h2 className="text-lg font-black text-white mb-1">Issues by Category</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8">Real data from reports</p>
            {categoryData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-zinc-700 text-sm font-bold">No data yet</div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff04" />
                    <XAxis type="number" stroke="#444" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#444" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #1f1f2e', borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>

        {/* Geographic distribution */}
        <motion.div variants={item}>
          <div className="p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.04] bg-zinc-900/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-white">Hotspot Areas</h2>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Locations with most reports</p>
              </div>
              <Globe className="h-5 w-5 text-blue-500/40" />
            </div>
            {locationData.length === 0 ? (
              <div className="py-12 text-center text-zinc-700 text-sm font-bold">No location data yet</div>
            ) : (
              <div className="space-y-5">
                {locationData.map((ward, i) => {
                  const max = locationData[0]?.count || 1;
                  const pct = (ward.count / max) * 100;
                  return (
                    <div key={`${ward.ward}-${i}`} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500 truncate max-w-[70%]">{ward.ward}</span>
                        <span className="text-zinc-600 shrink-0 ml-2">{ward.count} issues</span>
                      </div>
                      <div className="w-full bg-white/[0.03] h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#6366f1', opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Resolution rate banner */}
      <motion.div variants={item}>
        <div className="relative p-10 rounded-[2.5rem] border border-white/[0.04] bg-zinc-900/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-emerald-600/5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5" /> Platform Health
              </div>
              <h3 className="text-2xl font-black text-white">System is performing well</h3>
              <p className="text-zinc-500 font-medium">
                {issues.filter(i => i.status === 'Resolved').length.toLocaleString()} of {issues.length.toLocaleString()} issues resolved.
                {slaBreach > 0 && <span className="text-amber-400 font-bold"> {slaBreach} SLA breaches need attention.</span>}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1f1f2e" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={resolutionRate >= 70 ? '#10b981' : resolutionRate >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(resolutionRate / 100) * 314} 314`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{resolutionRate}%</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
