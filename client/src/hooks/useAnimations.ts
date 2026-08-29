import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'framer-motion';

export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: triggerOnce, margin: `-${threshold * 100}%` });
  return { ref, isInView };
};

export const useStaggeredAnimation = (itemCount: number, delay = 0.1) => {
  return Array.from({ length: itemCount }, (_, i) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }));
};

export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const props = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };
  
  return { isHovered, props };
};

export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return offset;
};

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

export const useSpringConfig = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return { duration: 0.01 };
  }
  return { type: 'spring', damping: 25, stiffness: 200 };
};

import { useRef } from 'react';

export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [callback, options]);
  
  return elementRef;
};

export const useCounter = (end: number, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isActive, setIsActive] = useState(false);
  const { ref, isInView } = useScrollAnimation();
  
  useEffect(() => {
    if (isInView && !isActive) {
      setIsActive(true);
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easedProgress);
        setCount(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView, isActive, end, duration, start]);
  
  return { ref, count };
};

export const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return { displayText, isComplete };
};