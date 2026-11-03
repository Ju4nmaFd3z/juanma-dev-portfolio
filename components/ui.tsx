import React, { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Renders a string with **bold** spans. */
export const Rich: React.FC<{ text: string; className?: string; as?: 'p' | 'span' }> = ({ text, className, as = 'p' }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const Tag = as;
  return (
    <Tag className={`rich ${className ?? ''}`}>
      {parts.map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </Tag>
  );
};

// One IntersectionObserver for every .reveal element on the page.
let revealObserver: IntersectionObserver | null = null;
const getRevealObserver = () => {
  if (revealObserver || typeof IntersectionObserver === 'undefined') return revealObserver;
  revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver?.unobserve(e.target);
      }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  return revealObserver;
};

/** Attach to a container: every `.reveal` inside it animates in once. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    const io = getRevealObserver();
    if (!root) return;
    const nodes = root.querySelectorAll('.reveal');
    if (!io) { nodes.forEach((n) => n.classList.add('in')); return; }
    nodes.forEach((n) => io.observe(n));
    return () => nodes.forEach((n) => io.unobserve(n));
  });
  return ref;
}

const GLYPHS = '░▒▓█<>/\\=+*#%@01';

/**
 * Text that resolves out of glyphs, left to right, the first time it is seen.
 * The real text is always present for assistive tech (sr-only); the animated
 * copy is aria-hidden.
 */
export const Decode: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className, delay = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    setOut(text);
    started.current = false;
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      io.disconnect();
      timer = window.setTimeout(() => {
        const t0 = performance.now();
        const dur = Math.min(900, 280 + text.length * 30);
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / dur);
          const fixed = Math.floor(k * text.length);
          let s = text.slice(0, fixed);
          for (let i = fixed; i < text.length; i++) {
            s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          setOut(s);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, delay);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [text, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">{out}</span>
    </span>
  );
};

export const ChapterTag: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <p className="chapter-tag reveal">
    <span className="num" aria-hidden="true">{String(n).padStart(2, '0')}</span>
    <span>{label}</span>
  </p>
);

/** Text fallback shown inside a stage when WebGL is unavailable. */
export const StageFallback: React.FC<{ art: string }> = ({ art }) => (
  <div className="stage-fallback" aria-hidden="true">{art}</div>
);

export const ExternalLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, ...rest }) => (
  <a target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
);
