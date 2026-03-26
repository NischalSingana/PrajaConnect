import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 text-center space-y-8 max-w-lg"
      >
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Error 404</p>
          <h1 className="text-8xl font-black text-white tracking-tighter">404</h1>
          <p className="text-zinc-500 font-medium text-lg">This page doesn't exist or was moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Home className="h-3.5 w-3.5" /> Go Home
          </Link>
          <Link
            to="/issues"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            <Search className="h-3.5 w-3.5" /> Browse Issues
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white hover:border-white/10 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
