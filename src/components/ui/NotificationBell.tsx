import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLocalStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 mt-2 w-96 bg-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-600/5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{unreadCount} new</span>
                  )}
                </div>
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">No notifications yet</div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={cn(
                          "p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer",
                          !notification.isRead && "bg-indigo-600/5 border-l-2 border-l-indigo-500"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            notification.type === 'SLA_WARNING' && "bg-amber-500/15 text-amber-400",
                            notification.type === 'ESCALATION' && "bg-red-500/15 text-red-400",
                            notification.type === 'PETITION_MILESTONE' && "bg-blue-500/15 text-blue-400",
                            notification.type === 'STATUS_CHANGE' && "bg-emerald-500/15 text-emerald-400",
                            notification.type === 'REPLY' && "bg-violet-500/15 text-violet-400"
                          )}>
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-medium">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1.5">{notification.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/5 text-center">
                <Button variant="link" size="sm" className="text-xs text-zinc-500 hover:text-white">View All Notifications</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
