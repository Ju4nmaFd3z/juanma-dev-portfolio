import { useEffect, useRef } from 'react';
import { isFinePointer, prefersReducedMotion } from './pointerField';

/**
 * Magnetic Matter — the element is pulled toward the cursor while hovered,
 * snapping back on leave. Uses the independent CSS `translate` property so it
 * never fights Tailwind `transform` utilities (hover:scale, active:scale…),
 * and rides the element's existing `transition-all` for the spring-back.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer || prefersReducedMotion) return;

    let raf = 0;

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = `${dx * strength}px ${dy * strength}px`;
      });
    };

    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.translate = '0px 0px';
    };

    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
