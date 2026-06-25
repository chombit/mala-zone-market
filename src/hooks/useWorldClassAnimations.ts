/**
 * useWorldClassAnimations.ts
 * World-class animation hooks for premium UX
 * Designed by Principal Engineer for enterprise-grade interactions
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================
export interface SpringConfig {
  tension: number;
  friction: number;
  mass?: number;
}

export interface ParallaxConfig {
  speed?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
}

export interface StaggerConfig {
  staggerDelay?: number;
  initialDelay?: number;
}

// ============================================
// PREMIUM SPRING PHYSICS
// ============================================
const defaultSpringConfig: SpringConfig = {
  tension: 300,
  friction: 30,
  mass: 1
};

export const useSpring = (
  targetValue: number,
  config: Partial<SpringConfig> = {}
) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const velocityRef = useRef(0);
  const animationRef = useRef<number>();

  const springConfig = { ...defaultSpringConfig, ...config };

  useEffect(() => {
    const animate = () => {
      const displacement = currentValue - targetValue;
      const springForce = -springConfig.tension * displacement;
      const dampingForce = -springConfig.friction * velocityRef.current;
      const acceleration = (springForce + dampingForce) / (springConfig.mass || 1);

      velocityRef.current += acceleration * 0.016;
      const newValue = currentValue + velocityRef.current * 0.016;

      if (Math.abs(newValue - targetValue) < 0.001 && Math.abs(velocityRef.current) < 0.001) {
        setCurrentValue(targetValue);
        return;
      }

      setCurrentValue(newValue);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, springConfig]);

  return currentValue;
};

// ============================================
// MOUSE PARALLAX - Smooth GPU Accelerated
// ============================================
export const useMouseParallax = (intensity: number = 15, smoothing: number = 0.08) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let rafActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      lastMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current = {
        x: lastMouseX * intensity,
        y: lastMouseY * intensity
      };

      if (!rafActive) {
        rafActive = true;
        animate();
      }
    };

    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * smoothing,
        y: prev.y + (targetRef.current.y - prev.y) * smoothing
      }));

      if (Math.abs(targetRef.current.x - position.x) > 0.01 || 
          Math.abs(targetRef.current.y - position.y) > 0.01) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        rafActive = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, smoothing]);

  return position;
};

// ============================================
// SCROLL REVEAL - Smooth Entry Animations
// ============================================
export const useScrollReveal = (options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options?.triggerOnce !== false) {
            observer.unobserve(element);
          }
        } else if (options?.triggerOnce === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
};

// ============================================
// STAGGER ANIMATION - Sequential Reveals
// ============================================
export const useStaggerAnimation = (itemCount: number, baseDelay: number = 0.1) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const triggeredRef = useRef(false);

  const trigger = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    visibleItems.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, index * baseDelay * 1000);
    });
  }, [itemCount, baseDelay, visibleItems]);

  const reset = useCallback(() => {
    triggeredRef.current = false;
    setVisibleItems(new Array(itemCount).fill(false));
  }, [itemCount]);

  return { visibleItems, trigger, reset };
};

// ============================================
// 3D TILT EFFECT - Premium Card Interactions
// ============================================
export const use3DTilt = (maxTilt: number = 15, perspective: number = 1000) => {
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);
      
      setTransform({
        rotateX: -percentY * maxTilt,
        rotateY: percentX * maxTilt,
        scale: 1.02
      });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  const style = {
    transform: `perspective(${perspective}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(${transform.scale}, ${transform.scale}, 1)`,
    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
    transformStyle: 'preserve-3d' as const,
    willChange: 'transform',
  };

  return { ref, style, isHovered, transform };
};

// ============================================
// SMOOTH SCROLL TO ELEMENT
// ============================================
export const useSmoothScrollTo = (offset: number = 0) => {
  const scrollTo = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;

    let startTime: number | null = null;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [offset]);

  return { scrollTo };
};

// ============================================
// PERFORMANCE MONITORING
// ============================================
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} - Render #${renderCount.current}: ${(endTime - startTime.current).toFixed(2)}ms`
      );
    }
    
    startTime.current = performance.now();
  });

  return { renderCount: renderCount.current };
};

// ============================================
// EXPORT ALL HOOKS
// ============================================
export const WorldClassAnimations = {
  useSpring,
  useMouseParallax,
  useScrollReveal,
  useStaggerAnimation,
  use3DTilt,
  useSmoothScrollTo,
  usePerformanceMonitor,
};

export default WorldClassAnimations;