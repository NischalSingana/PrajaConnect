import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { RoleSelectionModal } from '../auth/RoleSelectionModal';

export function MainLayout() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || 'citizen';
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Issues', path: '/issues' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Petitions', path: '/petitions' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-violet-500/30">
      <header 
        className={cn(
          "fixed top-0 z-[100] w-full transition-all duration-500 ease-in-out",
          isScrolled 
            ? "py-4 px-4 sm:px-8" 
            : "py-8 px-0"
        )}
      >
        <div 
          className={cn(
            "container mx-auto transition-all duration-500 ease-in-out",
            isScrolled 
              ? "bg-glass rounded-full px-6 py-2 shadow-2xl border border-white/10 max-w-5xl" 
              : "px-6 max-w-full"
          )}
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group relative z-[101]">
              <div className="h-14 w-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src="/logo.png" alt="PrajaConnect Logo" className="h-12 w-12 object-contain mix-blend-screen" />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                PrajaConnect
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-all hover:scale-105"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4 relative z-[101]">
              <div className="hidden sm:flex items-center space-x-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] px-4 cursor-pointer hover:bg-white/5">Login</Button>
                  </SignInButton>
                  <Button 
                    size="sm" 
                    onClick={() => setIsRoleModalOpen(true)}
                    className="font-bold uppercase tracking-widest text-[10px] px-6 cursor-pointer bg-white text-black hover:bg-zinc-200 rounded-full h-9"
                  >
                    Join Now
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Link to={`/dashboard/${role}`}>
                    <Button variant="outline" className="text-zinc-400 border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer">
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
              
              <button 
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors h-10 w-10 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl md:hidden transition-all duration-500 ease-in-out transform",
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-12">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="text-4xl font-black text-white hover:text-gradient transition-all"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 w-full px-12 pt-10">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="secondary" className="w-full text-lg h-14 rounded-2xl cursor-pointer">Login</Button>
              </SignInButton>
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsRoleModalOpen(true);
                }}
                className="w-full text-lg h-14 rounded-2xl cursor-pointer bg-white text-black"
              >
                Join PrajaConnect
              </Button>
            </SignedOut>
            <SignedIn>
              <Link to={`/dashboard/${role}`} className="w-full">
                <Button variant="outline" className="w-full justify-start text-zinc-400 border-white/10 hover:bg-white/5 py-6 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest">
                  Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col pt-0">
        <Outlet />
      </main>
      
      <footer className="border-t border-white/[0.03] bg-[#020202] py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2 space-y-8">
              <Link to="/" className="flex items-center space-x-3">
                <div className="h-14 w-14 flex items-center justify-center">
                  <img src="/logo.png" alt="PrajaConnect Logo" className="h-12 w-12 object-contain mix-blend-screen" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">PrajaConnect</span>
              </Link>
              <p className="text-zinc-500 max-w-sm text-base font-medium leading-relaxed">
                Empowering communities through transparent, AI-driven urban governance and swift infrastructure resolution.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/issues" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Public Feed</Link></li>
                <li><Link to="/petitions" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Petitions</Link></li>
                <li><Link to="/leaderboard" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link to="/register" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Issue Reporting</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Our Vision</Link></li>
                <li><Link to="/terms" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6">
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
               © {new Date().getFullYear()} PrajaConnect Labs. All rights reserved.
             </p>
            <div className="flex space-x-8">
            </div>
          </div>
        </div>
      </footer>
      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
      />
    </div>
  );
}
