import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Activity, Users, Scale } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/constants';

export function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'syncing' | 'completed' | 'error'>('syncing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !user) return;

      try {
        // First, check if the user already has a role in their metadata
        const existingRole = user.publicMetadata.role as string;
        const pendingRole = localStorage.getItem('pending_role');

        // If they have an existing role and no pending role, just redirect
        if (existingRole && !pendingRole) {
          setStatus('completed');
          setTimeout(() => {
            window.location.href = `/dashboard/${existingRole}`;
          }, 1500);
          return;
        }

        const roleToSync = pendingRole || existingRole || 'citizen';
        const apiUrl = `${API_URL}/api/sync-user`;

        const token = await getToken();
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || `${user.id}@prajaconnect.local`,
            name: user.fullName || user.username || user.firstName || 'New Citizen',
            avatar: user.imageUrl,
            role: roleToSync,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to sync user data');
        }

        await response.json();
        
        // Clear pending role
        localStorage.removeItem('pending_role');
        
        setStatus('completed');
        
        // Wait a beat for the animation
        setTimeout(async () => {
          await user.reload();
          window.location.href = `/dashboard/${roleToSync}`;
        }, 2000);
      } catch (err) {
        console.error('Onboarding sync error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    }

    if (isLoaded && user) {
      syncUser();
    }
  }, [isLoaded, user, navigate, getToken]);

  const getRoleInfo = (role: string) => {
    switch(role) {
      case 'politician': return { name: 'Politician', icon: Shield, color: 'text-emerald-400' };
      case 'moderator': return { name: 'Moderator', icon: Scale, color: 'text-amber-400' };
      case 'admin': return { name: 'Admin', icon: Activity, color: 'text-indigo-400' };
      default: return { name: 'Citizen', icon: Users, color: 'text-blue-400' };
    }
  };

  const roleInfo = getRoleInfo(localStorage.getItem('pending_role') || 'citizen');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-12 text-center relative z-10"
      >
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-1 text-[10px] border-indigo-500/30 text-indigo-400 uppercase tracking-widest">
            Identity Verification
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Setting up your <br />
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent italic">Praja Profile.</span>
          </h1>
        </div>

        <div className="relative p-12 rounded-[2.5rem] border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl overflow-hidden group">
          {/* Scanning Line */}
          {status === 'syncing' && (
            <motion.div 
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-px bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] z-20"
              style={{ top: 0 }}
            />
          )}

          <div className="space-y-8 relative z-10">
            <div className="flex justify-center">
              <div className={cn(
                "h-24 w-24 rounded-3xl flex items-center justify-center relative transition-all duration-500",
                status === 'completed' ? "bg-emerald-500/20 text-emerald-400 scale-110" : "bg-white/5 text-zinc-500"
              )}>
                {status === 'completed' ? (
                  <CheckCircle2 className="h-10 w-10 animate-in zoom-in duration-500" />
                ) : (
                  <roleInfo.icon className={cn("h-10 w-10", status === 'syncing' && "animate-pulse")} />
                )}
                
                {status === 'syncing' && (
                  <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-3xl animate-ping" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {status === 'syncing' ? 'Synchronizing with Secure Ledger...' : 
                 status === 'completed' ? 'Account Verified' : 'Synchronization Failed'}
              </h3>
              <p className="text-zinc-500 font-medium text-sm max-w-[280px] mx-auto">
                {status === 'syncing' ? `Initializing secure access for ${roleInfo.name} protocols.` : 
                 status === 'completed' ? "The systems are online. Redirecting to your dashboard." : 
                 error || "Establishing connection failed."}
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
               <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  <span>Connection</span>
                  <span className="text-emerald-500 flex items-center gap-1.5">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Encrypted
                  </span>
               </div>
               <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  <span>Latency</span>
                  <span>12ms</span>
               </div>
            </div>
          </div>
        </div>

        {status === 'error' && (
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-[0.2em]"
          >
            Retry Connection Protocol
          </button>
        )}
      </motion.div>
    </div>
  );
}
