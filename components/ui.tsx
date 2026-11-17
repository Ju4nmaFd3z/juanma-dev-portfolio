import React, { useEffect, useRef } from 'react';
import { LOGO_CELLS, LOGO_CURSOR, LOGO_GRID } from './brand';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Renders a string with **bold** and _italic_ spans. */
export const Rich: React.FC<{ text: string; className?: string; as?: 'p' | 'span' }> = ({ text, className, as = 'p' }) => {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  const Tag = as;
  return (
    <Tag className={`rich ${className ?? ''}`}>
      {parts.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p.startsWith('_') && p.endsWith('_') && p.length > 2 ? <em key={i} className="serif-em">{p.slice(1, -1)}</em>
            : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </Tag>
  );
};

// One IntersectionObserver for every .reveal / .rise element on the page.
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

/** Attach to a container: every `.reveal` / `.rise` inside it animates in once. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    const io = getRevealObserver();
    if (!root) return;
    const nodes = root.querySelectorAll('.reveal, .rise');
    if (!io) { nodes.forEach((n) => n.classList.add('in')); return; }
    nodes.forEach((n) => { if (!n.classList.contains('in')) io.observe(n); });
    return () => nodes.forEach((n) => io.unobserve(n));
  });
  return ref;
}

/** A headline line that rises out of a mask. `_word_` is set in italic. */
export const Rise: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className }) => (
  <span className={`rise ${className ?? ''}`} style={{ ['--d' as string]: `${delay}ms` }}>
    <span><Rich as="span" text={text} /></span>
  </span>
);

/** The mark: a pixel "J" and a blinking block cursor, like a prompt. */
const J_PATH = LOGO_CELLS.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');

export const BrandMark: React.FC<{ size?: number }> = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${LOGO_GRID} ${LOGO_GRID}`} shapeRendering="crispEdges" aria-hidden="true" className="shrink-0">
    <path d={J_PATH} fill="var(--ink)" />
    <rect className="brand-cursor" x={LOGO_CURSOR.x} y={LOGO_CURSOR.y} width={LOGO_CURSOR.w} height={LOGO_CURSOR.h} fill="var(--accent)" />
  </svg>
);

/** Text fallback shown inside a stage when WebGL is unavailable. */
export const StageFallback: React.FC<{ art: string }> = ({ art }) => (
  <div className="stage-fallback" aria-hidden="true">{art}</div>
);

export const ExternalLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, ...rest }) => (
  <a target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
);

// ── Animated ASCII art ───────────────────────────────────────────
// The <ascii-art> element of the ascii-magic-art package, loaded once, on first use, from
// /ascii-magic-art (copied out of node_modules at build time).
let runtime: Promise<unknown> | null = null;
const loadAsciiRuntime = () => {
  if (!runtime && typeof document !== 'undefined') {
    // A plain module <script>: the file is served as-is from /public.
    const el = document.createElement('script');
    el.type = 'module';
    el.src = '/ascii-magic-art/runtime/ascii.js';
    document.head.appendChild(el);
    runtime = customElements.whenDefined('ascii-art');
  }
  return runtime;
};

interface AsciiProps {
  piece: string;
  size?: number;
  label: string;
  look?: string;
  className?: string;
  still?: boolean;
  speed?: number;
}

export const AsciiArt: React.FC<AsciiProps> = ({ piece, size = 8, label, look, className, still, speed }) => {
  useEffect(() => { loadAsciiRuntime(); }, []);
  return React.createElement('ascii-art', {
    piece,
    size: String(size),
    look,
    speed: speed === undefined ? undefined : String(speed),
    still: still || prefersReducedMotion() ? '' : undefined,
    'aria-label': label,
    className,
  });
};
