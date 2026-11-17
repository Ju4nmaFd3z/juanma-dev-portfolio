import React, { useState } from 'react';
import type { T } from '../translations';
import { bus } from '../engine/bus';
import { SKILL_COLORS, hex } from '../content';
import { Rise, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

// Skills — the list reads top → bottom like the 3D stack beside it (DevOps on
// top, hardware at the base). Hover / focus / tap lifts that layer.
const Skills: React.FC<{ t: T['skills'] }> = ({ t }) => {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(-1);

  const set = (i: number) => { setActive(i); bus.activeLayer = i; };
  const release = () => set(pinned);
  const order = t.layers.map((_, i) => i).reverse();

  return (
    <section ref={ref} id="skills" data-chapter="skills" aria-labelledby="skills-title" className="chapter py-24 lg:py-32">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-x-10 gap-y-8">
        <div className="lg:col-span-6">
          <h2 id="skills-title" className="display text-[clamp(3.6rem,8.6vw,9rem)] text-ink">
            <Rise text={t.title1} />
            <Rise text={t.title2} delay={100} />
          </h2>

          <ol className="mt-12 border-t border-lineStrong" onMouseLeave={release}>
            {order.map((i) => {
              const L = t.layers[i];
              const on = active === i;
              return (
                <li key={L.name} className="reveal border-b border-line">
                  <button
                    type="button"
                    aria-pressed={pinned === i}
                    onMouseEnter={() => set(i)}
                    onFocus={() => set(i)}
                    onBlur={release}
                    onClick={() => { const p = pinned === i ? -1 : i; setPinned(p); set(p === -1 ? i : p); }}
                    className="group w-full text-left py-4 sm:py-5 flex flex-col sm:flex-row sm:items-baseline gap-x-8 gap-y-1.5"
                  >
                    <span className={`flex items-center gap-4 display text-[2.2rem] sm:text-[2.7rem] leading-none sm:w-[7.5em] shrink-0 transition-transform duration-500 ${on ? 'translate-x-2 italic' : ''}`}>
                      <span
                        className={`shrink-0 w-3 h-3 rounded-[3px] transition-transform duration-500 ${on ? 'scale-125' : ''}`}
                        style={{ background: hex(SKILL_COLORS[i]) }}
                        aria-hidden="true"
                      />
                      <span className="text-ink">{L.name}</span>
                    </span>
                    <span className={`font-mono text-[0.8rem] leading-relaxed transition-colors ${on ? 'text-ink' : 'text-muted group-hover:text-ink2'}`}>
                      {L.items.join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="lg:col-span-6 order-first lg:order-none">
          <div data-stage role="img" aria-label={t.visualLabel} className="stage lg:sticky lg:top-16 h-[52svh] min-h-[320px] lg:h-[calc(100svh-5rem)]">
            <StageFallback art={ART.skills} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
