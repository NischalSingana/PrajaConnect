import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PetitionProgressProps {
  currentSignatures: number;
  target: number;
  className?: string;
}

export function PetitionProgress({ currentSignatures, target, className }: PetitionProgressProps) {
  const percentage = Math.min(Math.round((currentSignatures / target) * 100), 100);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Users className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {currentSignatures.toLocaleString()} Supporters
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            Target: {target.toLocaleString()}
          </span>
          <Zap className="h-3 w-3 text-amber-500" />
        </div>
      </div>
      
      <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/5 relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
      
      <div className="flex justify-between items-center px-1">
         <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] italic">
          Verification in progress
        </p>
        <p className="text-[10px] text-white font-black">
          {percentage}%
        </p>
      </div>
    </div>
  );
}
