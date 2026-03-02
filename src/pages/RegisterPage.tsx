import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, Shield, MapPin, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'politician'>('citizen');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black min-h-screen">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Link to="/" className="absolute top-10 left-10 hidden md:flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-zinc-950/50 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8 pt-10">
            <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-zinc-500">
              Join your community and make an impact.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300",
                    role === 'citizen' 
                      ? "border-indigo-500 bg-indigo-500/10 text-white" 
                      : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10"
                  )}
                >
                  <User className={cn("h-6 w-6 mb-2", role === 'citizen' ? "text-indigo-400" : "text-zinc-600")} />
                  <span className="text-sm font-semibold">Citizen</span>
                  {role === 'citizen' && (
                    <motion.div layoutId="role-check" className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    </motion.div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('politician')}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300",
                    role === 'politician' 
                      ? "border-blue-500 bg-blue-500/10 text-white" 
                      : "border-white/5 bg-white/5 text-zinc-500 hover:border-white/10"
                  )}
                >
                  <Shield className={cn("h-6 w-6 mb-2", role === 'politician' ? "text-blue-400" : "text-zinc-600")} />
                  <span className="text-sm font-semibold">Official</span>
                  {role === 'politician' && (
                    <motion.div layoutId="role-check" className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    </motion.div>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                   <Input id="name" type="text" placeholder="" icon={<User className="h-4 w-4" />} required className="bg-zinc-900/50 border-white/5" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                   <Input id="email" type="email" placeholder="" icon={<Mail className="h-4 w-4" />} required className="bg-zinc-900/50 border-white/5" />
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {role === 'politician' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                     <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Assigned District</label>
                     <Input id="district" type="text" placeholder="" icon={<MapPin className="h-4 w-4" />} required className="bg-zinc-900/50 border-white/5" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                 <Input id="password" type="password" placeholder="" icon={<Lock className="h-4 w-4" />} required className="bg-zinc-900/50 border-white/5" />
              </div>
              
              <Button type="submit" className="w-full h-14 text-base mt-2" size="lg">
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2 pb-10 flex flex-col items-center space-y-4">
             <div className="h-px w-full bg-white/5 mb-2" />
             <p className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
             </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
