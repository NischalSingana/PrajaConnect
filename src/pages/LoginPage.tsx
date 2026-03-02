import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ChevronLeft } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard/citizen');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black min-h-screen">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Link to="/" className="absolute top-10 left-10 hidden md:flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-zinc-950/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-zinc-500">
              Access the PrajaConnect community dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="email">Email address</label>
                 <Input 
                   id="email" 
                   type="email" 
                   placeholder="" 
                   icon={<Mail className="h-4 w-4" />}
                   required 
                   className="bg-zinc-900/50 border-white/5 h-12"
                 />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between px-1">
                   <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="password">Password</label>
                   <Link to="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
                 </div>
                 <Input 
                   id="password" 
                   type="password" 
                   placeholder="" 
                   icon={<Lock className="h-4 w-4" />}
                   required 
                   className="bg-zinc-900/50 border-white/5 h-12"
                 />
              </div>
              <Button type="submit" className="w-full h-12" size="lg">
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 items-center pt-8 pb-10">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-white/5" />
              <span className="relative z-10 bg-zinc-950 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                 Or continue with
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="secondary" type="button" className="w-full h-11 border-white/5 bg-white/5 hover:bg-white/10 text-sm">Google</Button>
              <Button variant="secondary" type="button" className="w-full h-11 border-white/5 bg-white/5 hover:bg-white/10 text-sm">GovID</Button>
            </div>
            <p className="text-center text-sm text-zinc-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
