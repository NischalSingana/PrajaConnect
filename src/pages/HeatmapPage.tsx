import { motion, Variants } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { MapPin, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { Issue } from '@/types';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// Fallback initial map view: Centered mostly on India bounds if no data
const MAP_CENTER: [number, number] = [20.5937, 78.9629];
const MAP_ZOOM = 4;

function AutoFitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [map, bounds]);
  return null;
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
  const { issues, isLoading } = useStore();

  const positioned = useMemo(() =>
    issues.filter(i => i.lat != null && i.lng != null),
    [issues]
  );
  
  const getCustomIcon = (status: string) => {
    const bg = STATUS_COLOR[status] ?? 'bg-zinc-500';
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="h-4 w-4 rounded-full ${bg} shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white/20 animate-pulse"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const dynamicBounds = useMemo(() => {
    if (positioned.length === 0) return null;
    const lats = positioned.map(i => i.lat!);
    const lngs = positioned.map(i => i.lng!);
    return L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
  }, [positioned]);

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

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0a1a] border border-white/[0.03]">
              <MapContainer 
                center={MAP_CENTER} 
                zoom={MAP_ZOOM} 
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full absolute inset-0 !bg-[#020202]"
              >
                <ZoomControl position="bottomright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {dynamicBounds && <AutoFitBounds bounds={dynamicBounds} />}
                
                {positioned.map(issue => (
                  <Marker 
                    key={issue.id} 
                    position={[issue.lat!, issue.lng!]}
                    icon={getCustomIcon(issue.status)}
                  >
                    <Popup className="custom-popup">
                      <div className="text-zinc-900 !m-0 !p-1 max-w-[200px]">
                        <h4 className="font-black text-sm mb-1 leading-tight">{issue.title}</h4>
                        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider mb-2">
                           <span className={cn(
                             issue.priority === 'Critical' ? 'text-red-500' : 
                             issue.priority === 'High' ? 'text-orange-500' : 'text-zinc-500'
                           )}>{issue.priority} Priority</span>
                        </div>
                        <p className="text-xs font-medium text-zinc-600 line-clamp-2">{issue.description}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest text-center">
              {positioned.length} of {issues.length} issues currently active in geographic space.
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
