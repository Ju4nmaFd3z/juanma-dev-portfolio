// The Field — single shared pointer engine for every cursor-driven system.
// One mousemove listener, one rAF loop that auto-sleeps once the smoothed
// position settles, so idle cost is exactly zero.

export interface PointerState {
  /** Raw cursor position (viewport px) */
  x: number;
  y: number;
  /** Smoothed (lerped) position — trails the cursor with physical lag */
  sx: number;
  sy: number;
  /** Decaying velocity magnitude — swells with fast movement */
  speed: number;
}

type Listener = (p: PointerState) => void;

export const isFinePointer =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state: PointerState = { x: -1000, y: -1000, sx: -1000, sy: -1000, speed: 0 };
const listeners = new Set<Listener>();
let raf = 0;
let lastX = 0;
let lastY = 0;

const loop = () => {
  state.sx += (state.x - state.sx) * 0.12;
  state.sy += (state.y - state.sy) * 0.12;
  state.speed *= 0.88;

  listeners.forEach((l) => l(state));

  const settled =
    Math.abs(state.x - state.sx) < 0.3 &&
    Math.abs(state.y - state.sy) < 0.3 &&
    state.speed < 0.5;

  raf = settled ? 0 : requestAnimationFrame(loop);
};

const onMove = (e: MouseEvent) => {
  state.speed += Math.hypot(e.clientX - lastX, e.clientY - lastY);
  lastX = e.clientX;
  lastY = e.clientY;
  state.x = e.clientX;
  state.y = e.clientY;
  // First movement: snap the smoothed position so the field doesn't fly in from off-screen
  if (state.sx < -500) {
    state.sx = state.x;
    state.sy = state.y;
  }
  if (!raf && listeners.size) raf = requestAnimationFrame(loop);
};

export function subscribePointer(fn: Listener): () => void {
  if (listeners.size === 0) {
    window.addEventListener('mousemove', onMove, { passive: true });
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
