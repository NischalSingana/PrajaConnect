import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const { isSignedIn } = useAuth();
  
  const navLinks = [
    { name: 'Features', path: '/#features' },
    { 
      name: isSignedIn ? 'View Your Profile' : 'Feed', 
      path: isSignedIn ? '/dashboard/citizen' : '/issues' 
    },
    { name: 'About Us', path: '/about' },
    ...(isSignedIn ? [{ name: 'Dashboard', path: '/dashboard/citizen' }] : []),
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
                  <SignUpButton mode="modal">
                    <Button size="sm" className="font-bold uppercase tracking-widest text-[10px] px-6 cursor-pointer bg-white text-black hover:bg-zinc-200 rounded-full h-9">Join Now</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard/citizen">
                    <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] mr-2 hover:bg-white/5">Dashboard</Button>
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
              <SignUpButton mode="modal">
                <Button className="w-full text-lg h-14 rounded-2xl cursor-pointer bg-white text-black">Join PrajaConnect</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard/citizen" className="w-full">
                <Button className="w-full text-lg h-14 rounded-2xl bg-white text-black">Dashboard</Button>
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
                <li><Link to="/register" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Issue Reporting</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Our Vision</Link></li>
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
    </div>
  );
}
