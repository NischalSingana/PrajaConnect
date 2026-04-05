import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { Bell, CheckCheck, AlertCircle, Info, Star, Activity, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Notification } from '@/types';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  SLA_WARNING:        { icon: <AlertCircle className="h-4 w-4" />, color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',  label: 'SLA Warning' },
  ESCALATION:         { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'Escalation' },
  REPLY:              { icon: <Megaphone className="h-4 w-4" />,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',   label: 'Reply' },
  STATUS_CHANGE:      { icon: <Activity className="h-4 w-4" />,    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',        label: 'Status Update' },
  PETITION_MILESTONE: { icon: <Star className="h-4 w-4" />,        color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   label: 'Petition Milestone' },
  issue_update:       { icon: <Activity className="h-4 w-4" />,    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',        label: 'Issue Update' },
  upvote:             { icon: <Star className="h-4 w-4" />,        color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   label: 'Upvote' },
  comment:            { icon: <Megaphone className="h-4 w-4" />,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',   label: 'Comment' },
  resolution:         { icon: <CheckCheck className="h-4 w-4" />,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Resolved' },
  escalation:         { icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'Escalation' },
  system:             { icon: <Info className="h-4 w-4" />,        color: 'text-zinc-400',    bg: 'bg-zinc-500/10 border-zinc-500/20',        label: 'System' },
};

type FilterTab = 'all' | 'unread' | 'read';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const [tab, setTab] = useState<FilterTab>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = (notifications as Notification[]).filter(n => {
    if (tab === 'unread') return !n.isRead;
    if (tab === 'read') return n.isRead;
    return true;
  });

  const unreadCount = (notifications as Notification[]).filter(n => !n.isRead).length;

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setMarkingAll(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-3xl mx-auto space-y-8 pb-32 pt-6 px-4"
    >
      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] border border-white/[0.04] bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Bell className="h-3 w-3" />
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
            <p className="text-zinc-500 font-medium">Updates on your issues, upvotes, and responses.</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.05] text-zinc-500 hover:text-white hover:border-white/10 transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              <CheckCheck className={cn('h-3.5 w-3.5', markingAll && 'animate-spin')} />
              Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2 p-1 rounded-2xl border border-white/[0.05] bg-zinc-900/20 w-fit">
        {(['all', 'unread', 'read'] as FilterTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
              tab === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
            )}
          >
            {t}{t === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[8px]">{unreadCount}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div variants={item}
          className="py-24 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3"
        >
          <Bell className="h-12 w-12 text-zinc-800" />
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">
            {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="space-y-3">
          {filtered.map(notification => {
            const meta = TYPE_META[notification.type] ?? TYPE_META.system;
            return (
              <motion.div key={notification.id} variants={item} layout>
                <div
                  onClick={() => !notification.isRead && markNotificationRead(notification.id)}
                  className={cn(
                    'flex items-start gap-5 p-6 rounded-2xl border transition-all cursor-pointer group',
                    notification.isRead
                      ? 'border-white/[0.03] bg-transparent hover:bg-zinc-900/20'
                      : 'border-indigo-500/10 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('shrink-0 p-2.5 rounded-xl border', meta.bg)}>
                    <span className={meta.color}>{meta.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={cn(
                      'text-sm font-bold leading-snug',
                      notification.isRead ? 'text-zinc-400' : 'text-white'
                    )}>
                      {notification.title || notification.message}
                    </p>
                    {notification.title && (
                      <p className="text-xs text-zinc-500 leading-relaxed">{notification.message}</p>
                    )}
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">
                      <span>{timeAgo(notification.createdAt)}</span>
                      <span className={cn('capitalize', meta.color)}>{meta.label}</span>
                    </div>
                  </div>

                  {/* Link to issue */}
                  {notification.linkToIssueId && (
                    <Link
                      to={`/issues/${notification.linkToIssueId}`}
                      onClick={e => e.stopPropagation()}
                      className="shrink-0 p-2 rounded-lg text-zinc-700 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {/* Unread dot */}
                  {!notification.isRead && (
                    <div className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
