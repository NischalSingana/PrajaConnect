import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Activity, ShieldCheck, Sparkles, Zap, Brain, Users, CheckCircle2, Globe, Star, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HeroCanvas, FeaturesCanvas } from '../components/ui/HeroCanvas';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero reveal with stagger
      gsap.from(".hero-text", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.15
      });

      // Scroll indicator bounce
      gsap.to(".scroll-indicator", {
        y: 10,
        duration: 1.2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });

      // Stats counter animation
      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
      });

      // Features section
      gsap.from(".feature-heading", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 75%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 60%",
        },
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // How it works steps
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 75%",
        },
        x: -60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Testimonials and CTA use Framer Motion whileInView instead of GSAP
      
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: "Active Citizens", value: "85k+", icon: <Users className="h-5 w-5 text-indigo-400" />, desc: "Across Telangana" },
    { label: "Issues Resolved", value: "62k+", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />, desc: "And counting" },
    { label: "Avg. Resolution", value: "36h", icon: <BarChart3 className="h-5 w-5 text-violet-400" />, desc: "Response time" },
    { label: "Cities Active", value: "12", icon: <Globe className="h-5 w-5 text-blue-400" />, desc: "Indian cities" },
  ];

  const features = [
    {
      title: "Smart Reporting",
      desc: "Describe the issue in your own words — our AI automatically categorizes it, assigns priority, and routes it to the concerned GHMC ward office or municipal department.",
      icon: <Brain className="h-7 w-7" />,
      image: "/images/feature_reporting.png",
      color: "indigo"
    },
    {
      title: "Real-Time Accountability",
      desc: "Every complaint follows a strict SLA timeline. Track progress as corporators and municipal officers update each case — with full transparency and escalation alerts.",
      icon: <Activity className="h-7 w-7" />,
      image: "/images/feature_accountability.png",
      color: "blue"
    },
    {
      title: "Community Reputation",
      desc: "Earn recognition for verified reports and meaningful civic contributions. Rise through ranks from Active Citizen to Community Leader and gain influence in your ward.",
      icon: <ShieldCheck className="h-7 w-7" />,
      image: "/images/feature_reputation.png",
      color: "emerald"
    }
  ];

  const steps = [
    { num: "01", title: "Report an Issue", desc: "Spot a pothole, broken streetlight, or garbage pile? Describe it — our AI auto-categorizes and assigns priority." },
    { num: "02", title: "Track in Real-Time", desc: "Follow your complaint through SLA deadlines, official responses, and department assignments — all transparent." },
    { num: "03", title: "See Results", desc: "Get notified when resolved. Rate the official response, earn reputation badges, and help improve your ward." },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Resident, Kukatpally", text: "Reported a pothole near KPHB Colony. Within 48 hours, GHMC patched it. I've never seen such fast civic response in Hyderabad!", stars: 5 },
    { name: "Corporator Ramesh Babu", role: "Ward 78, Kukatpally", text: "PrajaConnect transformed how I manage ward complaints. The SLA dashboard gives me complete visibility and residents trust me more now.", stars: 5 },
    { name: "Anita Desai", role: "RWA President, Madhapur", text: "The petition feature helped us collect 2,000 signatures for a drainage fix. The municipal corporation approved it within a month!", stars: 5 },
  ];

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-black overflow-hidden">
      
      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION — Three.js + Text              */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,black_70%)] z-[1]" />
        
        {/* Top gradient fade */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent z-[2]" />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[2]" />

        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto space-y-8"
          >
            <div className="hero-text inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" /> Building Smarter Communities
            </div>
            
            <h1 className="hero-text text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight text-white leading-[1.05]">
              Empowering your <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">neighborhood.</span>
            </h1>
            
            <p className="hero-text text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              A transparent platform for community engagement. Track urban issues, collaborate with officials, and drive meaningful local change.
            </p>
            
            <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white border-none group shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/issues" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-10 border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Explore Live Feed
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-zinc-600">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SOCIAL PROOF BAR                            */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-12 border-y border-white/[0.03]">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-zinc-600">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Trusted by communities in</span>
            {["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Pune"].map(city => (
              <span key={city} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors cursor-default">{city}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS GRID                                  */}
      {/* ═══════════════════════════════════════════ */}
      <section ref={statsRef} className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black" />
        <div className="container relative z-10 mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 rounded-3xl border border-white/[0.04] bg-white/[0.02] hover:border-white/10 transition-all backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-1">{stat.value}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
                      <p className="text-[9px] text-zinc-700 mt-1">{stat.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES SECTION — With Images + Three.js   */}
      {/* ═══════════════════════════════════════════ */}
      <section ref={featuresRef} className="py-32 relative">
        {/* Three.js background */}
        <FeaturesCanvas />
        
        <div className="container relative z-10 mx-auto px-6 space-y-32">
          <div className="feature-heading text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Zap className="h-3 w-3 text-indigo-400" /> Platform Features
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Everything you need to <br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">make an impact.</span>
            </h2>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed">
              Modern tools designed for civic collaboration — from AI-assisted reporting to transparent accountability dashboards.
            </p>
          </div>

          {/* Feature Cards with Images */}
          <div className="space-y-20">
            {features.map((f, idx) => (
              <div 
                key={f.title} 
                className={`feature-card flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}
              >
                {/* Image Side with HUD overlay */}
                <div className="w-full lg:w-1/2 relative group">
                  {/* Glow backdrop on hover */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${
                    f.color === 'indigo' ? 'from-indigo-500/10 to-blue-500/10' :
                    f.color === 'blue' ? 'from-blue-500/10 to-cyan-500/10' :
                    'from-emerald-500/10 to-teal-500/10'
                  } rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                  
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-2xl group-hover:border-white/20 transition-all duration-500">
                    <img 
                      src={f.image} 
                      alt={f.title}
                      className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    
                    {/* ─── Scanning Line ─── */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div 
                        className={`absolute left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          f.color === 'indigo' ? 'bg-indigo-400' : f.color === 'blue' ? 'bg-cyan-400' : 'bg-emerald-400'
                        }`}
                        style={{ animation: 'scanLine 3s ease-in-out infinite', boxShadow: `0 0 20px 4px ${f.color === 'indigo' ? '#6366f1' : f.color === 'blue' ? '#22d3ee' : '#34d399'}` }}
                      />
                    </div>
                    
                    {/* ─── Corner Brackets ─── */}
                    <div className="absolute inset-0 pointer-events-none p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {/* Top-left */}
                      <div className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-sm ${f.color === 'indigo' ? 'border-indigo-500/60' : f.color === 'blue' ? 'border-cyan-500/60' : 'border-emerald-500/60'}`} />
                      {/* Top-right */}
                      <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-sm ${f.color === 'indigo' ? 'border-indigo-500/60' : f.color === 'blue' ? 'border-cyan-500/60' : 'border-emerald-500/60'}`} />
                      {/* Bottom-left */}
                      <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-sm ${f.color === 'indigo' ? 'border-indigo-500/60' : f.color === 'blue' ? 'border-cyan-500/60' : 'border-emerald-500/60'}`} />
                      {/* Bottom-right */}
                      <div className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-sm ${f.color === 'indigo' ? 'border-indigo-500/60' : f.color === 'blue' ? 'border-cyan-500/60' : 'border-emerald-500/60'}`} />
                    </div>

                    {/* ─── HUD Status Labels ─── */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                      {/* Top-left status */}
                      <div className="absolute top-5 left-5 flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${f.color === 'indigo' ? 'bg-indigo-400' : f.color === 'blue' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/60">ACTIVE</span>
                      </div>
                      {/* Bottom data readout */}
                      <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                        <span className="text-[8px] font-mono text-white/40 tracking-wider">
                          {f.color === 'indigo' ? 'MODULE: INTAKE-SYS' : f.color === 'blue' ? 'MODULE: SLA-TRACK' : 'MODULE: REP-ENGINE'}
                        </span>
                        <span className="text-[8px] font-mono text-white/40 tracking-wider">92.7% ACCURACY</span>
                      </div>
                    </div>

                    {/* Bottom gradient fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>
                
                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                    f.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
                    f.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {f.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{f.title}</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">{f.desc}</p>
                  <Link to="/issues" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/link">
                    Learn more <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* HOW IT WORKS                                */}
      {/* ═══════════════════════════════════════════ */}
      <section ref={howItWorksRef} className="py-32 relative border-t border-white/[0.03]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/[0.03] blur-[200px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              How it <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">works.</span>
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">Three simple steps to make your community better.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-0">
            {steps.map((step, i) => (
              <div key={step.num} className="step-item relative flex gap-8 items-start">
                {/* Vertical line */}
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-indigo-500/20 shrink-0">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-24 bg-gradient-to-b from-indigo-500/30 to-transparent mt-4" />
                  )}
                </div>
                
                <div className="pt-2 pb-16">
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* TESTIMONIALS                                */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-32 relative border-t border-white/[0.03]">
        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Loved by <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">communities.</span>
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">Hear from the people making a difference in their cities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
              >
                <Card className="p-8 border-white/5 bg-white/[0.02] hover:border-indigo-500/20 transition-all duration-500 rounded-3xl group h-full">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-indigo-400 text-indigo-400" />
                    ))}
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-8 text-base italic">
                    "{t.text}"
                  </p>
                  <div className="border-t border-white/5 pt-6">
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{t.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FINAL CTA                                   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/5 to-black" />
        
        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] p-16 md:p-28 text-center relative overflow-hidden border border-white/5 bg-zinc-950/30 backdrop-blur-xl"
          >
            {/* Animated glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                Ready to make your<br />
                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">city better?</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Join thousands of citizens already building more transparent and responsive communities. It takes less than a minute to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-14 text-base bg-indigo-600 hover:bg-indigo-500 text-white border-none min-w-[220px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all group">
                    Create Free Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary" size="lg" className="h-16 px-14 text-base border-white/10 bg-white/5 text-white hover:bg-white/10 min-w-[220px]">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-zinc-600 font-medium">No credit card required · Free forever for citizens</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER                                      */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="py-16 border-t border-white/[0.03]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">PrajaConnect</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-600">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/issues" className="hover:text-white transition-colors">Issues</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-xs text-zinc-700">© 2026 PrajaConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
