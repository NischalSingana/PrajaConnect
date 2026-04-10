import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';

export function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-16 relative overflow-hidden bg-black min-h-screen">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Link to="/" className="absolute top-28 left-10 hidden md:flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium z-50">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full relative z-10 flex justify-center"
      >
        <SignUp 
          routing="path" 
          path="/register" 
          signInUrl="/login" 
          appearance={{
            elements: {
              rootBox: "w-full min-w-[400px]",
              card: "bg-zinc-950 border border-white/10 shadow-2xl rounded-3xl",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-zinc-500",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/5",
              dividerText: "text-zinc-600 font-bold uppercase tracking-widest text-[10px]",
              formFieldLabel: "text-zinc-500 font-bold uppercase tracking-widest text-[10px]",
              formFieldInput: "bg-zinc-900 border-white/5 text-white focus:border-indigo-500/50 transition-all",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white border-none h-12 rounded-xl text-sm font-bold uppercase tracking-widest",
              footerActionText: "text-zinc-500",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-indigo-400"
            }
          }}
          forceRedirectUrl="/onboarding"
        />
      </motion.div>
    </div>
  );
}
