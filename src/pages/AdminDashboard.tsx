import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, ShieldAlert, Activity, UserCog, Search, ChevronDown, Loader2, RefreshCw, Radio, Send, Database, Network } from 'lucide-react';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const ROLES = ['citizen', 'politician', 'moderator', 'admin'] as const;
type Role = typeof ROLES[number];

const ROLE_COLORS = {
  admin: '#ef4444',      // red-500
  politician: '#10b981', // emerald-500
  moderator: '#f59e0b',  // amber-500
  citizen: '#3b82f6',    // blue-500
};

const roleStyle: Record<string, string> = {
  admin: 'border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  politician: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  moderator: 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  citizen: 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
};

interface DBUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { stats, fetchUsers, changeUserRole, refreshData } = useStore();
  const { user } = useUser();
  const navigate = useNavigate();
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Broadcast
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Mock server metrics generator
  const [metricData, setMetricData] = useState<{ time: string; cpu: number; memory: number; reqs: number }[]>([]);

  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = new Date();
      for (let i = 20; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60000);
        data.push({
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cpu: 20 + Math.random() * 40,
          memory: 45 + Math.random() * 10,
          reqs: 100 + Math.random() * 500,
        });
      }
      return data;
    };
    setMetricData(generateData());
    const interval = setInterval(() => {
      setMetricData(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cpu: 20 + Math.random() * 40,
          memory: 45 + Math.random() * 10,
          reqs: 100 + Math.random() * 500,
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    const data = await fetchUsers();
    setDbUsers(data);
    setLoadingUsers(false);
  }, [fetchUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    const ok = await changeUserRole(userId, newRole);
    if (ok) {
      setDbUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (user && user.id === userId) {
         await user.reload(); // Force Clerk to fetch the new token with updated publicMetadata
         await refreshData();
         navigate(`/dashboard/${newRole}`);
      }
    }
    setUpdatingId(null);
  };

  const handleBroadcast = () => {
    if(!broadcastMsg.trim()) return;
    setBroadcasting(true);
    setTimeout(() => {
       setBroadcasting(false);
       setBroadcastSent(true);
       setBroadcastMsg('');
       setTimeout(() => setBroadcastSent(false), 3000);
    }, 1500);
  };

  const filtered = dbUsers.filter(u => {
    const matchSearch = search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleDistribution = useMemo(() => {
    const counts = { admin: 0, politician: 0, moderator: 0, citizen: 0 };
    dbUsers.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [dbUsers]);

  const officials = dbUsers.filter(u => u.role !== 'citizen' && u.role !== 'admin').length;

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-[90rem] mx-auto px-4 lg:px-8">

      {/* Header */}
      <motion.div variants={item} className="relative p-10 lg:p-14 rounded-[3rem] bg-zinc-950 border border-red-500/20 overflow-hidden shadow-[0_30px_60px_rgba(239,68,68,0.05)]">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[130px] rounded-full -mr-40 -mt-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <UserCog className="h-4 w-4" /> Root Access Established
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Global Platform <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Administration</span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-xl leading-relaxed text-sm">Top-level command interface. Modifying core platform configuration and monitoring global civic network health.</p>
          </div>
          <div className="flex bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl shadow-inner backdrop-blur-sm self-start lg:self-auto gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">API Active</span>
            </div>
            <button onClick={loadUsers} disabled={loadingUsers}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
              <RefreshCw className={cn('h-4 w-4', loadingUsers && 'animate-spin')} /> {loadingUsers ? 'Syncing...' : 'Force Sync Data'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-4">
        
        {/* Core KPIs */}
        <motion.div variants={container} className="xl:col-span-1 grid gap-4">
          {[
            { label: 'Registered Network', val: stats.citizens || dbUsers.length, sub: 'Total User Profiles', icon: <Users className="h-5 w-5 text-blue-400" />, accent: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
            { label: 'Platform Operations', val: officials, sub: 'Verified Authority Accounts', icon: <ShieldAlert className="h-5 w-5 text-emerald-400" />, accent: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
            { label: 'Total Infrastructure Health', val: '99.9%', sub: 'System Uptime', icon: <Activity className="h-5 w-5 text-violet-400" />, accent: 'text-violet-400', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]' },
          ].map((stat, i) => (
            <motion.div key={i} variants={item}
              className={cn("p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-950 relative overflow-hidden transition-colors hover:bg-zinc-900 group", stat.glow)}>
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 scale-150 transition-all duration-500 text-white">{stat.icon}</div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
                <div className="h-9 w-9 rounded-xl bg-white/[0.03] flex items-center justify-center transition-transform border border-white/[0.05]">
                  {stat.icon}
                </div>
              </div>
              <div className={cn('text-3xl font-black relative z-10', stat.accent)}>{stat.val}</div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1 relative z-10">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Server Metrics Area Chart */}
        <motion.div variants={item} className="xl:col-span-3 p-8 rounded-[2.5rem] bg-zinc-950 border border-white/[0.05] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div className="flex items-center gap-3">
               <Database className="h-6 w-6 text-red-500" />
               <div>
                  <h2 className="text-xl font-black text-white tracking-tight">System Telemetry & Load</h2>
                  <p className="text-zinc-500 text-sm font-medium mt-1">Live infrastructure monitoring across PrajaConnect nodes</p>
               </div>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-0">
               <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400"><span className="h-2 w-2 rounded-full bg-red-500"/> CPU Load</div>
               <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400"><span className="h-2 w-2 rounded-full bg-violet-500"/> Memory Allocation</div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={metricData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                 <XAxis dataKey="time" stroke="#666" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                 <YAxis stroke="#666" fontSize={10} fontWeight="600" tickLine={false} axisLine={false} />
                 <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #1f1f22', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                 />
                 <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" activeDot={{ r: 6, fill: '#8b5cf6' }} name="Mem Usage %" />
                 <Area type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" activeDot={{ r: 6, fill: '#ef4444' }} name="CPU Load %" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
         {/* Role Distribution & Emergency Broadcast */}
         <div className="xl:col-span-1 grid gap-6">
            <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-zinc-950 border border-white/[0.05]">
               <h2 className="text-sm font-black text-white tracking-[0.15em] uppercase mb-6 flex items-center gap-2"><Network className="h-4 w-4 text-emerald-400"/> Network Topology</h2>
               <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={roleDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {roleDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name as Role] || ROLE_COLORS.citizen} />
                         ))}
                       </Pie>
                       <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #1f1f22', borderRadius: '8px', fontSize: '10px' }} />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-white">{dbUsers.length}</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-4">
                  {roleDistribution.map((entry) => (
                     <div key={entry.name} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
                           <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[entry.name as Role] }}></span>
                           {entry.name}
                        </span>
                        <span className="text-[10px] font-black text-white">{entry.value}</span>
                     </div>
                  ))}
               </div>
            </motion.div>

            <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-red-950/20 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.05)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[50px]" />
               <h2 className="text-sm font-black text-white tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
                 <Radio className="h-5 w-5 text-red-500 animate-pulse"/> Global Broadcast
               </h2>
               <p className="text-xs text-zinc-400 mb-6 font-medium">Push an emergency push notification to all connected clients immediately.</p>
               
               <AnimatePresence mode="wait">
                  {broadcastSent ? (
                     <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="h-32 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                        <BroadcastSuccessIndicator />
                     </motion.div>
                  ) : (
                     <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4 relative z-10">
                        <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                           className="w-full h-24 bg-black/50 border border-red-500/30 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-500/50 focus:outline-none resize-none leading-relaxed" 
                           placeholder="WARNING: This message overrides all priority channels..."/>
                        <button onClick={handleBroadcast} disabled={broadcasting || !broadcastMsg.trim()}
                           className="w-full h-12 bg-red-600 hover:bg-red-500 text-white text-[10px] uppercase font-black tracking-widest rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                           {broadcasting ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Send className="h-4 w-4"/> Transmit Intercept</>}
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>
         </div>

         {/* User Management Table */}
         <motion.div variants={item} className="xl:col-span-2 space-y-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
             <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase">User Access Control</h2>
             <div className="flex gap-3 flex-wrap">
               <div className="flex bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-2xl shadow-inner backdrop-blur-sm self-start md:self-auto">
                 {['All', ...ROLES].map(r => (
                   <button key={r} onClick={() => setRoleFilter(r)}
                     className={cn('px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300',
                       roleFilter === r ? 'bg-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5')}>
                     {r}
                   </button>
                 ))}
               </div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                 <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search ID or Email..."
                   className="pl-11 pr-4 h-11 rounded-2xl border border-white/[0.06] bg-zinc-950 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 w-full sm:w-56 shadow-inner" />
               </div>
             </div>
           </div>

           <div className="rounded-[2.5rem] border border-white/[0.05] overflow-hidden bg-zinc-950 shadow-2xl h-[calc(100%-4rem)]">
             {loadingUsers ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                 <p className="text-[10px] font-black tracking-widest uppercase text-zinc-600">Accessing Root Database...</p>
               </div>
             ) : filtered.length === 0 ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3">
                 <Users className="h-10 w-10 text-zinc-800" />
                 <p className="text-zinc-600 text-sm font-medium uppercase tracking-widest text-[10px] font-black">No entities matched.</p>
               </div>
             ) : (
               <div className="overflow-x-auto h-full max-h-[800px] no-scrollbar">
                 <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                   <thead className="bg-[#0f0f13] text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] sticky top-0 z-20">
                     <tr>
                       <th className="px-6 py-5">Network Entity</th>
                       <th className="px-6 py-5">Authority Level</th>
                       <th className="px-6 py-5">Instantiation</th>
                       <th className="px-6 py-5 text-right">SysAdmin Overrides</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                     {filtered.map(u => (
                       <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                             <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name}
                               className="h-10 w-10 rounded-xl object-cover border border-white/10 shadow-lg" />
                             <div>
                               <p className="font-bold text-white group-hover:text-red-400 transition-colors text-[13px]">{u.name}</p>
                               <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{u.email}</p>
                               <p className="text-[8px] text-zinc-700 font-mono mt-0.5 uppercase">ID: {u.id.slice(0, 15)}…</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-5">
                           <span className={cn('px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5', roleStyle[u.role] ?? roleStyle.citizen)}>
                             {u.role}
                           </span>
                         </td>
                         <td className="px-6 py-5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                           {new Date(u.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-5 text-right">
                           {updatingId === u.id ? (
                             <div className="flex justify-end pr-8"><Loader2 className="h-5 w-5 animate-spin text-red-500" /></div>
                           ) : (
                             <div className="relative inline-block min-w-[150px]">
                               <select
                                 value={u.role}
                                 onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                                 className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-white/[0.08] bg-black text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:border-red-500/50 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
                               >
                                 {ROLES.map(r => <option key={r} value={r} className="bg-zinc-900 text-white normal-case">{r}</option>)}
                               </select>
                               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-zinc-500" />
                             </div>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         </motion.div>
      </div>

    </motion.div>
  );
}

function BroadcastSuccessIndicator() {
  return (
    <div className="flex flex-col items-center">
      <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
        <Send className="h-5 w-5 text-white" />
      </div>
      <p className="text-white font-bold text-xs">TRANSMISSION COMPLETE</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-red-300">All nodes alerted.</p>
    </div>
  )
}
