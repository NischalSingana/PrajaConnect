import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import { Users, ShieldAlert, Activity, UserCog, Search, ChevronDown, Loader2, RefreshCw } from 'lucide-react';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const ROLES = ['citizen', 'politician', 'moderator', 'admin'] as const;
type Role = typeof ROLES[number];

const roleStyle: Record<string, string> = {
  admin: 'border-red-500/30 bg-red-500/10 text-red-400',
  politician: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  moderator: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  citizen: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
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
  const { stats, issues, fetchUsers, changeUserRole } = useLocalStore();
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('All');

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
    if (ok) setDbUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setUpdatingId(null);
  };

  const filtered = dbUsers.filter(u => {
    const matchSearch = search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const politicians = dbUsers.filter(u => u.role === 'politician').length;
  const moderators = dbUsers.filter(u => u.role === 'moderator').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-8 pb-32 pt-6 max-w-7xl mx-auto px-4">

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
              <UserCog className="h-3 w-3" /> System Administration
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Admin Control Panel</h1>
            <p className="text-zinc-500 font-medium">Manage users, roles, and platform integrity — real DB data.</p>
          </div>
          <button onClick={loadUsers} disabled={loadingUsers}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50">
            <RefreshCw className={cn('h-4 w-4', loadingUsers && 'animate-spin')} /> Refresh Users
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', val: stats.citizens || dbUsers.length, sub: 'Registered accounts', icon: <Users className="h-4 w-4 text-blue-400" />, accent: 'text-blue-400' },
          { label: 'Officials', val: politicians, sub: `${moderators} moderator(s)`, icon: <ShieldAlert className="h-4 w-4 text-emerald-400" />, accent: 'text-emerald-400' },
          { label: 'Total Issues', val: stats.issues, sub: `${resolvedCount} resolved`, icon: <Activity className="h-4 w-4 text-violet-400" />, accent: 'text-violet-400' },
          { label: 'System Health', val: '99.9%', sub: 'Nominal', icon: <UserCog className="h-4 w-4 text-emerald-400" />, accent: 'text-emerald-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}
            className="p-7 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
              <div className="h-9 w-9 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className={cn('text-3xl font-black', stat.accent)}>{stat.val}</div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* User Management Table */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h2 className="text-lg font-black text-white tracking-[0.15em] uppercase">User Management ({filtered.length})</h2>
          <div className="flex gap-3 flex-wrap">
            {/* Role filter */}
            {['All', ...ROLES].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  roleFilter === r ? 'bg-red-600 border-red-500 text-white' : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/20')}>
                {r}
              </button>
            ))}
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-11 pr-4 h-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 w-52" />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/[0.05] overflow-hidden bg-zinc-900/10">
          {loadingUsers ? (
            <div className="py-16 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
              <p className="text-zinc-600 text-sm font-medium">Loading users from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Users className="h-8 w-8 text-zinc-800" />
              <p className="text-zinc-600 text-sm font-medium">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-white/[0.02] text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                            alt={u.name}
                            className="h-8 w-8 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-red-400 transition-colors">{u.name}</p>
                            <p className="text-[10px] text-zinc-600 font-mono">{u.id.slice(0, 18)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-[11px]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', roleStyle[u.role] ?? roleStyle.citizen)}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-400 inline" />
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                              className="pl-3 pr-7 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-white/20 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                              {ROLES.map(r => <option key={r} value={r} className="bg-zinc-900 text-white normal-case">{r}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-zinc-500" />
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

      {/* Issues Breakdown */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-4">
        {(['Pending', 'In Progress', 'Resolved', 'Escalated'] as const).map(status => {
          const count = issues.filter(i => i.status === status).length;
          const pct = issues.length > 0 ? Math.round((count / issues.length) * 100) : 0;
          const color = { Resolved: 'bg-emerald-500', 'In Progress': 'bg-amber-500', Escalated: 'bg-red-500', Pending: 'bg-zinc-600' }[status];
          return (
            <div key={status} className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">{status}</p>
              <p className="text-2xl font-black text-white mb-3">{count}</p>
              <div className="w-full bg-white/[0.03] h-1.5 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">{pct}% of total</p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
