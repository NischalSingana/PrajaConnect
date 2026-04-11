import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Globe, Award, Heart, Shield, Zap, ArrowRight, Scale, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_IMAGE = '/images/about_hero.png';

export function AboutPage() {
  const { stats } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-section", {
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const values = [
    {
      title: "Transparency",
      desc: "Providing full visibility into civic operations and response times.",
      icon: <Globe className="h-6 w-6" />,
      grad: "from-blue-500 to-cyan-500"
    },
    {
      title: "Accountability",
      desc: "Clear resolution commitments through automated tracking and reporting.",
      icon: <Shield className="h-6 w-6" />,
      grad: "from-emerald-500 to-teal-500"
    },
    {
      title: "Efficiency",
      desc: "Fast routing and automated categorization for all community issues.",
      icon: <Zap className="h-6 w-6" />,
      grad: "from-amber-500 to-orange-500"
    },
    {
      title: "Community",
      desc: "Empowering residents to take an active role in their neighborhood's growth.",
      icon: <Heart className="h-6 w-6" />,
      grad: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="about-hero relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={ABOUT_IMAGE} 
            alt="Civic Network" 
            className="parallax-bg w-full h-full object-cover scale-110 brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center space-y-6">
          <Badge variant="outline" className="px-6 py-1.5 text-xs border-indigo-500/30 text-indigo-300">Our Mission</Badge>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
          >
            Efficiency. Transparency. <br /> <span className="text-indigo-400">Community.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Building the bridge between citizens and local governance across India.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-16 relative z-20 space-y-32 pb-12">
        {/* Mission Card */}
        <section className="about-section">
          <Card className="max-w-6xl mx-auto border-white/10 bg-zinc-950/50 backdrop-blur-3xl overflow-hidden rounded-3xl">
             <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-3 p-10 md:p-16 space-y-8 border-b md:border-b-0 md:border-r border-white/5">
                   <div className="flex items-center gap-2 text-indigo-400">
                      <Target className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">The Vision</span>
                   </div>
                   <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                      Empowering every voice in our <span className="text-indigo-400">community.</span>
                   </h2>
                   <div className="space-y-4 text-lg text-zinc-400 font-medium leading-relaxed">
                      <p>
                        PrajaConnect was built to bridge the gap between citizens and municipal corporations like GHMC, ensuring that every pothole, broken streetlight, and civic issue gets the attention it deserves.
                      </p>
                      <p>
                        We replace slow RTI processes and manual complaint registers with a real-time, transparent system that holds ward corporators and officials accountable.
                      </p>
                   </div>
                   <Button size="lg" className="px-10 group bg-indigo-600 hover:bg-indigo-500 text-white border-none">
                      Get Involved <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-600/5 to-blue-600/5 flex items-center justify-center p-12">
                   <div className="text-center space-y-4">
                      <div className="h-20 w-20 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto">
                         <Users className="h-8 w-8 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-white">{stats.citizens.toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Active Citizens</p>
                      </div>
                   </div>
                </div>
             </div>
          </Card>
        </section>

        {/* Values Grid */}
        <section className="about-section text-center max-w-6xl mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Built on solid values.</h2>
            <p className="text-zinc-500 text-lg">The core principles that drive every feature we build.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="border-white/5 bg-white/5 p-8 text-left hover:border-indigo-500/50 transition-all duration-300">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${v.grad} shadow-lg`}>
                  <div className="text-white">{v.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-zinc-400 leading-relaxed">
                  {v.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* System Roles */}
        <section className="about-section space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Structured for Governance.</h2>
             <p className="text-zinc-500 text-lg">Defined roles ensuring organized communication and accountability.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               {
                 role: "Citizen",
                 desc: "Can register, report local issues, provide feedback, track complaint status, and receive updates directly from politicians.",
                 icon: <Users className="h-5 w-5 text-blue-400" />,
                 border: "border-blue-500/10",
                 bg: "bg-blue-500/5"
               },
               {
                 role: "Politician",
                 desc: "Can view citizen concerns within their constituency, respond to issues, post public updates, and engage in discussions to promote transparency.",
                 icon: <Shield className="h-5 w-5 text-emerald-400" />,
                 border: "border-emerald-500/10",
                 bg: "bg-emerald-500/5"
               },
               {
                 role: "Moderator",
                 desc: "Monitors platform interactions, ensures respectful communication, resolves conflicts, and flags inappropriate content.",
                 icon: <Scale className="h-5 w-5 text-amber-400" />,
                 border: "border-amber-500/10",
                 bg: "bg-amber-500/5"
               },
               {
                 role: "Admin",
                 desc: "Oversees overall platform operations, manages user roles, and ensures system integrity.",
                 icon: <Activity className="h-5 w-5 text-indigo-400" />,
                 border: "border-indigo-500/10",
                 bg: "bg-indigo-500/5"
               }
             ].map((role) => (
               <Card key={role.role} className={cn("p-8 border bg-zinc-950/50 hover:bg-zinc-900 transition-all group rounded-3xl", role.border)}>
                 <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-6", role.bg)}>
                   {role.role === "Moderator" ? <Scale className="h-5 w-5 text-amber-400" /> : role.icon}
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{role.role}</h3>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                   {role.desc}
                 </p>
               </Card>
             ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="about-section">
           <div className="relative rounded-[2.5rem] p-12 md:p-24 text-white overflow-hidden border border-white/10 bg-zinc-950/50 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/10" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                 <div className="space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Making a <span className="text-indigo-400">real impact.</span></h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                       We're deploying PrajaConnect to cities across the nation, creating a more responsive and accountable local government.
                    </p>
                    <div className="flex gap-6 flex-wrap">
                       <div className="bg-white/5 rounded-2xl p-6 flex-1 min-w-[160px] border border-white/5">
                          <p className="text-3xl font-bold mb-1 text-emerald-400">98%</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Satisfaction</p>
                       </div>
                       <div className="bg-white/5 rounded-2xl p-6 flex-1 min-w-[160px] border border-white/5">
                          <p className="text-3xl font-bold mb-1 text-blue-400">3x</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resolution Speed</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-center">
                    <Award className="h-48 w-48 text-indigo-500/20" />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
