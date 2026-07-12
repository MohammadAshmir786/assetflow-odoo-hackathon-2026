import { useEffect } from 'react';
import gsap from 'gsap';

/**
 * Custom React hook to reveal elements using GSAP.
 * Features automated cleanup using gsap.context and respects accessibility (reduced motion).
 * 
 * @param {React.RefObject} ref - The React ref of the container/element to animate.
 * @param {Object} options - GSAP animation options (duration, delay, y, ease, stagger).
 */
export const useGsapReveal = (ref, options = {}) => {
  const {
    duration = 0.8,
    delay = 0,
    y = 20,
    ease = 'power3.out',
    stagger = 0.1,
  } = options;

  useEffect(() => {
    if (!ref || !ref.current) return;

    // Respect user's system preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Instantly set element to visible/normal state
      gsap.set(ref.current, { opacity: 1, y: 0 });
      return;
    }

    // Initialize animation properties
    gsap.set(ref.current, { opacity: 0, y });

    // Use gsap.context to record all animations and revert them on unmount
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        stagger,
        overwrite: 'auto',
      });
    }, ref);

    return () => {
      ctx.revert();
    };
  }, [ref, duration, delay, y, ease, stagger]);
};

export default useGsapReveal;
