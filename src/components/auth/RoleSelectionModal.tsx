import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Scale, Activity, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const navigate = useNavigate();

  const roles = [
    { id: 'citizen', name: 'Citizen', icon: Users, desc: 'Report issues and track improvements.', color: 'blue' },
    { id: 'politician', name: 'Politician', icon: Shield, desc: 'Engage with voters and resolve issues.', color: 'emerald' },
    { id: 'moderator', name: 'Moderator', icon: Scale, desc: 'Monitor safety and platform integrity.', color: 'amber' },
    { id: 'admin', name: 'Admin', icon: Activity, desc: 'System operations and role management.', color: 'indigo' },
  ];

  const selectRoleAndSignUp = (role: string) => {
    localStorage.setItem('pending_role', role);
    onClose();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
                <X className="h-5 w-5 text-zinc-500" />
              </Button>
            </div>

            <div className="p-12 space-y-10">
              <div className="space-y-3">
                <Badge variant="outline" className="px-4 py-1 text-[10px] border-indigo-500/30 text-indigo-400">Join the Mission</Badge>
                <h2 className="text-3xl font-bold text-white tracking-tight">Select your system role</h2>
                <p className="text-zinc-500 font-medium">Choose how you will contribute to your community's growth.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectRoleAndSignUp(r.id)}
                    className={cn(
                      "group relative flex flex-col items-start p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 text-left",
                      r.color === 'blue' && "hover:border-blue-500/30",
                      r.color === 'emerald' && "hover:border-emerald-500/30",
                      r.color === 'amber' && "hover:border-amber-500/30",
                      r.color === 'indigo' && "hover:border-indigo-500/30"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      r.color === 'blue' && "bg-blue-500/10 text-blue-400",
                      r.color === 'emerald' && "bg-emerald-500/10 text-emerald-400",
                      r.color === 'amber' && "bg-amber-500/10 text-amber-400",
                      r.color === 'indigo' && "bg-indigo-500/10 text-indigo-400"
                    )}>
                      <r.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{r.name}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{r.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Signed commitment required</p>
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Secured by Clerk</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
