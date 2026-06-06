import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../translations';

interface ExperienceProps { lang: 'es' | 'en'; }

const colorMap = {
  teal: {
    badge: 'bg-teal-600/10 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/10',
    dot:   'bg-teal-500',
    ping:  'bg-teal-500/60',
    hover: 'hover:border-teal-600/30 dark:hover:border-teal-500/30',
  },
  purple: {
    badge: 'bg-violet-600/10 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/10',
    dot:   'bg-violet-500',
    ping:  'bg-violet-500/60',
    hover: 'hover:border-violet-600/30 dark:hover:border-violet-500/30',
  },
  blue: {
    badge: 'bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/10',
    dot:   'bg-blue-500',
    ping:  'bg-blue-500/60',
    hover: 'hover:border-blue-600/30 dark:hover:border-blue-500/30',
  },
} as const;

type ColorKey = keyof typeof colorMap;

// Total duration of the line-draw animation (must match CSS timeline-draw 1.8s)
const ANIM_MS = 1800;

const Experience: React.FC<ExperienceProps> = ({ lang }) => {
  const t = translations[lang].experience;

  const [lineAnimated,  setLineAnimated]  = useState(false);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());
  const hasFiredRef = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fire once when the timeline enters the viewport for the first time
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFiredRef.current) {
          hasFiredRef.current = true;
          setLineAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Stagger card activation in sync with the line drawing bottom → top.
  // Bottom-most card (highest index) is reached first by the rising line.
  // Formula scales automatically for any number of items:
  //   - BASE  = 55% of ANIM_MS (line has passed through the bottom dot)
  //   - STEP  = 45% of ANIM_MS divided by (N-1)  (spreads remaining time evenly)
  useEffect(() => {
    if (!lineAnimated) return;
    const n    = t.items.length;
    const BASE = Math.round(ANIM_MS * 0.55);
    const STEP = n > 1 ? Math.round((ANIM_MS * 0.45) / (n - 1)) : 0;

    const timeouts = t.items.map((_, i) => {
      const reverseI = n - 1 - i;
      return setTimeout(
        () => setActiveIndices(prev => new Set([...prev, i])),
        BASE + reverseI * STEP
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, [lineAnimated, t.items.length]);

  return (
    <div className="relative">
      <h2 className="text-2xl font-display font-bold mb-12 flex items-center gap-4 text-neutral-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 text-sm">
          <i className="fa-solid fa-briefcase"></i>
        </span>
        {t.title}
      </h2>

      <div ref={timelineRef} className="relative space-y-8 sm:space-y-12 ml-10 lg:ml-0">

        {/* ── Unified timeline line ───────────────────────────────────── */}
        <div
          className="absolute -left-[2.35rem] top-3 bottom-0 w-px pointer-events-none"
          aria-hidden="true"
        >
          {/* Track — always visible, very dim, shows the full path ahead */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-300/50 via-neutral-200/20 to-transparent dark:from-neutral-700/50 dark:via-neutral-700/20 dark:to-transparent" />
          {/* Fill — hidden until triggered, then draws bottom → top once */}
          <div className={`absolute inset-0 timeline-fill${lineAnimated ? ' timeline-fill--active' : ''}`} />
        </div>
        {/* ───────────────────────────────────────────────────────────── */}

        {t.items.map((exp, i) => {
          const colorKey = (exp.color in colorMap ? exp.color : 'blue') as ColorKey;
          const c        = colorMap[colorKey];
          const isActive = activeIndices.has(i);

          return (
            <div key={i} className="group relative">

              {/* Dot */}
              <div
                className="absolute left-[calc(-2.35rem-4px)] top-3 flex items-center justify-center"
                aria-hidden="true"
              >
                {isActive && (
                  <div className={`absolute h-4 w-4 rounded-full animate-ping ${c.ping}`} />
                )}
                <div className={`relative h-[9px] w-[9px] rounded-full border-2 border-neutral-50 dark:border-[#050505] ${c.dot} transition-transform duration-500 ${isActive ? 'scale-[1.45]' : 'scale-100'}`} />
              </div>

              {/* Card */}
              <div className={`glass-card relative overflow-hidden rounded-2xl p-5 sm:p-8 border-black/5 dark:border-white/5 ${c.hover} shadow-sm dark:shadow-none transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                <div className="flex flex-col gap-6 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${c.badge}`}>
                      {exp.type}
                    </div>
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-black/5 dark:border-white/5 whitespace-nowrap">
                      {exp.period}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight tracking-tight">
                      {exp.role}
                    </h3>
                    {exp.roleDetail && (
                      <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mt-1 tracking-tight">
                        {exp.roleDetail}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2 text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                      <span className="whitespace-nowrap">{exp.company}</span>
                      <span className="hidden sm:block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                      <span className="whitespace-nowrap">{exp.location}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {exp.points.map((point, pi) => (
                    <li key={pi} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed group/item">
                      <i className="fa-solid fa-check text-blue-600 dark:text-blue-500 mt-1.5 text-[10px] opacity-50 group-hover/item:opacity-100 transition-opacity"></i>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 pt-6">
                  {exp.tags.map((tag, ti) => (
                    <span key={ti} className="text-[9px] font-black uppercase tracking-tighter text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {(exp.linkedinPost || exp.slides) && (
                  <div className="flex flex-wrap gap-5 border-t border-black/5 dark:border-white/5 pt-5 mt-2">
                    {exp.linkedinPost && (
                      <a
                        href={exp.linkedinPost}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-safe inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        {lang === 'es' ? 'Ver Presentación' : 'View Presentation'}
                        <i className="fa-brands fa-linkedin text-[11px]"></i>
                      </a>
                    )}
                    {exp.slides && (
                      <a
                        href={exp.slides}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-safe inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      >
                        {lang === 'es' ? 'Ver Slides' : 'View Slides'}
                        <i className="fa-solid fa-display text-[10px]"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="group relative">
          <div className="absolute -left-[2.35rem] top-0 h-full w-px border-l border-black/10 dark:border-white/10 border-dashed" />
          <div className="glass-card rounded-2xl p-6 border-dashed border-black/10 dark:border-white/10 opacity-60">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{t.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
