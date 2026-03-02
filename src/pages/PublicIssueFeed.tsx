import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Filter, ThumbsUp, Share2, MapPin, PlusCircle, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { SlaBadge } from '../components/ui/SlaBadge';
import { PetitionProgress } from '../components/ui/PetitionProgress';
import { ReportIssueModal } from '../components/issues/ReportIssueModal';
import { useLocalStore } from '@/hooks/useLocalStore';
import { cn } from '@/lib/utils';

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
  const { issues, upvoteIssue } = useLocalStore();
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredIssues = issues.filter(issue => 
    activeFilter === 'All' ? true : issue.category === activeFilter
  );

  const tabs = [
    { name: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Recent', icon: <Clock className="h-4 w-4" /> },
    { name: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 pt-10">
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      
      {/* Professional Header */}
      <div className="relative p-12 rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-1 border-indigo-500/30 text-indigo-300">Community Feed</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Public <span className="text-indigo-400">Issues</span></h1>
            <p className="text-zinc-500 text-lg font-medium max-w-xl leading-relaxed">
              Track resolution progress, support community petitions, and help drive positive change in your neighborhood.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsReportModalOpen(true)} 
            className="md:w-auto w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-indigo-500/20 shadow-lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Report Issue
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-24 z-40 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 p-3 rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-white/5 shadow-2xl">
          <div className="relative flex-1">
            <Input 
              icon={<Search className="h-4 w-4" />} 
              placeholder="Search issues, locations, or tags..." 
              className="bg-white/5 border-white/5 h-12 rounded-xl"
            />
          </div>
          
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-300 font-bold uppercase tracking-wider text-[10px]",
                  activeTab === tab.name 
                    ? "bg-white text-black" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
          
          <Button variant="outline" className="h-12 rounded-xl border-white/10 font-bold uppercase tracking-widest text-[10px] px-6">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar px-1">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "whitespace-nowrap px-5 py-2 rounded-full border text-xs font-bold transition-all duration-300",
                activeFilter === filter 
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" 
                  : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10 hover:text-white"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Issue Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 px-1">
        <AnimatePresence mode="popLayout">
          {filteredIssues.map((issue) => (
            <motion.div key={issue.id} variants={item} layout exit={{ opacity: 0, scale: 0.98 }}>
              <Card className="p-0 border-white/5 bg-zinc-950/30 flex flex-col md:flex-row overflow-hidden group rounded-2xl">
                <div className={cn(
                  "w-1 md:w-1.5 self-stretch",
                  issue.status === 'Resolved' ? "bg-emerald-500" : issue.status === 'In Progress' ? "bg-amber-500" : "bg-zinc-800"
                )} />
                
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "text-[9px] px-3 font-bold uppercase border-none",
                        issue.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-500" : 
                        issue.status === 'In Progress' ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-zinc-400"
                      )}>
                        {issue.status}
                      </Badge>
                      <span className="text-zinc-600 font-bold tracking-widest text-[9px] uppercase">
                        {issue.category} • {issue.id}
                      </span>
                    </div>
                    <SlaBadge deadlineIso={issue.slaDeadline} status={issue.status} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">{issue.title}</h2>
                    <p className="text-zinc-500 text-base font-medium leading-relaxed line-clamp-2">
                      {issue.description}
                    </p>
                  </div>

                  {issue.isPetition && issue.petitionTarget && (
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Community Petition</span>
                      </div>
                      <PetitionProgress currentSignatures={issue.upvotes} target={issue.petitionTarget} />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <MapPin className="h-4 w-4 text-indigo-500/50" />
                        <span className="text-xs font-bold uppercase tracking-wider">{issue.location}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="rounded-xl h-11 px-5 border-white/5 bg-white/5 hover:bg-white/10"
                        onClick={() => upvoteIssue(issue.id)}
                      >
                        <ThumbsUp className="mr-2 h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{issue.upvotes.toLocaleString()} Support</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/5 transition-all text-zinc-500 hover:text-white">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
