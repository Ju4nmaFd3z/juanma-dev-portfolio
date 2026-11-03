import React, { useState } from 'react';
import type { T } from '../translations';
import { bus } from '../engine/bus';
import { ChapterTag, Decode, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

const LAYER_COLOR = ['var(--muted)', 'var(--teal)', 'var(--ink-2)', 'var(--berry)', 'var(--accent)', 'var(--mint)', 'var(--coral)'];

// The stack is listed top → bottom (as it is drawn), but numbered from the
// ground up: L0 is hardware. Hover / focus / tap lifts the slab in 3D.
const Skills: React.FC<{ t: T['skills'] }> = ({ t }) => {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(-1);

  const set = (i: number) => { setActive(i); bus.activeLayer = i; };
  const release = () => set(pinned);
  const order = t.layers.map((_, i) => i).reverse();

  return (
    <section ref={ref} id="skills" data-chapter="skills" aria-labelledby="skills-title" className="chapter py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-8">
        <div className="lg:col-span-6 lg:pr-8">
          <ChapterTag n={3} label={t.chapter} />
          <h2 id="skills-title" className="display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-ink">
            <span className="block reveal">{t.title1}</span>
            <Decode text={t.title2} className="block text-accentText reveal" />
          </h2>
          <p className="mt-6 text-lg text-ink2 leading-relaxed max-w-[56ch] reveal">{t.intro}</p>
          <p className="mt-2 eyebrow reveal">{t.hint}</p>

          <ol className="mt-8 border-t border-lineStrong" onMouseLeave={release}>
            {order.map((i) => {
              const L = t.layers[i];
              const on = active === i;
              return (
                <li key={L.name} className="reveal border-b border-lineStrong">
                  <button
                    type="button"
                    aria-pressed={pinned === i}
                    onMouseEnter={() => set(i)}
                    onFocus={() => set(i)}
                    onBlur={release}
                    onClick={() => { const p = pinned === i ? -1 : i; setPinned(p); set(p === -1 ? i : p); }}
                    className={`w-full text-left grid grid-cols-[3.25rem_1fr] gap-3 py-4 px-2 transition-colors ${on ? 'bg-panel' : 'hover:bg-panel'}`}
                  >
                    <span className="font-pixel text-xs pt-1.5" style={{ color: on ? 'var(--accent-text)' : 'var(--muted)' }}>
                      L{i}
                    </span>
                    <span>
                      <span className="flex items-center gap-3">
                        <span className="inline-block w-3 h-3 shrink-0" style={{ background: LAYER_COLOR[i] }} aria-hidden="true" />
                        <span className="font-display text-xl sm:text-2xl font-semibold text-ink">{L.name}</span>
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {L.items.map((it) => <span key={it} className="chip !py-0.5 !text-[0.7rem]">{it}</span>)}
                      </span>
                      <span aria-hidden="true" className={`block overflow-hidden transition-[max-height,opacity] duration-300 ${on ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 lg:max-h-0'}`}>
                        <span className="block mt-2 text-sm text-muted">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-accentText mr-2">{t.evidenceLabel}:</span>
                          {L.evidence}
                        </span>
                      </span>
                      {/* Evidence always readable without interaction for AT / no-hover devices */}
                      <span className="sr-only">{t.evidenceLabel}: {L.evidence}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="lg:col-span-6 order-first lg:order-none">
          <div data-stage role="img" aria-label={t.visualLabel} className="stage h-[48svh] min-h-[300px] lg:sticky lg:top-[8vh] lg:h-[84vh]">
            <StageFallback art={ART.skills} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
