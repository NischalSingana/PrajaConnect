import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Files, User, Settings, Users,
  BarChart4, Shield, Map, Bell, Inbox, AlertOctagon, ChevronLeft, Menu,
  X, LogOut, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from '../ui/NotificationBell';
import { useUser, UserButton, useClerk } from '@clerk/clerk-react';
import { useStore } from '../../context/StoreContext';

const ROLE_COLORS: Record<string, { badge: string; dot: string; label: string }> = {
  citizen:    { badge: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',  dot: 'bg-indigo-500',  label: 'Citizen' },
  politician: { badge: 'border-blue-500/20 bg-blue-500/5 text-blue-400',        dot: 'bg-blue-500',    label: 'Politician' },
  moderator:  { badge: 'border-violet-500/20 bg-violet-500/5 text-violet-400',  dot: 'bg-violet-500',  label: 'Moderator' },
  admin:      { badge: 'border-red-500/20 bg-red-500/5 text-red-400',           dot: 'bg-red-500',     label: 'Admin' },
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { notifications, user: storeUser } = useStore();

  const role = (user?.publicMetadata?.role as string) || 'citizen';
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.citizen;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { name: 'Dashboard',    icon: LayoutDashboard, path: `/dashboard/${role}`,       group: 'main' },
    { name: 'Public Feed',  icon: Files,           path: '/dashboard/issues',         group: 'main' },
    { name: 'Issue Map',    icon: Map,             path: '/dashboard/map',            group: 'main' },
    { name: 'Notifications',icon: Bell,            path: '/dashboard/notifications',  group: 'main', badge: unreadCount },
    ...(role === 'citizen' ? [
      { name: 'My Issues',  icon: Inbox,           path: '/dashboard/my-issues',      group: 'citizen' },
    ] : []),
    ...(role === 'politician' ? [
      { name: 'Escalations',icon: AlertOctagon,    path: '/dashboard/escalations',    group: 'work' },
    ] : []),
    ...(role === 'moderator' ? [
      { name: 'Review Queue',icon: Shield,         path: '/dashboard/moderator',      group: 'work' },
      { name: 'Escalations',icon: AlertOctagon,    path: '/dashboard/escalations',    group: 'work' },
    ] : []),
    ...(role === 'admin' ? [
      { name: 'Analytics',  icon: BarChart4,       path: '/dashboard/analytics',      group: 'admin' },
      { name: 'Manage Users',icon: Users,          path: '/dashboard/admin',          group: 'admin' },
      { name: 'Escalations',icon: AlertOctagon,    path: '/dashboard/escalations',    group: 'admin' },
    ] : []),
    { name: 'Profile',      icon: User,            path: '/dashboard/profile',        group: 'account' },
    { name: 'Settings',     icon: Settings,        path: '/dashboard/settings',       group: 'account' },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && path !== '/issues' && location.pathname.startsWith(path));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.04] shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-base font-black text-white tracking-tight whitespace-nowrap overflow-hidden"
              >
                PrajaConnect
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="hidden lg:flex h-7 w-7 rounded-lg items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* User Card */}
      <div className="px-3 py-4 border-b border-white/[0.04] shrink-0">
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]',
          !sidebarOpen && 'justify-center'
        )}>
          <div className="relative shrink-0">
            <img
              src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`}
              alt=""
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black', roleStyle.dot)} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-black text-white truncate">{user?.firstName || 'Citizen'}</p>
                <div className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest mt-0.5', roleStyle.badge)}>
                  {roleStyle.label}
                  {storeUser?.reputationScore ? <span className="flex items-center gap-0.5"><Star className="h-2 w-2" />{storeUser.reputationScore}</span> : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-150 relative group',
                active
                  ? 'bg-indigo-600/10 border border-indigo-500/15 text-indigo-400'
                  : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent'
              )}
            >
              <item.icon className={cn('shrink-0 h-4 w-4 transition-colors', active ? 'text-indigo-400' : 'text-zinc-700 group-hover:text-zinc-400')} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="ml-auto shrink-0 h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
              {!sidebarOpen && item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-2 py-3 border-t border-white/[0.04] shrink-0">
        <button
          onClick={() => signOut(() => navigate('/'))}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all',
            !sidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black overflow-hidden">

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-[#08080c] border-r border-white/[0.04] z-50 lg:hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hidden lg:flex flex-col bg-[#08080c] border-r border-white/[0.04] shrink-0 overflow-hidden z-20"
      >
        <SidebarContent />
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.04] bg-black shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10 transition-all"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-zinc-400">
                {navItems.find(i => isActive(i.path))?.name || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-8 border-l border-white/[0.05]" />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
