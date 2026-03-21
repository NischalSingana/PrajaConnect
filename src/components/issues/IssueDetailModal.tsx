import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Clock, ThumbsUp, Share2, Download, ZoomIn,
  CheckCircle2, AlertTriangle, Flag, MessageSquare, Shield
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SlaBadge } from '../ui/SlaBadge';
import { PetitionProgress } from '../ui/PetitionProgress';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/constants';
import type { Issue } from '@/types';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
}

const PRIORITY_CONFIG = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  High:     { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  Medium:   { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  Low:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_CONFIG = {
  Resolved:      { color: 'text-emerald-400', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'In Progress': { color: 'text-amber-400',   dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
  Pending:       { color: 'text-zinc-400',     dot: 'bg-zinc-600',    bar: 'bg-zinc-800'    },
  Escalated:     { color: 'text-red-400',      dot: 'bg-red-500',     bar: 'bg-red-500'     },
};

async function downloadImage(imageUrl: string, filename: string) {
  const proxyUrl = `${API_URL}/api/proxy-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement('a');
  a.href = proxyUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function IssueDetailModal({ issue, onClose, onUpvote }: IssueDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!issue) return null;

  const statusCfg = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.Pending;
  const priorityCfg = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG.Low;
  const filename = `${issue.id}.jpg`;

  const handleDownload = () => {
    if (issue.imageUrl) downloadImage(issue.imageUrl, filename);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: issue.title, text: issue.description });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Detail Modal — z-[200] to sit above navbar (z-[100]) */}
      <AnimatePresence>
        {!lightboxOpen && (
          <motion.div
            key="detail-overlay"
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              key="detail-panel"
              className="relative z-10 w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[88vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-[#0a0a0c] border border-white/[0.06] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } }}
              exit={{ opacity: 0, y: 40 }}
            >
              {/* Status colour bar */}
              <div className={cn('h-1 w-full flex-shrink-0', statusCfg.bar)} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] flex items-center justify-center transition-all text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 overscroll-contain">

                {/* Hero image */}
                {issue.imageUrl && (
                  <div className="relative w-full h-64 flex-shrink-0 overflow-hidden border-b border-white/[0.04] group">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent" />

                    {/* Hover image actions */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => setLightboxOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black/90 transition-all"
                      >
                        <ZoomIn className="h-3 w-3" /> View Full
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black/90 transition-all"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-7">
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-zinc-600 font-bold tracking-widest text-[9px] uppercase">
                        {issue.category} · {issue.id}
                      </span>
                      <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                    </div>

                    <h2 className="text-xl font-black text-white leading-snug pr-8">{issue.title}</h2>

                    <div className="flex flex-wrap gap-2">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                        statusCfg.color,
                        issue.status === 'Resolved'    ? 'bg-emerald-500/10 border-emerald-500/20' :
                        issue.status === 'In Progress' ? 'bg-amber-500/10  border-amber-500/20'  :
                        issue.status === 'Escalated'   ? 'bg-red-500/10    border-red-500/20'    :
                        'bg-zinc-800/60 border-white/5'
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                        {issue.status}
                      </span>

                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border', priorityCfg.color, priorityCfg.bg)}>
                        <AlertTriangle className="h-3 w-3" />
                        {issue.priority} Priority
                      </span>

                      {issue.flagged && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border text-red-400 bg-red-500/10 border-red-500/20">
                          <Flag className="h-3 w-3" /> Flagged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Description</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{issue.description}</p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Location', icon: <MapPin className="h-3.5 w-3.5 text-indigo-500/70 flex-shrink-0" />, value: issue.location },
                      { label: 'Reported', icon: <Clock className="h-3.5 w-3.5 text-indigo-500/70 flex-shrink-0" />, value: new Date(issue.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) },
                      { label: 'SLA Deadline', icon: <Shield className="h-3.5 w-3.5 text-indigo-500/70 flex-shrink-0" />, value: new Date(issue.slaDeadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) },
                      { label: 'Escalation', icon: <AlertTriangle className="h-3.5 w-3.5 text-indigo-500/70 flex-shrink-0" />, value: issue.escalationLevel },
                    ].map(({ label, icon, value }) => (
                      <div key={label} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">{label}</p>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          {icon}
                          <span className="text-xs font-semibold leading-snug">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Petition */}
                  {issue.isPetition && issue.petitionTarget && (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                      <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Active Community Petition</p>
                      <PetitionProgress currentSignatures={issue.upvotes} target={issue.petitionTarget} />
                    </div>
                  )}

                  {/* Official response */}
                  {issue.response && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Official Response</p>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{issue.response}</p>
                    </div>
                  )}

                  {/* Flag reason */}
                  {issue.flagged && issue.flagReason && (
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 text-red-400" />
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Flag Reason</p>
                      </div>
                      <p className="text-zinc-400 text-sm">{issue.flagReason}</p>
                    </div>
                  )}

                  {/* Comments */}
                  {issue.commentsCount > 0 && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {issue.commentsCount} Comment{issue.commentsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.04] flex items-center gap-2 bg-[#0a0a0c]">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl h-10 border-white/[0.03] bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                  onClick={() => onUpvote(issue.id)}
                >
                  <ThumbsUp className="mr-2 h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{issue.upvotes.toLocaleString()} Support</span>
                </Button>
                {issue.imageUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                    onClick={handleDownload}
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox — z-[300] to be above everything */}
      <AnimatePresence>
        {lightboxOpen && issue.imageUrl && (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/97 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Toolbar */}
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/70 to-transparent z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest truncate max-w-xs">{issue.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <motion.img
              src={issue.imageUrl}
              alt={issue.title}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            <p className="mt-5 text-white/25 text-xs tracking-widest uppercase font-semibold">Click outside to close</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
