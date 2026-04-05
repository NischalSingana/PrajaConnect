import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Award, TrendingUp, CheckCircle2, Users, Star, Activity, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'citizens' | 'areas';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

const RANK_STYLES = [
  { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: <Crown className="h-4 w-4 text-yellow-400" />, glow: 'shadow-yellow-500/10' },
  { bg: 'bg-zinc-400/10 border-zinc-400/20',     text: 'text-zinc-300',  icon: <Medal className="h-4 w-4 text-zinc-300" />,  glow: 'shadow-zinc-400/10' },
  { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400',icon: <Medal className="h-4 w-4 text-orange-400" />,glow: 'shadow-orange-500/10' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const s = RANK_STYLES[rank - 1];
    return (
      <div className={cn('h-10 w-10 rounded-2xl border flex items-center justify-center shadow-lg', s.bg, s.glow)}>
        {s.icon}
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center">
      <span className="text-[11px] font-black text-zinc-500">#{rank}</span>
    </div>
  );
}

function AvatarLetter({ name }: { name: string }) {
  const colors = ['from-indigo-600 to-blue-600', 'from-violet-600 to-purple-600', 'from-rose-600 to-pink-600',
                  'from-emerald-600 to-teal-600', 'from-amber-600 to-orange-600', 'from-cyan-600 to-blue-600'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn('h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-sm font-black text-white shrink-0', color)}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function LeaderboardPage() {
  const { issues, stats } = useLocalStore();
  const [tab, setTab] = useState<Tab>('citizens');

  /* Derive citizen leaderboard from real issue data */
  const citizenRankings = useMemo(() => {
    const map: Record<string, { id: string; reports: number; resolved: number; upvotes: number; name: string }> = {};
    issues.forEach(issue => {
      const id = issue.reporterId;
      if (!id) return;
      if (!map[id]) map[id] = { id, reports: 0, resolved: 0, upvotes: 0, name: `Citizen ${id.slice(-4)}` };
      map[id].reports++;
      if (issue.status === 'Resolved') map[id].resolved++;
      map[id].upvotes += issue.upvotes;
    });
    return Object.values(map)
      .sort((a, b) => b.reports * 3 + b.resolved * 5 + b.upvotes - (a.reports * 3 + a.resolved * 5 + a.upvotes))
      .slice(0, 20)
      .map((c, i) => ({
        ...c,
        rank: i + 1,
        score: c.reports * 3 + c.resolved * 5 + c.upvotes,
        resolutionRate: c.reports > 0 ? Math.round((c.resolved / c.reports) * 100) : 0,
      }));
  }, [issues]);

  /* Derive area leaderboard from real location data */
  const areaRankings = useMemo(() => {
    const map: Record<string, { reports: number; resolved: number; upvotes: number }> = {};
    issues.forEach(issue => {
      const loc = issue.location || 'Unknown';
      if (!map[loc]) map[loc] = { reports: 0, resolved: 0, upvotes: 0 };
      map[loc].reports++;
      if (issue.status === 'Resolved') map[loc].resolved++;
      map[loc].upvotes += issue.upvotes;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].reports - a[1].reports)
      .slice(0, 10)
      .map(([name, data], i) => ({
        name, rank: i + 1, ...data,
        resolutionRate: data.reports > 0 ? Math.round((data.resolved / data.reports) * 100) : 0,
      }));
  }, [issues]);

  const podiumItems = citizenRankings.slice(0, 3);
  const citizenListItems = citizenRankings.slice(3);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Award className="h-3 w-3" /> Civic Leaderboard
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Community Champions</h1>
          <p className="text-zinc-500 font-medium max-w-xl">
            Recognising the most active civic contributors across PrajaConnect. Rankings are live and updated in real-time.
          </p>
          <div className="flex gap-6 flex-wrap text-[10px] font-black uppercase tracking-widest">
            <span className="text-indigo-400">{stats.citizens.toLocaleString()} active citizens</span>
            <span className="text-emerald-400">{issues.filter(i => i.status === 'Resolved').length.toLocaleString()} issues resolved</span>
            <span className="text-amber-400">{issues.length.toLocaleString()} total reports</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl border border-white/[0.05] bg-zinc-900/20 w-fit">
          {([
            { id: 'citizens', label: 'Top Citizens', icon: <Users className="h-3.5 w-3.5" /> },
            { id: 'areas',    label: 'Hotspot Areas', icon: <Activity className="h-3.5 w-3.5" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                tab === t.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Podium — Top 3 citizens */}
        {tab === 'citizens' && podiumItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {/* Reorder: 2nd, 1st, 3rd */}
            {[podiumItems[1], podiumItems[0], podiumItems[2]].map((citizen, visIdx) => {
              if (!citizen) return <div key={visIdx} />;
              const actualRank = visIdx === 1 ? 1 : visIdx === 0 ? 2 : 3;
              const heights = ['h-40', 'h-52', 'h-36'];
              const isFirst = actualRank === 1;
              return (
                <div key={citizen.id} className="flex flex-col items-center gap-3">
                  <div className={cn(
                    'w-full rounded-[2rem] border flex flex-col items-center justify-end pb-5 pt-3 transition-all',
                    heights[visIdx],
                    isFirst
                      ? 'border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-yellow-500/[0.02]'
                      : 'border-white/[0.04] bg-zinc-900/20'
                  )}>
                    <AvatarLetter name={citizen.name} />
                    <div className="text-center mt-2 px-2">
                      <p className="text-[10px] font-black text-white truncate max-w-full">{citizen.name}</p>
                      <p className={cn('text-lg font-black mt-1', isFirst ? 'text-yellow-400' : actualRank === 2 ? 'text-zinc-300' : 'text-orange-400')}>
                        {citizen.reports}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">reports</p>
                    </div>
                  </div>
                  <RankBadge rank={actualRank} />
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Rest of the list */}
        {tab === 'citizens' && citizenRankings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 rounded-[2rem] border border-dashed border-white/[0.05] flex flex-col items-center gap-3"
          >
            <Award className="h-12 w-12 text-zinc-800" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">No data yet</p>
            <p className="text-zinc-700 text-xs text-center max-w-xs">Start reporting issues to appear on the leaderboard.</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {tab === 'citizens'
              ? citizenListItems.map(citizen => (
                <motion.div key={citizen.id} variants={item}>
                  <div className="flex items-center gap-5 p-5 rounded-2xl border border-white/[0.03] bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-white/[0.06] transition-all group">
                    <RankBadge rank={citizen.rank} />
                    <AvatarLetter name={citizen.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate group-hover:text-indigo-300 transition-colors">{citizen.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-600 flex-wrap">
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{citizen.reports} reports</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />{citizen.resolved} resolved</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-600" />{citizen.upvotes} upvotes</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-white">{citizen.score}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600">points</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn('text-sm font-black', citizen.resolutionRate >= 70 ? 'text-emerald-400' : citizen.resolutionRate >= 40 ? 'text-amber-400' : 'text-zinc-500')}>
                        {citizen.resolutionRate}%
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-700">resolved</div>
                    </div>
                  </div>
                </motion.div>
              ))
              : areaRankings.map(area => (
                <motion.div key={area.name} variants={item}>
                  <div className="flex items-center gap-5 p-5 rounded-2xl border border-white/[0.03] bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-white/[0.06] transition-all group">
                    <RankBadge rank={area.rank} />
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-black text-white truncate group-hover:text-indigo-300 transition-colors">{area.name}</p>
                      <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{area.reports} reports</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />{area.resolved} resolved</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-indigo-600" />{area.upvotes} upvotes</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${area.resolutionRate}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', area.resolutionRate >= 70 ? 'bg-emerald-500' : area.resolutionRate >= 40 ? 'bg-amber-500' : 'bg-indigo-500')}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn('text-lg font-black', area.resolutionRate >= 70 ? 'text-emerald-400' : area.resolutionRate >= 40 ? 'text-amber-400' : 'text-zinc-500')}>
                        {area.resolutionRate}%
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600">resolved</div>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </motion.div>
        )}

        {/* Scoring legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="p-6 rounded-[2rem] border border-white/[0.04] bg-zinc-900/10 flex flex-wrap gap-6 items-center justify-center"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Scoring:</span>
          {[
            { label: 'Report Filed', pts: '+3 pts', color: 'text-indigo-400' },
            { label: 'Issue Resolved', pts: '+5 pts', color: 'text-emerald-400' },
            { label: 'Community Upvote', pts: '+1 pt', color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={cn('text-[10px] font-black', s.color)}>{s.pts}</span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
