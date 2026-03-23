import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingUp, MapPin, ArrowUpRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

type FilterTab = 'all' | 'overdue' | 'critical' | 'escalated';

function getHoursLeft(deadlineIso: string | null | undefined): number | null {
  if (!deadlineIso) return null;
  return (new Date(deadlineIso).getTime() - Date.now()) / 3_600_000;
}

function SlaIndicator({ hours, status }: { hours: number | null; status: string }) {
  if (status === 'Resolved') return <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Resolved</span>;
  if (hours === null) return <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">No SLA</span>;
  if (hours < 0) return <span className="text-[9px] font-black uppercase tracking-widest text-red-400">{Math.abs(Math.round(hours))}h overdue</span>;
  if (hours < 24) return <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">{Math.round(hours)}h left</span>;
  if (hours < 72) return <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">{Math.round(hours / 24)}d left</span>;
  return <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{Math.round(hours / 24)}d left</span>;
}

const ESCALATION_COLOR: Record<string, string> = {
  Normal:   'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  'Level 1':'text-amber-400  border-amber-500/20  bg-amber-500/5',
  'Level 2':'text-orange-400 border-orange-500/20 bg-orange-500/5',
  Critical: 'text-red-400   border-red-500/20   bg-red-500/5',
};

export function SlaEscalationPage() {
  const { issues, isLoading } = useLocalStore();
  const [tab, setTab] = useState<FilterTab>('all');

  const actionable = issues.filter(i => i.status !== 'Resolved');

  const filtered = actionable.filter(issue => {
    const hours = getHoursLeft(issue.slaDeadline);
    if (tab === 'overdue')   return hours !== null && hours < 0;
    if (tab === 'critical')  return hours !== null && hours >= 0 && hours < 24;
    if (tab === 'escalated') return issue.escalationLevel !== 'Normal';
    return true;
  }).sort((a, b) => {
    const ha = getHoursLeft(a.slaDeadline) ?? Infinity;
    const hb = getHoursLeft(b.slaDeadline) ?? Infinity;
    return ha - hb;
  });

  const overdue    = actionable.filter(i => { const h = getHoursLeft(i.slaDeadline); return h !== null && h < 0; }).length;
  const critical   = actionable.filter(i => { const h = getHoursLeft(i.slaDeadline); return h !== null && h >= 0 && h < 24; }).length;
  const escalated  = actionable.filter(i => i.escalationLevel !== 'Normal').length;

  const tabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'all',       label: 'All Active',  count: actionable.length, color: 'text-zinc-400' },
    { key: 'overdue',   label: 'Overdue',     count: overdue,           color: 'text-red-400' },
    { key: 'critical',  label: 'Due <24h',    count: critical,          color: 'text-orange-400' },
    { key: 'escalated', label: 'Escalated',   count: escalated,         color: 'text-amber-400' },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-10 pb-32 pt-6 px-4">

      {/* Header */}
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] border border-white/[0.04] bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <AlertTriangle className="h-3 w-3" /> SLA Monitoring
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Escalation Tracker</h1>
          <p className="text-zinc-500 font-medium">Issues approaching or past their resolution deadlines.</p>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Issues', value: actionable.length, color: 'text-white',       bar: 'bg-zinc-600' },
          { label: 'Overdue',       value: overdue,           color: 'text-red-400',     bar: 'bg-red-500' },
          { label: 'Due in <24h',   value: critical,          color: 'text-orange-400',  bar: 'bg-orange-500' },
          { label: 'Escalated',     value: escalated,         color: 'text-amber-400',   bar: 'bg-amber-500' },
        ].map(({ label, value, color, bar }) => (
          <motion.div key={label} variants={item}>
            <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20">
              <div className={cn('h-1 w-full rounded-full mb-4', bar)} />
              <div className={cn('text-3xl font-black', color)}>{value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">{label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 p-1 rounded-2xl border border-white/[0.05] bg-zinc-900/20 w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
              tab === t.key ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
            )}
          >
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[8px] font-black',
                tab === t.key ? 'bg-black/10 text-black' : t.color + ' bg-white/5'
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Issue list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Activity className="h-8 w-8 text-red-500" />
          </motion.div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="py-24 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-zinc-800" />
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">
            {tab === 'overdue' ? 'No overdue issues' : tab === 'critical' ? 'Nothing due in 24h' : tab === 'escalated' ? 'No escalated issues' : 'No active issues'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="space-y-4">
          {filtered.map(issue => {
            const hours = getHoursLeft(issue.slaDeadline);
            const isOverdue  = hours !== null && hours < 0;
            const isCritical = hours !== null && hours >= 0 && hours < 24;
            return (
              <motion.div key={issue.id} variants={item}>
                <Link to={`/issues/${issue.id}`} className="block group">
                  <div className={cn(
                    'p-7 rounded-[2rem] border transition-all space-y-5',
                    isOverdue
                      ? 'border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.05]'
                      : isCritical
                      ? 'border-orange-500/15 bg-orange-500/[0.02] hover:bg-orange-500/[0.04]'
                      : 'border-white/[0.04] bg-zinc-900/10 hover:bg-zinc-900/30'
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {issue.escalationLevel !== 'Normal' && (
                            <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border', ESCALATION_COLOR[issue.escalationLevel])}>
                              {issue.escalationLevel}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-500">
                            {issue.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/[0.05] text-zinc-500">
                            {issue.priority}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                          {issue.title}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <SlaIndicator hours={hours} status={issue.status} />
                        <div className="flex items-center gap-1 justify-end text-zinc-700">
                          <ArrowUpRight className="h-3 w-3 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />{issue.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" />{issue.upvotes} upvotes
                      </span>
                      <span className="flex items-center gap-1.5 ml-auto">
                        <Clock className="h-3 w-3" />
                        {issue.slaDeadline
                          ? new Date(issue.slaDeadline).toLocaleDateString()
                          : 'No deadline'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
