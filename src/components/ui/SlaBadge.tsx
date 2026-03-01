import { useEffect, useState } from 'react';
import { Badge } from './Badge';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { differenceInHours, differenceInMinutes, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SlaBadgeProps {
  deadlineIso: string;
  status: string;
}

export function SlaBadge({ deadlineIso, status }: SlaBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (status === 'Resolved' || status === 'Escalated') return;

    const calculateTimeLeft = () => {
      const deadline = parseISO(deadlineIso);
      const overdue = isPast(deadline);
      setIsOverdue(overdue);

      if (overdue) {
        const hours = Math.abs(differenceInHours(deadline, new Date()));
        setTimeLeft(`${hours}h Breach`);
      } else {
        const hours = differenceInHours(deadline, new Date());
        const mins = differenceInMinutes(deadline, new Date()) % 60;
        setTimeLeft(hours > 0 ? `${hours}h Rem.` : `${mins}m Rem.`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [deadlineIso, status]);

  if (status === 'Resolved') {
    return (
      <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-none px-4">
        <Zap className="w-3 h-3 mr-1.5" /> Resolved
      </Badge>
    );
  }

  if (status === 'Escalated') {
    return (
      <Badge variant="destructive" className="animate-pulse bg-red-500/20 text-red-500 border-none px-4">
        <AlertTriangle className="w-3 h-3 mr-1.5" /> ESCALATED
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-block"
    >
      <Badge 
        variant={isOverdue ? 'destructive' : 'outline'}
        className={cn(
          "font-black text-[9px] uppercase tracking-widest px-4 border-none",
          isOverdue 
            ? "bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
            : "bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        )}
      >
        {isOverdue ? <AlertTriangle className="w-3 h-3 mr-1.5" /> : <Clock className="w-3 h-3 mr-1.5" />}
        {timeLeft}
      </Badge>
    </motion.div>
  );
}
