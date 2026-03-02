import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, UserCog, ShieldAlert, Activity, Users, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const USERS = [
  { id: 'USR-001', name: 'Priya Sharma', role: 'Citizen', status: 'Active', joined: '2025-09-15' },
  { id: 'POL-001', name: 'Corporator Ramesh Babu', role: 'Politician', status: 'Verified', joined: '2025-08-20' },
  { id: 'POL-002', name: 'MLA Kavitha Reddy', role: 'Politician', status: 'Verified', joined: '2025-07-12' },
  { id: 'USR-034', name: 'Venkat Subramaniam', role: 'Citizen', status: 'Active', joined: '2025-10-01' },
  { id: 'ADM-001', name: 'Sunil Kumar (GHMC)', role: 'Admin', status: 'Active', joined: '2025-06-01' },
  { id: 'USR-078', name: 'Meera Patel', role: 'Citizen', status: 'Active', joined: '2025-11-18' },
  { id: 'POL-003', name: 'Corporator Suresh Goud', role: 'Politician', status: 'Active', joined: '2025-09-05' },
  { id: 'USR-089', name: 'Fatima Begum', role: 'Citizen', status: 'Suspended', joined: '2026-01-10' },
];

export function AdminDashboard() {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-10 pb-32 pt-6">
      <div className="relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">System Administration</h1>
            <p className="text-zinc-500 font-medium">Manage user accounts and platform configuration.</p>
          </div>
          <Button variant="secondary" className="border-white/10 hover:bg-white/10">
            <Settings className="mr-2 h-4 w-4" /> System Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", val: "14,204", sub: "+12% this month", icon: <Users className="h-4 w-4 text-blue-500" /> },
          { label: "Verified Officials", val: "520", sub: "14 PENDING", icon: <ShieldAlert className="h-4 w-4 text-emerald-500" /> },
          { label: "Daily Active", val: "3,842", sub: "LIVE NOW", icon: <Activity className="h-4 w-4 text-violet-500" /> },
          { label: "System Health", val: "99.9%", sub: "NOMINAL", icon: <UserCog className="h-4 w-4 text-emerald-400" /> },
        ].map(stat => (
          <motion.div key={stat.label} variants={item}>
            <Card className="bg-white/[0.02] border-white/5 h-full hover:bg-white/[0.04] transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-white">{stat.val}</div>
                <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="space-y-6">
        <Card className="bg-white/[0.02] border-white/5 overflow-hidden rounded-3xl">
          <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">User Management</CardTitle>
              <CardDescription className="text-zinc-600">Review and manage citizen and official profiles</CardDescription>
            </div>
            <div className="w-full lg:w-96">
              <Input icon={<Search className="h-4 w-4" />} placeholder="Search users by name or ID..." className="bg-white/5 border-white/10 h-11 rounded-xl" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-white/[0.03] text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-5">User ID</th>
                  <th className="px-10 py-5">Full Name</th>
                  <th className="px-10 py-5">System Role</th>
                  <th className="px-10 py-5">Current Status</th>
                  <th className="px-10 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-5 font-mono text-[10px] text-zinc-500">{user.id}</td>
                    <td className="px-10 py-5 font-bold text-white transition-all">{user.name}</td>
                    <td className="px-10 py-5">
                      <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Politician' ? 'success' : 'outline'} className="text-[9px] px-3 lowercase font-semibold">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-2">
                         <div className={cn("h-1.5 w-1.5 rounded-full", user.status === 'Active' || user.status === 'Verified' ? 'bg-emerald-500' : 'bg-red-500')} />
                         <span className={cn("text-[10px] font-bold uppercase tracking-widest", user.status === 'Active' || user.status === 'Verified' ? 'text-emerald-500/80' : 'text-red-500/80')}>{user.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-right">
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl hover:bg-white/10 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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
