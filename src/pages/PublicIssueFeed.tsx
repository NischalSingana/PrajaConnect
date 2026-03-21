import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ThumbsUp, Share2, MapPin, PlusCircle, TrendingUp, Clock, CheckCircle2, Globe } from 'lucide-react';
import { SlaBadge } from '../components/ui/SlaBadge';
import { PetitionProgress } from '../components/ui/PetitionProgress';
import { ReportIssueModal } from '../components/issues/ReportIssueModal';
import { IssueDetailModal } from '../components/issues/IssueDetailModal';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';

const FILTERS = ['All', 'Infrastructure', 'Sanitation', 'Safety', 'General'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  }
};

export function PublicIssueFeed() {
  const { issues, upvoteIssue, isLoading } = useLocalStore();
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filteredIssues = issues
    .filter(issue => {
      // Case-insensitive category match
      const matchesFilter = activeFilter === 'All' 
        ? true 
        : issue.category.toLowerCase() === activeFilter.toLowerCase();

      const matchesSearch = 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'Resolved' ? issue.status === 'Resolved' : true;

      return matchesFilter && matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (activeTab === 'Trending') {
        return b.upvotes - a.upvotes;
      }
      // Default to recent for everything else
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const tabs = [
    { name: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Recent', icon: <Clock className="h-4 w-4" /> },
    { name: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="h-10 w-10 text-indigo-500/50" />
        </motion.div>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing nodes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 pt-10 px-6">
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} onUpvote={upvoteIssue} />
      
      {/* Professional Header */}
      <div className="relative p-12 rounded-[2.5rem] overflow-hidden border border-white/[0.03] bg-[#050505] shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="hero-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Globe className="h-3 w-3" /> Live Community Pulse
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">Public <span className="bg-gradient-primary bg-clip-text text-transparent">Issues.</span></h1>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
              Real-time monitoring of community challenges and municipal resolution. Join thousands of citizens driving accountability.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsReportModalOpen(true)} 
            className="md:w-auto w-full bg-white text-black hover:bg-zinc-200 border-none shadow-2xl rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Report Issue
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="space-y-6">
        <div className="sticky top-24 z-40 flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-zinc-950/80 backdrop-blur-3xl border border-white/[0.03] shadow-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search issues, locations, or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.05] h-14 rounded-2xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-[10px]",
                  activeTab === tab.name 
                    ? "bg-white text-black shadow-lg" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "whitespace-nowrap px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                activeFilter === filter 
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5 scale-105" 
                  : "border-white/[0.05] bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:text-white"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Issue Cards - Masonry Layout */}
      {filteredIssues.length > 0 ? (
        <motion.div
          key={`${activeFilter}-${activeTab}-${searchQuery}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-1"
        >
          {filteredIssues.map((issue) => (
            <motion.div
              key={issue.id}
              variants={item}
              className="break-inside-avoid mb-8"
            >
                <Card className="p-0 border-white/[0.03] bg-[#08080a] flex flex-col overflow-hidden group rounded-[2.5rem] hover:border-white/10 transition-all duration-500 relative shadow-2xl cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "h-1.5 w-full",
                    issue.status === 'Resolved' ? "bg-emerald-500" : issue.status === 'In Progress' ? "bg-amber-500" : "bg-zinc-800"
                  )} />
                  
                  {/* Issue Image Preview */}
                  {issue.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden border-b border-white/[0.03]">
                      <img 
                        src={issue.imageUrl} 
                        alt={issue.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent opacity-60" />
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-zinc-600 font-bold tracking-widest text-[9px] uppercase">
                          {issue.category} • {issue.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2">
                           <div className={cn("h-1.5 w-1.5 rounded-full", 
                             issue.status === 'Resolved' ? "bg-emerald-500" : 
                             issue.status === 'In Progress' ? "bg-amber-500" : "bg-zinc-600"
                           )} />
                           <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                             issue.status === 'Resolved' ? "text-emerald-500" : 
                             issue.status === 'In Progress' ? "text-amber-500" : "text-zinc-500"
                           )}>{issue.status}</span>
                        </div>
                      </div>
                      <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-500 leading-tight">
                        {issue.title}
                      </h2>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-4">
                        {issue.description}
                      </p>
                    </div>

                    {issue.isPetition && issue.petitionTarget && (
                      <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Communities Petition</span>
                        </div>
                        <PetitionProgress currentSignatures={issue.upvotes} target={issue.petitionTarget} />
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/[0.03] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500/50" />
                          <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">
                            {issue.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 font-bold uppercase tracking-widest text-[9px]">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 rounded-xl h-10 px-4 border-white/[0.03] bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                          onClick={(e) => { e.stopPropagation(); upvoteIssue(issue.id); }}
                        >
                          <ThumbsUp className="mr-2 h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{issue.upvotes.toLocaleString()} Support</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 transition-all text-zinc-500 hover:text-white" onClick={(e) => e.stopPropagation()}>
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 space-y-6 text-center"
        >
          <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
            <Search className="h-10 w-10 text-zinc-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No issues found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => { setActiveFilter('All'); setSearchQuery(''); setActiveTab('Trending'); }}
            className="rounded-full border-white/10 text-xs font-bold uppercase tracking-widest px-8 hover:bg-white/5 transition-all"
          >
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
