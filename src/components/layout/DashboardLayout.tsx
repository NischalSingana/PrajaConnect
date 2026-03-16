import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Moon, Sun, Menu, LayoutDashboard, Files, User, Settings, FileText, Activity, Users, BarChart4, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from '../ui/NotificationBell';
import { useUser, UserButton } from '@clerk/clerk-react';

// Mock user context removed for Clerk Integration

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user } = useUser();

  // Navigation config based on role
  const role = (user?.publicMetadata?.role as string) || 'citizen';
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${role}` },
    { name: 'Public Feed', icon: Files, path: '/issues' },
    ...(role === 'politician' ? [
      { name: 'My District', icon: Activity, path: '/dashboard/politician/district' }
    ] : []),
    ...(role === 'moderator' ? [
      { name: 'Review Queue', icon: Shield, path: '/dashboard/moderator' },
      { name: 'Conflict Resolution', icon: Users, path: '/dashboard/moderator/conflicts' }
    ] : []),
    ...(role === 'admin' ? [
      { name: 'System Logs', icon: FileText, path: '/dashboard/admin/logs' },
      { name: 'Manage Users', icon: Users, path: '/dashboard/admin/users' },
      { name: 'Global Analytics', icon: BarChart4, path: '/dashboard/analytics' }
    ] : []),
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-color)] overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-surface border-r border-subtle z-20 shrink-0"
          >
            <div className="h-16 flex items-center px-6 border-b border-subtle">
              <Link to="/"><span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-500)]">PrajaConnect</span></Link>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-300)]" 
                          : "text-[var(--text-color)] hover:bg-[var(--color-background-light)] dark:hover:bg-[var(--color-background-dark)]"
                      )}
                    >
                      <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-[var(--color-primary-600)] dark:text-[var(--color-primary-300)]" : "text-[var(--text-muted)]")} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-subtle">
              <div className="flex items-center">
                <img src={user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="" className="h-9 w-9 rounded-full bg-gray-100" />
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-[var(--text-color)] truncate">{user?.fullName || "Loading..."}</p>
                  <p className="text-xs font-medium text-[var(--text-muted)] capitalize truncate">{user?.publicMetadata?.role as string || 'citizen'}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-subtle bg-surface">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="-ml-2">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="ml-2 flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[var(--bg-color)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
