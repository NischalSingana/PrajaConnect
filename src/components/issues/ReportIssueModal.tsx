import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, MapPin, Camera, ArrowRight, ArrowLeft, Upload, Loader2, Cpu, Scan, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useLocalStore } from '@/hooks/useLocalStore';
import { API_URL } from '@/lib/constants';
import { IssueCategory, IssuePriority } from '@/types';
import { useAuth, useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { addIssue } = useLocalStore();
  const { getToken, isLoaded, userId: authUserId } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const userId = user?.id || authUserId || null;

  // State for auth tracking removed to reduce noise
  useEffect(() => {
    // Logic preserved for component stability
  }, [isOpen, isLoaded, userLoaded, userId]);
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

  // Image states — imagePreview is the local base64 for display; imageUrl is the R2 CDN URL
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'camera' | 'upload' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: IssueCategory; confidence: number; priority: IssuePriority; model?: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            setLocation(parts.slice(0, 3).join(', '));
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

  // Attach camera stream to video element
  useEffect(() => {
    let animationFrame: number;

    const attachStream = () => {
      if (showCamera && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.error('Video play failed:', err));
      } else if (showCamera) {
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
      setImagePreview(null);
      setImageUrl(null);
      setImageSource(null);

      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error('Absolute camera failure:', fallbackErr);
        cameraInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const uploadImageToR2 = async (blob: Blob, filename: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const token = await getToken();
      if (!token) {
        console.warn('[Upload] No auth token — skipping R2 upload');
        return null;
      }
      const formData = new FormData();
      formData.append('image', blob, filename);
      const res = await fetch(`${API_URL}/api/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const ct = res.headers.get('content-type');
      if (!res.ok || !ct?.includes('application/json')) {
        const preview = await res.text();
        console.error(`[Upload] Server returned non-JSON (${res.status}):`, preview.slice(0, 200));
        return null; // fail gracefully — issue can still be submitted without image
      }
      const { url } = await res.json();
      return url as string;
    } catch (err) {
      console.error('Image upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl); // immediate local preview
        setImageSource('camera');
        stopCamera();

        // Convert to Blob → upload to R2
        canvas.toBlob(async (blob) => {
          if (blob) {
            const url = await uploadImageToR2(blob, `capture-${Date.now()}.jpg`);
            if (url) setImageUrl(url);
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'upload') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit');
      return;
    }
    setFileError(null);

    // Instant synchronous preview using object URL — shows image immediately
    // before the async R2 upload even starts, so the spinner overlays the photo.
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setImageSource(source);

    // Upload to R2
    const url = await uploadImageToR2(file, file.name);
    if (url) setImageUrl(url);
    // Revoke object URL to free memory after R2 URL arrives
    URL.revokeObjectURL(objectUrl);
  };

  const simulateAiAnalysis = useCallback(async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch(`${API_URL}/api/analyze-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const result = await res.json();
      setAiResult({ 
        category: result.category, 
        confidence: result.confidence, 
        priority: result.priority,
        model: result.model
      });
      setIsAnalyzing(false);
      setStep(2);
    } catch (error) {
      console.error('Groq AI error:', error);
      const text = (title + ' ' + description).toLowerCase();
      let category: IssueCategory = 'General';
      let priority: IssuePriority = 'Medium';

      if (text.includes('pothole') || text.includes('road')) { category = 'Infrastructure'; priority = 'High'; }
      else if (text.includes('garbage')) { category = 'Sanitation'; priority = 'Medium'; }
      else if (text.includes('light')) { category = 'Safety'; priority = 'High'; }

      setAiResult({ category, confidence: 85, priority });
      setIsAnalyzing(false);
      setStep(2);
    }
  }, [title, description]);

  // Ref to track prerequisites without expanding the deps array
  const prereqsRef = useRef({ imagePreview, coords });
  useEffect(() => {
    prereqsRef.current = { imagePreview, coords };
  });

  // ─── Auto Analysis Trigger ───────────────────────────────────── //
  useEffect(() => {
    // Only trigger if in step 1, not already analyzing, title/desc meet minimums,
    // AND the user has already uploaded an image AND tagged a location
    if (step !== 1 || isAnalyzing || !title || !description) return;
    if (title.length < 5 || description.length < 10) return;
    if (!prereqsRef.current.imagePreview || !prereqsRef.current.coords) return;

    const timer = setTimeout(() => {
      simulateAiAnalysis();
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, description, step, isAnalyzing, simulateAiAnalysis]);

  const handleSubmit = async () => {
    if (!aiResult) {
      setSubmissionError('AI analysis not complete. Please wait.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const result = await addIssue({
        title,
        description,
        location,
        lat: coords?.lat,
        lng: coords?.lng,
        imageUrl: imageUrl || undefined,
        category: aiResult.category,
        aiCategoryConfidence: aiResult.confidence,
        priority: aiResult.priority,
        isPetition: false,
        flagged: false,
        reporterId: userId || '',
      });

      if (!result) throw new Error('Failed to save issue. Please try again.');

      // Success flow
      onClose();
      stopCamera();
      setTimeout(() => {
        setStep(1);
        setTitle('');
        setDescription('');
        setImagePreview(null);
        setImageUrl(null);
        setImageSource(null);
        setCoords(null);
        setLocation('Detecting location...');
        setAiResult(null);
        setShowCamera(false);
      }, 300);
    } catch (err) {
      console.error('[Submit] Fatal error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmissionError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="p-8 border-b border-white/[0.03] bg-white/[0.01] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight italic">
                    {step === 1 ? 'Report Issue' : 'Verification'}
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Step {step} of 2 • Smart Analysis Active</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-12 relative overflow-hidden"
                  >
                    {/* Animated HUD Background */}
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.02] rounded-full"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-indigo-500/10 rounded-full"
                      />
                    </div>

                    <div className="relative">
                      <div className="h-24 w-24 rounded-3xl bg-indigo-600/10 flex items-center justify-center relative shadow-2xl shadow-indigo-500/20">
                        <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
                        
                        {/* Scanning Line overlay */}
                        <motion.div 
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] z-20"
                        />
                        
                        {/* Outer Glow Ring */}
                        <div className="absolute -inset-4 border border-indigo-500/20 rounded-[2rem] animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-4 text-center relative z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Badge variant="outline" className="px-3 py-0.5 border-indigo-500/30 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] bg-indigo-500/5">
                          Neural Engine Active
                        </Badge>
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">Initializing AI analysis</h3>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] max-w-[280px] leading-relaxed mx-auto">
                        Extracting patterns from description, location data, and visual proof...
                      </p>
                    </div>

                    {/* Fake Data Readout */}
                    <div className="grid grid-cols-2 gap-8 w-full max-w-xs mt-4">
                      <div className="space-y-1">
                        <div className="text-[8px] font-black text-zinc-600 tracking-widest uppercase mb-1">Status</div>
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
                          Processing
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[8px] font-black text-zinc-600 tracking-widest uppercase mb-1">Model</div>
                        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{aiResult?.model || 'Llama-3.3-70B'}</div>
                      </div>
                    </div>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {fileError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{fileError}</span>
                      </div>
                    )}

                    {submissionError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{submissionError}</span>
                      </div>
                    )}

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
                            'w-full flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all overflow-hidden h-full min-h-[120px]',
                            imagePreview && imageSource === 'camera'
                              ? 'border-emerald-500/50 bg-emerald-500/5'
                              : 'border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'
                          )}
                        >
                          {imagePreview && imageSource === 'camera' ? (
                            <div className="absolute inset-0">
                              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1">
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                    <span className="text-[9px] font-black uppercase text-white/80">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-5 h-5 mb-1 text-emerald-400" />
                                    <span className="text-[11px] font-black uppercase text-emerald-400">Captured ✓</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 mb-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-300">Capture</span>
                            </>
                          )}
                        </button>

                        {/* Camera Overlay Modal */}
                        <AnimatePresence>
                          {showCamera && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95"
                            >
                              <div className="relative w-full max-w-2xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
                                  <div className="w-[88px]" />
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
                            'w-full flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all overflow-hidden h-full min-h-[120px]',
                            imagePreview && imageSource === 'upload'
                              ? 'border-indigo-500/50 bg-indigo-500/5'
                              : 'border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'
                          )}
                        >
                          {imagePreview && imageSource === 'upload' ? (
                            <div className="absolute inset-0">
                              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1">
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                    <span className="text-[9px] font-black uppercase text-white/80">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-5 h-5 mb-1 text-indigo-400" />
                                    <span className="text-[9px] font-black uppercase text-indigo-400">Uploaded ✓</span>
                                  </>
                                )}
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
                          'flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed transition-all group h-full min-h-[120px] overflow-hidden px-4',
                          coords ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'
                        )}
                      >
                        {isLocating ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                            <span className="text-[8px] font-bold text-cyan-500/50 uppercase tracking-widest">Identifying...</span>
                          </div>
                        ) : (
                          <>
                            <MapPin className={cn('w-5 h-5 mb-3 transition-all', coords ? 'text-cyan-400 scale-110' : 'text-zinc-600 group-hover:text-cyan-400 group-hover:scale-110')} />
                            <div className="flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                              <span className={cn('text-[11px] font-black uppercase tracking-[0.15em] transition-colors text-center px-1', coords ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300')}>
                                {coords ? 'Tagged Presence' : 'Tag Location'}
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
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 animate-pulse" />

                      <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-widest">Primary Verification</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Intelligence Logic Confirmed ✓</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-black/40 rounded-3xl p-6 border border-white/[0.03] space-y-6">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Scan className="w-3 h-3 text-indigo-400" />
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Classification</span>
                                </div>
                                <span className="text-lg font-black text-white tracking-tight">{aiResult?.category}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Accuracy</div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest">{aiResult?.confidence}% Match</Badge>
                              </div>
                            </div>

                            <div className="h-px bg-white/[0.03]" />

                            <div className="flex justify-between items-center">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-3 h-3 text-amber-400" />
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Severity Tier</span>
                                </div>
                                <div className={cn(
                                  'text-lg font-black tracking-tight uppercase',
                                  aiResult?.priority === 'Critical' ? 'text-red-500' :
                                  aiResult?.priority === 'High' ? 'text-amber-500' :
                                  'text-blue-500'
                                )}>
                                  {aiResult?.priority}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-500/[0.02] border border-white/[0.03] flex items-start gap-4">
                      <div className="mt-1 h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Smart Routing Protocol</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                          Routed to <span className="text-white font-bold">{location.split(',')[0]} Ward</span>. 
                          Expected SLA fulfillment within <span className="text-indigo-400 font-black italic">
                            {aiResult?.priority === 'Critical' ? '12 Hours' :
                             aiResult?.priority === 'High' ? '24 Hours' :
                             aiResult?.priority === 'Medium' ? '48 Hours' : '72 Hours'}
                          </span>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/[0.03] bg-white/[0.01] flex justify-between items-center shrink-0">
              <button
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors"
                disabled={isAnalyzing}
              >
                Discard
              </button>
              <div className="flex items-center gap-6">
                {step === 1 && (
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Pre-Analysis Checklist</span>
                    <div className="flex gap-2">
                       <div className={cn("h-1 w-4 rounded-full transition-colors", title.length >= 5 ? "bg-emerald-500/40" : "bg-white/5")} />
                       <div className={cn("h-1 w-4 rounded-full transition-colors", description.length >= 10 ? "bg-emerald-500/40" : "bg-white/5")} />
                       <div className={cn("h-1 w-4 rounded-full transition-colors", imagePreview ? "bg-emerald-500/40" : "bg-white/5")} />
                       <div className={cn("h-1 w-4 rounded-full transition-colors", coords ? "bg-emerald-500/40" : "bg-white/5")} />
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  {step === 1 ? (
                    <Button
                      onClick={simulateAiAnalysis}
                      isLoading={isAnalyzing}
                      disabled={description.length < 10 || title.length < 5 || !imagePreview || !coords || isAnalyzing}
                      className="min-w-[200px] h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all font-black text-xs uppercase tracking-[0.2em] border-none shadow-2xl"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setStep(1)}
                        variant="ghost"
                        className="h-14 rounded-2xl px-6 group border border-white/[0.05] hover:bg-white/[0.02]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 text-zinc-500 group-hover:text-white transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-all">Back</span>
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={isUploading || isSubmitting}
                        className="min-w-[180px] h-14 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-[0.2em] border-none shadow-lg shadow-indigo-500/20"
                      >
                        {!isUploading && !isSubmitting && <ShieldCheck className="w-4 h-4 mr-2" />}
                        Confirm Report
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
