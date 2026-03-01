import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, MapPin, Camera, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useLocalStore } from '@/hooks/useLocalStore';
import { IssueCategory, IssuePriority } from '@/types';
import { useAuth } from '@clerk/clerk-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { addIssue } = useLocalStore();
  const { userId } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location] = useState('Current Location (Detected)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: IssueCategory, confidence: number, priority: IssuePriority } | null>(null);

  const simulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let category: IssueCategory = 'General';
      let priority: IssuePriority = 'Medium';
      const desc = (title + ' ' + description).toLowerCase();
      
      // Infrastructure keywords
      if (desc.includes('pothole') || desc.includes('road') || desc.includes('bridge') || desc.includes('footpath') || desc.includes('manhole') || desc.includes('water supply') || desc.includes('pipeline') || desc.includes('construction')) {
        category = 'Infrastructure';
        priority = desc.includes('pothole') || desc.includes('manhole') ? 'Critical' : 'High';
      }
      // Sanitation keywords
      else if (desc.includes('garbage') || desc.includes('trash') || desc.includes('waste') || desc.includes('drainage') || desc.includes('nala') || desc.includes('sewage') || desc.includes('stench') || desc.includes('dump')) {
        category = 'Sanitation';
        priority = desc.includes('sewage') || desc.includes('drainage') ? 'High' : 'Medium';
      }
      // Safety keywords
      else if (desc.includes('light') || desc.includes('dark') || desc.includes('stray') || desc.includes('dog') || desc.includes('accident') || desc.includes('traffic') || desc.includes('signal') || desc.includes('crime') || desc.includes('unsafe')) {
        category = 'Safety';
        priority = desc.includes('accident') || desc.includes('stray') ? 'Critical' : 'High';
      }

      setAiResult({ category, confidence: 88 + Math.floor(Math.random() * 12), priority });
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  const handleSubmit = () => {
    if (aiResult && userId) {
      addIssue({
        title,
        description,
        location,
        category: aiResult.category,
        aiCategoryConfidence: aiResult.confidence,
        priority: aiResult.priority,
        isPetition: false,
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        reporterId: userId,
      });
    }
    
    onClose();
    setTimeout(() => {
      setStep(1);
      setTitle('');
      setDescription('');
      setAiResult(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-zinc-950 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Issue Assistant</h2>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Fast community reporting</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Issue Title</label>
                      <Input 
                        placeholder="Briefly describe the issue" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Detail Description</label>
                      <textarea 
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 min-h-[140px] transition-all"
                        placeholder="Tell us what is happening..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                        <Camera className="w-6 h-6 mb-2 text-zinc-600 group-hover:text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Add Photos</span>
                      </button>
                      <button className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                        <MapPin className="w-6 h-6 mb-2 text-zinc-600 group-hover:text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pick Location</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="relative p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 overflow-hidden">
                       <div className="relative z-10 space-y-6">
                         <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Analysis Complete</h3>
                         </div>

                         <div className="space-y-4">
                           <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</span>
                             <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-none px-3 font-bold">{aiResult?.category}</Badge>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5">
                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Priority</span>
                             <Badge variant={aiResult?.priority === 'High' ? 'destructive' : 'outline'} className="text-[10px] font-bold px-3">{aiResult?.priority}</Badge>
                           </div>
                         </div>

                         <div className="flex items-center justify-between px-1">
                           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Analysis Accuracy</span>
                           <span className="text-sm font-bold text-white">{aiResult?.confidence}%</span>
                         </div>
                       </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium text-center">
                           Your report will be tracked with a <span className="text-white font-bold">48-hour resolution goal</span>.
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
              <Button variant="ghost" onClick={onClose} className="font-bold text-zinc-500 text-xs">Cancel</Button>
              <div className="flex gap-4">
                {step === 1 ? (
                  <Button 
                    onClick={simulateAiAnalysis} 
                    isLoading={isAnalyzing}
                    disabled={description.length < 10 || title.length < 5}
                    className="min-w-[160px] bg-indigo-600 hover:bg-indigo-500"
                  >
                    Analyze Issue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="min-w-[160px] bg-indigo-600 hover:bg-indigo-500">Submit Report</Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
