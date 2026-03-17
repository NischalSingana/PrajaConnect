import React, { useEffect } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // Dashboard routes use h-screen + inner overflow-auto — Lenis intercepts
  // trackpad events before they reach the inner scrollable element, breaking scroll.
  // Skip Lenis entirely on dashboard routes and use native scroll.
  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

