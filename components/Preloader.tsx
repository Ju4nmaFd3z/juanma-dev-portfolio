import React, { useEffect, useRef, useState } from 'react';
import type { T } from '../translations';

interface Props {
  t: T['preloader'];
  onDone: () => void;
}

// A short POST screen — the machine boots before the world resolves.
// ~1.5 s, skippable (button, Esc, Enter, click), shown once per session,
// skipped entirely under prefers-reduced-motion.

const LOGO = [
  '     ██ ███    ███',
  '     ██ ████  ████',
  '     ██ ██ ████ ██',
  '██   ██ ██  ██  ██',
  ' █████  ██      ██',
];

const Preloader: React.FC<Props> = ({ t, onDone }) => {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    window.setTimeout(onDone, 260);
  };

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const total = 1500;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / total);
      setProgress(k);
      setShown(Math.min(t.lines.length, Math.floor(k * (t.lines.length + 0.6))));
      if (k < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(finish, 180);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cells = 24;
  const filled = Math.round(progress * cells);

  return (
    <div
      className={`fixed inset-0 z-[20000] flex items-center justify-center bg-bg text-ink transition-[clip-path] duration-300 ${leaving ? '[clip-path:inset(0_0_100%_0)]' : '[clip-path:inset(0_0_0_0)]'}`}
      style={{ transitionTimingFunction: 'steps(6)' }}
      onClick={finish}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xl px-6 font-mono text-[13px] sm:text-sm">
        <pre className="text-accentText leading-[1.05] text-[10px] sm:text-xs mb-6 select-none" aria-hidden="true">{LOGO.join('\n')}</pre>
        <ul className="space-y-1.5 min-h-[9.5rem]">
          {t.lines.slice(0, shown).map((line, i) => (
            <li key={i} className={i === shown - 1 && progress < 1 ? 'caret' : ''}>
              <span className="text-muted mr-2" aria-hidden="true">{'>'}</span>
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-3 border border-lineStrong p-[2px]">
            <div className="boot-bar h-full" style={{ width: `${(filled / cells) * 100}%` }} />
          </div>
          <span className="tabular-nums w-10 text-right">{Math.round(progress * 100)}%</span>
        </div>
        <button
          ref={skipRef}
          type="button"
          onClick={(e) => { e.stopPropagation(); finish(); }}
          className="mt-8 btn btn-ghost text-[11px]"
        >
          {t.skip} <span aria-hidden="true">[ESC]</span>
        </button>
      </div>
    </div>
  );
};

export default Preloader;
