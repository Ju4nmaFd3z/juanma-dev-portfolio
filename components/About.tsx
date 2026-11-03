import React from 'react';
import type { T } from '../translations';
import { ChapterTag, Decode, Rich, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

const About: React.FC<{ t: T['about'] }> = ({ t }) => {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="about" data-chapter="about" aria-labelledby="about-title" className="chapter py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-8">
        {/* Stage: sticky on desktop (left), block on mobile */}
        <div className="lg:col-span-6 lg:order-1 order-1">
          <div
            data-stage
            role="img"
            aria-label={t.visualLabel}
            className="stage h-[46svh] min-h-[280px] lg:sticky lg:top-[10vh] lg:h-[80vh]"
          >
            <StageFallback art={ART.about} />
          </div>
        </div>

        <div className="lg:col-span-6 lg:order-2 order-2 lg:pl-6 lg:pr-8">
          <ChapterTag n={2} label={t.chapter} />
          <h2 id="about-title" className="display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-ink">
            <span className="block reveal">{t.title1}</span>
            <Decode text={t.title2} className="block text-accentText reveal" />
          </h2>

          <div className="mt-8 space-y-5 text-[1.075rem] leading-relaxed text-ink2 max-w-[60ch]">
            {t.paragraphs.map((p, i) => (
              <div key={i} className="reveal" style={{ ['--d' as string]: `${i * 60}ms` }}>
                <Rich text={p} />
              </div>
            ))}
          </div>

          <figure className="mt-12 reveal">
            <blockquote className="relative pl-6 border-l-4 border-accent">
              <p className="font-display text-2xl sm:text-3xl leading-tight text-ink">
                <span className="font-pixel text-accentText mr-1" aria-hidden="true">“</span>
                {t.quote}
                <span className="font-pixel text-accentText ml-1" aria-hidden="true">”</span>
              </p>
            </blockquote>
            <figcaption className="eyebrow mt-3 pl-6">— Juanma Fernández</figcaption>
          </figure>

          <div className="mt-12 reveal">
            <p className="eyebrow mb-3">{t.specTitle}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 border border-lineStrong bg-panel">
              {t.specs.map((s, i) => (
                <div key={s.label} className={`p-5 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-lineStrong' : ''}`}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{s.label}</dt>
                  <dd className="mt-2">
                    <span className="block font-pixel text-3xl text-ink">{s.value}</span>
                    <span className="block mt-1 text-sm text-muted">{s.sub}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
