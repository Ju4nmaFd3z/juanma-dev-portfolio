import React from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { ChapterTag, Decode, ExternalLink, Rich, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

interface Props {
  t: T['hero'];
  onOpenCv: () => void;
}

const Hero: React.FC<Props> = ({ t, onOpenCv }) => {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id="home"
      data-chapter="hero"
      aria-labelledby="hero-title"
      className="chapter relative min-h-[100svh] flex flex-col lg:flex-row lg:items-center"
    >
      {/* Stage: top on mobile, right half on desktop */}
      <div
        data-stage
        role="img"
        aria-label={t.visualLabel}
        className="stage order-first mt-16 h-[42svh] min-h-[260px] w-full lg:mt-0 lg:order-none lg:absolute lg:right-0 lg:top-0 lg:h-[100svh] lg:w-[56%]"
      >
        <StageFallback art={ART.hero} />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 lg:py-28">
        <div className="max-w-[640px] lg:max-w-[46%]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
            <ChapterTag n={1} label={t.chapter} />
            <span className="eyebrow reveal" style={{ ['--d' as string]: '80ms' }}>
              <i className="fa-solid fa-location-dot mr-2" aria-hidden="true" />
              {t.place}
            </span>
          </div>

          <h1 id="hero-title" className="display text-[clamp(3.2rem,9vw,7.6rem)] text-ink">
            <span className="block font-mono text-sm sm:text-base font-normal tracking-normal text-muted mb-3 reveal">{t.hello}</span>
            <Decode text={t.name1} className="block reveal" />
            <Decode text={t.name2} className="block reveal" delay={120} />
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.14em] text-muted reveal">{t.fullName}</p>

          <Rich text={t.role} className="mt-6 text-xl sm:text-2xl font-display text-ink2 leading-snug reveal" />
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-[52ch] reveal" style={{ ['--d' as string]: '80ms' }}>{t.lead}</p>

          <ul className="mt-6 flex flex-wrap gap-2 reveal" style={{ ['--d' as string]: '140ms' }}>
            {t.chips.map((c) => <li key={c} className="chip">{c}</li>)}
            <li className="chip !text-ink"><span className="live-dot" aria-hidden="true" />{t.status}</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3 reveal" style={{ ['--d' as string]: '200ms' }}>
            <a href="#about" className="btn btn-primary">
              {t.ctaStory} <i className="fa-solid fa-arrow-down" aria-hidden="true" />
            </a>
            <a href="#projects" className="btn">{t.ctaProjects}</a>
            <button type="button" onClick={onOpenCv} className="btn btn-ghost">
              <i className="fa-solid fa-file-lines" aria-hidden="true" />{t.ctaCv}
            </button>
            <a href="#contact" className="btn btn-ghost">{t.ctaContact}</a>
          </div>

          <div className="mt-8 flex items-center gap-2 reveal" style={{ ['--d' as string]: '260ms' }}>
            <ExternalLink href={CONTACT.github} className="icon-btn" aria-label="GitHub">
              <i className="fa-brands fa-github" aria-hidden="true" />
            </ExternalLink>
            <ExternalLink href={CONTACT.linkedin} className="icon-btn" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
            </ExternalLink>
            <a href={`mailto:${CONTACT.email}`} className="icon-btn" aria-label={`Email: ${CONTACT.email}`}>
              <i className="fa-solid fa-envelope" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <a href="#about" className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 eyebrow hover:text-ink">
        {t.scroll}
        <span className="block w-[2px] h-8 bg-lineStrong overflow-hidden" aria-hidden="true">
          <span className="block w-full h-3 bg-accent motion-safe:animate-[scrollhint_1.6s_steps(8)_infinite]" />
        </span>
      </a>
    </section>
  );
};

export default Hero;
