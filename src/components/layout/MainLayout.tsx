import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
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

  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'Feed', path: '/issues' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-violet-500/30">
      <header 
        className={cn(
          "fixed top-0 z-[100] w-full transition-all duration-300 border-b border-white/0",
          isScrolled ? "bg-black/60 backdrop-blur-xl border-white/10 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group relative z-[101]">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              PrajaConnect
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-sm font-bold tracking-wide uppercase text-zinc-400 hover:text-white hover:text-gradient transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-6 relative z-[101]">
            <div className="hidden md:flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="font-bold uppercase tracking-wider text-xs cursor-pointer">Login</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="font-bold uppercase tracking-wider text-xs px-6 cursor-pointer">Sign Up</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard/citizen">
                  <Button variant="ghost" className="font-bold uppercase tracking-wider text-xs mr-2">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
            
            <button 
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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
            <Link to="/login" className="w-full">
              <Button variant="secondary" className="w-full text-lg h-14">Login</Button>
            </Link>
            <Link to="/register" className="w-full">
              <Button className="w-full text-lg h-14">Join PrajaConnect</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col pt-0">
        <Outlet />
      </main>
      
      <footer className="border-t border-white/5 bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="md:col-span-2 space-y-8">
              <Link to="/" className="flex items-center justify-center md:justify-start space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-black text-white">PrajaConnect</span>
              </Link>
              <p className="text-zinc-500 max-w-sm text-lg font-medium leading-relaxed mx-auto md:mx-0">
                Pioneering the next generation of urban infrastructure through transparent, AI-driven governance.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/issues" className="text-zinc-500 hover:text-white transition-colors">Public Feed</Link></li>
                <li><Link to="/register" className="text-zinc-500 hover:text-white transition-colors">Issue Reporting</Link></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-zinc-500 hover:text-white transition-colors">About Story</Link></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-600 font-bold uppercase tracking-widest">
            <p>© {new Date().getFullYear()} PrajaConnect Labs. All rights reserved.</p>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
