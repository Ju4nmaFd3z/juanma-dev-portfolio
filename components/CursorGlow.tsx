import React, { useEffect, useRef, memo } from 'react';
import { subscribePointer, isFinePointer, prefersReducedMotion } from '../utils/pointerField';

const SIZE = 640;

/**
 * The Charge — a soft field of light that trails the cursor across the whole
 * site with physical lag, swelling with velocity. Compositor-only: a single
 * fixed element moved with translate3d, no filters, no repaints.
 */
const CursorGlow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) return;
    return subscribePointer(({ sx, sy, speed }) => {
      const el = ref.current;
      if (!el) return;
      const scale = 1 + Math.min(speed * 0.0015, 0.35);
      el.style.transform = `translate3d(${sx - SIZE / 2}px, ${sy - SIZE / 2}px, 0) scale(${scale})`;
    });
  }, []);

  if (!isFinePointer || prefersReducedMotion) return null;

  return <div ref={ref} aria-hidden="true" className="cursor-glow" />;
};

export default memo(CursorGlow);
