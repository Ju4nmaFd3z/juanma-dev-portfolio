import React, { useEffect, useRef, useState } from 'react';
import type { T } from '../translations';
import { LOGO_CELLS, LOGO_CURSOR, LOGO_GRID } from './brand';

interface Props {
  t: T['preloader'];
  /** The page starts to show through (the hero can begin printing). */
  onReveal: () => void;
  /** The loader is gone. */
  onDone: () => void;
}

// The loading screen, on the same halftone screen as the site:
//   1. a field of faint dots; a wave of light sweeps out from the centre as
//      the counter runs, and the mark prints itself pixel by pixel;
//   2. the name types in under it, the four layers tick, the cursor blinks;
//   3. the screen breaks into shrinking squares from the mark outward and the
//      page shows through — straight into the hero printing in.
// ~2.6 s, skippable (button, Esc, Enter, click), once per session, never
// shown under prefers-reduced-motion.

const LOAD = 1600;
const HOLD = 350;
const EXIT = 950;
const BG = '#0b0a0d';
const INK = [244, 238, 228];
const ACCENT = [255, 138, 58];
const FAINT = [52, 46, 56];

const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

const Preloader: React.FC<Props> = ({ t, onReveal, onDone }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const exitAt = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const name = 'Juanma Fernández';

  const leave = () => {
    if (exitAt.current !== null) return;
    exitAt.current = performance.now();
    setLeaving(true);
    onReveal();
  };

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, P = 14, K = 4, cols = 0, rows = 0, lx = 0, ly = 0;
    let logo = new Map<number, { order: number; cursor: boolean }>();

    const layout = () => {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      const small = W < 640;
      P = small ? 11 : 14;
      K = 4; // screen cells per logo pixel
      cols = Math.ceil(W / P) + 1; rows = Math.ceil(H / P) + 1;
      const size = LOGO_GRID * K;
      lx = Math.round(cols / 2 - size / 2);
      ly = Math.round((H * 0.4) / P - size / 2);
      // logo cells in print order: row by row, a little scattered
      logo = new Map();
      const add = (gx: number, gy: number, cursor: boolean) => {
        for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) {
          const x = lx + gx * K + i, y = ly + gy * K + j;
          const jitter = ((x * 73856093) ^ (y * 19349663)) % 97 / 97;
          logo.set(y * cols + x, { order: (gy * K + j) / size * 0.8 + jitter * 0.2, cursor });
        }
      };
      LOGO_CELLS.forEach(([x, y]) => add(x, y, false));
      for (let y = 0; y < LOGO_CURSOR.h; y++) for (let x = 0; x < LOGO_CURSOR.w; x++) add(LOGO_CURSOR.x + x, LOGO_CURSOR.y + y, true);
    };
    layout();
    window.addEventListener('resize', layout);

    const t0 = performance.now();
    let raf = 0;
    let lastP = -1;
    const frame = (now: number) => {
      const p = smooth((now - t0) / LOAD);
      if (Math.round(p * 100) !== lastP) { lastP = Math.round(p * 100); setProgress(p); }
      if (exitAt.current === null && now - t0 > LOAD + HOLD) leave();
      const e = exitAt.current === null ? 0 : Math.min(1, (now - exitAt.current) / EXIT);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = (lx + (LOGO_GRID * K) / 2) * P, cy = (ly + (LOGO_GRID * K) / 2) * P;
      const maxD = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      const wave = p * maxD * 1.15;
      const blink = Math.floor((now - t0) / 530) % 2 === 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * P + P / 2, py = y * P + P / 2;
          const d = Math.hypot(px - cx, py - cy) / maxD;
          // exit: each cell's backdrop shrinks away, from the mark outward
          const gone = smooth((e * 1.45 - d) / 0.4);
          if (gone >= 1) continue;
          const keep = 1 - gone;
          const s = P * keep;
          ctx.fillStyle = BG;
          ctx.fillRect(px - s / 2, py - s / 2, s, s);

          const cell = logo.get(y * cols + x);
          if (cell) {
            const k = smooth((p - 0.15 - cell.order * 0.6) / 0.12);
            if (k > 0) {
              const c = cell.cursor ? ACCENT : INK;
              const a = cell.cursor && p >= 1 && !blink ? 0.35 : 1;
              const q = (P - 2) * k * keep;
              ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
              ctx.fillRect(px - q / 2, py - q / 2, q, q);
              continue;
            }
          }
          // the field: faint dots, lit as the wave passes
          const ring = Math.max(0, 1 - Math.abs(d * maxD - wave) / (P * 7)) * (1 - p * 0.6);
          const r = (P * 0.09 + P * 0.17 * ring) * keep;
          if (r < 0.3) continue;
          const c = ring > 0.02 ? ACCENT : FAINT;
          ctx.fillStyle = ring > 0.02 ? `rgba(${c[0]},${c[1]},${c[2]},${0.25 + ring * 0.75})` : `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (e >= 1) { onDone(); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape' || ev.key === 'Enter') leave(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', layout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typed = name.slice(0, Math.round(Math.min(1, Math.max(0, (progress - 0.35) / 0.5)) * name.length));
  const pct = String(Math.round(progress * 100)).padStart(3, '0');

  return (
    <div className="fixed inset-0 z-[20000] cursor-pointer" onClick={leave} role="status" aria-live="polite" aria-label={name}>
      <canvas ref={canvas} className="absolute inset-0" aria-hidden="true" />

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-x-0 top-[calc(40%+134px)] sm:top-[calc(40%+168px)] flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-[1.35rem] sm:text-[1.6rem] font-medium tracking-[-0.01em] text-ink min-h-[1.5em]">
            {typed}<span className="pl-[1px] text-accent caret-blink" aria-hidden="true">▍</span>
          </p>
          <p className="flex flex-wrap justify-center gap-x-5 gap-y-1 label">
            {t.lines.map((l, i) => {
              const on = progress > 0.25 + (i / t.lines.length) * 0.7;
              return (
                <span key={l} className={`transition-colors duration-300 ${on ? 'text-ink' : ''}`}>
                  <span className={on ? 'text-accentText' : 'opacity-40'} aria-hidden="true">{on ? '■' : '□'}</span> {l}
                </span>
              );
            })}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 lg:px-12 pb-6 sm:pb-8">
          <div className="flex items-end justify-between label">
            <span>Portfolio · Málaga</span>
            <span className="font-mono text-ink tabular-nums text-[0.8rem] tracking-[0.2em]">{pct}%</span>
          </div>
          <div className="mt-3 h-px bg-line overflow-hidden">
            <div className="h-full bg-accent origin-left" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={(ev) => { ev.stopPropagation(); leave(); }}
        className={`btn btn-sm absolute top-5 right-5 sm:right-8 lg:right-12 transition-opacity duration-300 ${leaving ? 'opacity-0 pointer-events-none' : ''}`}
      >
        {t.skip} <span aria-hidden="true" className="opacity-60">esc</span>
      </button>
    </div>
  );
};

export default Preloader;
