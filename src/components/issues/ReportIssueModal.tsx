import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, MapPin, Camera, ArrowRight, CheckCircle2, Clock, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useLocalStore, API_URL } from '@/hooks/useLocalStore';
import { IssueCategory, IssuePriority } from '@/types';
import { useAuth } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { addIssue } = useLocalStore();
  const { userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Geolocation states
  const [location, setLocation] = useState('Detecting location...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Image states
  const [image, setImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'camera' | 'upload' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: IssueCategory, confidence: number, priority: IssuePriority } | null>(null);

  const handleLocationTag = () => {
    if (!navigator.geolocation) {
      setLocation('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        try {
          // Real reverse geocoding via OpenStreetMap Nominatim
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            // Shorten the address for the UI
            const parts = data.display_name.split(', ');
            const shortAddress = parts.slice(0, 3).join(', ');
            setLocation(shortAddress);
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocation('Permission denied / Signal lost');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle video stream attachment when modal opens and ref is available
  useEffect(() => {
    let animationFrame: number;
    
    const attachStream = () => {
      if (showCamera && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      } else if (showCamera) {
        // If ref isn't ready yet, check again in the next frame
        animationFrame = requestAnimationFrame(attachStream);
      }
    };

    if (showCamera) {
      animationFrame = requestAnimationFrame(attachStream);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [showCamera, stream]);

  const startCamera = async () => {
    try {
      // Clear any existing image when starting fresh capture
      setImage(null);
      setImageSource(null);
      
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      // Fallback: try without facingMode restriction (better for desktops)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error("Absolute camera failure:", fallbackErr);
        cameraInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // High quality JPEG
        setImage(dataUrl);
        setImageSource('camera');
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'upload') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageSource(source);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAiAnalysis = async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);
    
    try {
      const res = await fetch(`${API_URL}/api/analyze-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error('AI analysis failed');
      
      const result = await res.json();
      
      setAiResult({ 
        category: result.category, 
        confidence: result.confidence, 
        priority: result.priority 
      });
      setIsAnalyzing(false);
      setStep(2);
    } catch (error) {
      console.error('Groq AI error:', error);
      // Fallback to simple logic if API fails
      const text = (title + ' ' + description).toLowerCase();
      let category: IssueCategory = 'General';
      let priority: IssuePriority = 'Medium';
      
      if (text.includes('pothole') || text.includes('road')) {
        category = 'Infrastructure';
        priority = 'High';
      }
      else if (text.includes('garbage')) {
        category = 'Sanitation';
        priority = 'Medium';
      }
      else if (text.includes('light')) {
        category = 'Safety';
        priority = 'High';
      }

      setAiResult({ category, confidence: 85, priority });
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (aiResult && userId) {
      addIssue({
        title,
        description,
        location,
        lat: coords?.lat,
        lng: coords?.lng,
        imageUrl: image || undefined,
        category: aiResult.category,
        aiCategoryConfidence: aiResult.confidence,
        priority: aiResult.priority,
        isPetition: false,
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        reporterId: userId,
      });
    }
    
    onClose();
    stopCamera();
    setTimeout(() => {
      setStep(1);
      setTitle('');
      setDescription('');
      setImage(null);
      setImageSource(null);
      setCoords(null);
      setLocation('Detecting location...');
      setAiResult(null);
      setShowCamera(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-[#08080a] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/[0.05] flex flex-col max-h-[90vh]"
          >
            {/* Hidden File Inputs */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={cameraInputRef}
              onChange={(e) => handleFileChange(e, 'camera')}
            />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e, 'upload')}
            />

            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-white/[0.03] bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1rem] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Issue Intelligence.</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">AI-Powered Civic Reporting</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 h-10 w-10">
                <X className="h-4 w-4 text-zinc-400" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-1">Report Heading</label>
                      <Input 
                        placeholder="What's the issue? (e.g., Damaged Pothole in Jubilee Hills)" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white/[0.02] border-white/[0.05] h-14 rounded-2xl px-5 text-sm font-medium focus:ring-indigo-500/30"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-1">Detailed Insight</label>
                      <textarea 
                        className="w-full rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 min-h-[160px] transition-all font-medium leading-relaxed"
                        placeholder="Provide details for our AI to analyze priority and department routing..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Capture Proof */}
                      <div className="relative group col-span-1">
                        <button 
                          onClick={startCamera}
                          className={cn(
                            "w-full flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all overflow-hidden h-full min-h-[120px]",
                            image && imageSource === 'camera'
                              ? "border-emerald-500/50 bg-emerald-500/5" 
                              : "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                          )}
                        >
                          {image && imageSource === 'camera' ? (
                            <div className="absolute inset-0">
                              <img src={image} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                <Camera className="w-5 h-5 mb-2 text-emerald-400" />
                                <span className="text-[11px] font-black uppercase text-emerald-400">Captured</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 mb-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-300">Capture</span>
                            </>
                          )}
                        </button>

                        {/* Camera Overlay Modal within Step 1 */}
                        <AnimatePresence>
                          {showCamera && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95"
                            >
                              <div className="relative w-full max-w-2xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  muted
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                                  <Button 
                                    onClick={stopCamera}
                                    variant="ghost"
                                    className="rounded-full bg-white/10 text-white hover:bg-white/20 px-8"
                                  >
                                    Cancel
                                  </Button>
                                  <button 
                                    onClick={capturePhoto}
                                    className="h-20 w-20 rounded-full bg-white flex items-center justify-center border-[6px] border-emerald-500/20 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <div className="h-14 w-14 rounded-full border-4 border-black/5 flex items-center justify-center">
                                      <Camera className="w-6 h-6 text-black" />
                                    </div>
                                  </button>
                                  <div className="w-[88px]" /> {/* Spacer for symmetry */}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Upload Proof */}
                      <div className="relative group">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "w-full flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all overflow-hidden h-full min-h-[120px]",
                            image && imageSource === 'upload'
                              ? "border-indigo-500/50 bg-indigo-500/5" 
                              : "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                          )}
                        >
                          {image && imageSource === 'upload' ? (
                            <div className="absolute inset-0">
                              <img src={image} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Upload className="w-5 h-5 mb-2 text-indigo-400" />
                                <span className="text-[8px] font-black uppercase text-indigo-400">Uploaded</span>
                              </div>
                            </div>
                          ) : isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                          ) : (
                            <>
                              <Upload className="w-5 h-5 mb-3 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-300">Upload</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Tag Location */}
                      <button 
                        onClick={handleLocationTag}
                        disabled={isLocating}
                        className={cn(
                          "flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all group h-full min-h-[120px] overflow-hidden px-4",
                          coords 
                            ? "border-cyan-500/50 bg-cyan-500/5" 
                            : "border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                        )}
                      >
                        {isLocating ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                            <span className="text-[8px] font-bold text-cyan-500/50 uppercase tracking-widest">Identifying...</span>
                          </div>
                        ) : (
                          <>
                            <MapPin className={cn(
                              "w-5 h-5 mb-3 transition-all",
                              coords ? "text-cyan-400 scale-110" : "text-zinc-600 group-hover:text-cyan-400 group-hover:scale-110"
                            )} />
                            <div className="flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                              <span className={cn(
                                "text-[11px] font-black uppercase tracking-[0.15em] transition-colors text-center px-1",
                                coords ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
                              )}>
                                {coords ? "Tagged Presence" : "Tag Location"}
                              </span>
                              {coords && (
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter truncate max-w-[150px]">{location}</span>
                                  <span className="text-[9px] font-mono text-cyan-400/40 uppercase mt-1">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <div className="relative p-10 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 overflow-hidden shadow-2xl">
                       {/* Animated gradient pulse */}
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 animate-pulse" />
                       
                       <div className="relative z-10 space-y-8">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                               <h3 className="text-sm font-black text-white uppercase tracking-widest">Verification Success</h3>
                               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Categorization Logic Verified</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-4">
                           <div className="flex justify-between items-center p-5 rounded-2xl bg-black/60 border border-white/[0.03] backdrop-blur-md">
                             <div className="space-y-1">
                               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">Primary Classification</span>
                               <span className="text-sm font-bold text-white tracking-wide">{aiResult?.category}</span>
                             </div>
                             <Badge className="bg-indigo-500/10 text-indigo-400 border-none px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">{aiResult?.confidence}% Match</Badge>
                           </div>
                           
                           <div className="flex justify-between items-center p-5 rounded-2xl bg-black/60 border border-white/[0.03] backdrop-blur-md">
                             <div className="space-y-1">
                               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">Response Priority</span>
                               <span className="text-sm font-bold text-white tracking-wide">{aiResult?.priority}</span>
                             </div>
                             <div className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-lg shadow-black/20",
                               aiResult?.priority === 'Critical' ? "bg-red-500/20 text-red-500" :
                               aiResult?.priority === 'High' ? "bg-amber-500/20 text-amber-500" :
                               "bg-blue-500/20 text-blue-500"
                             )}>
                               {aiResult?.priority}
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.03] space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-zinc-600" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resolution SLA</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                           Your report has been routed to the <span className="text-indigo-400 font-bold uppercase tracking-wider">Madhapur Ward Office</span> with a resolution deadline of <span className="text-white font-bold italic">48 hours.</span>
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/[0.03] bg-white/[0.01] flex justify-between items-center">
              <button 
                onClick={onClose} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors"
              >
                Discard
              </button>
              <div className="flex gap-4">
                {step === 1 ? (
                  <Button 
                    onClick={simulateAiAnalysis} 
                    isLoading={isAnalyzing}
                    disabled={description.length < 10 || title.length < 5}
                    className="min-w-[200px] h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all font-black text-xs uppercase tracking-[0.2em] border-none shadow-2xl"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    className="min-w-[200px] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-[0.2em] border-none shadow-xl shadow-indigo-600/20"
                  >
                    Confirm Report
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
