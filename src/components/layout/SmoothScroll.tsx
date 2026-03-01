import React, { useEffect } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll automatically to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.1, 
        duration: 1.5, 
        smoothWheel: true 
      }}
    >
      {children}
    </ReactLenis>
  );
}
