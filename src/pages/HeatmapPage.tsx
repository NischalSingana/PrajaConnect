import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { MapPin, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Issue } from '@/types';
import { cn } from '@/lib/utils';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const LAT_MIN = 8, LAT_MAX = 35;
const LNG_MIN = 68, LNG_MAX = 97;

function normalizeCoords(lat: number, lng: number) {
  return {
    x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100,
  };
}

const STATUS_COLOR: Record<string, string> = {
  Resolved: 'bg-emerald-500',
  'In Progress': 'bg-amber-500',
  Pending: 'bg-zinc-500',
  Escalated: 'bg-red-500',
};

const PRIORITY_BAR: Record<string, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-500',
  Low: 'bg-zinc-600',
};

export function HeatmapPage() {
  const { issues, isLoading } = useLocalStore();

  const positioned = useMemo(() =>
    issues
      .filter(i => i.lat != null && i.lng != null)
      .map(i => ({ ...i, pos: normalizeCoords(i.lat!, i.lng!) })),
    [issues]
  );

  const byLocation = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    issues.forEach(i => {
      const key = i.location || 'Unknown';
      if (!map[key]) map[key] = [];
      map[key].push(i);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [issues]);

  const priorityCounts = (['Critical', 'High', 'Medium', 'Low'] as const).map(p => ({
    level: p,
    count: issues.filter(i => i.priority === p).length,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Activity className="h-8 w-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-7xl mx-auto space-y-10 pb-32 pt-6 px-4">
      <motion.div variants={item} className="relative p-10 rounded-[2.5rem] border border-white/[0.04] bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <MapPin className="h-3 w-3" /> Geographic Issue Density
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Issue Heatmap</h1>
          <p className="text-zinc-500 font-medium">Spatial distribution of civic issues across regions.</p>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {priorityCounts.map(({ level, count }) => (
          <motion.div key={level} variants={item}>
            <div className="p-6 rounded-3xl border border-white/[0.05] bg-zinc-900/20 hover:bg-zinc-900/40 transition-all">
              <div className={cn('h-1.5 w-full rounded-full mb-4', PRIORITY_BAR[level])} />
              <div className="text-3xl font-black text-white">{count}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">{level} Priority</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Coordinate Map</h2>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(STATUS_COLOR).map(([s, c]) => (
                  <span key={s} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span className={cn('h-2 w-2 rounded-full', c)} />{s}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0a10] border border-white/[0.03]">
              {[...Array(5)].map((_, i) => (
                <div key={`h${i}`} className="absolute w-full border-t border-white/[0.02]" style={{ top: `${(i + 1) * 16.66}%` }} />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={`v${i}`} className="absolute h-full border-l border-white/[0.02]" style={{ left: `${(i + 1) * 16.66}%` }} />
              ))}
              {positioned.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-700">
                  <MapPin className="h-10 w-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">No GPS coordinate data yet</p>
                </div>
              ) : (
                positioned.map(issue => (
                  <motion.div
                    key={issue.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    title={`${issue.title} — ${issue.status}`}
                    style={{ left: `${issue.pos.x}%`, top: `${issue.pos.y}%` }}
                    className={cn(
                      'absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer hover:scale-150 transition-transform shadow-lg',
                      STATUS_COLOR[issue.status] ?? 'bg-zinc-500'
                    )}
                  />
                ))
              )}
            </div>

            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest text-center">
              {positioned.length} of {issues.length} issues plotted · India bounding box (approx.)
            </p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="p-6 rounded-[2rem] border border-white/[0.05] bg-zinc-900/10 space-y-6 h-full">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Top Hotspots</h2>
            </div>

            <div className="space-y-4">
              {byLocation.slice(0, 10).map(([loc, locIssues], idx) => {
                const max = byLocation[0][1].length;
                const pct = (locIssues.length / max) * 100;
                return (
                  <div key={loc}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                      <span className="text-zinc-400 truncate max-w-[70%]">
                        <span className="text-zinc-700 mr-2">#{idx + 1}</span>{loc}
                      </span>
                      <span className="text-zinc-500 shrink-0">{locIssues.length}</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', pct === 100 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-indigo-500')}
                      />
                    </div>
                  </div>
                );
              })}
              {byLocation.length === 0 && (
                <p className="text-zinc-600 text-xs text-center py-8 font-bold uppercase tracking-widest">No location data</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                {byLocation.length} unique location{byLocation.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
