import React, { useEffect, useState } from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { AsciiArt, ExternalLink, Rich, Rise, useReveal } from './ui';

interface Props {
  t: T['hero'];
  /** WebGL is unavailable: play the piece with the ASCII player instead. */
  flat: boolean;
  onOpenCv: () => void;
}

// Home — a full-bleed live picture with the name set in the calm patch the
// dots leave for it. The pagoda is the motto: what lasts rests on one pillar.
const Hero: React.FC<Props> = ({ t, flat, onOpenCv }) => {
  const ref = useReveal<HTMLElement>();
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia('(pointer: coarse)').matches), []);

  return (
    <section
      ref={ref}
      id="home"
      data-chapter="hero"
      aria-labelledby="hero-title"
      className="chapter relative min-h-[100svh] flex flex-col overflow-hidden"
    >
      <div data-stage role="img" aria-label={t.visualLabel} className="stage absolute top-0 inset-x-0 h-[100svh] min-h-[620px]">
        {flat && (
          <div className="flat-plate justify-end" aria-hidden="true">
            <AsciiArt piece="autumn-pagoda-maples" size={7} label={t.visualLabel} />
          </div>
        )}
      </div>

      <div className="relative flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-8 lg:pb-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <p data-calm className="w-fit label label-ink reveal">
            <i className="fa-solid fa-location-dot mr-2 text-accentText" aria-hidden="true" />
            {t.place} <span className="text-muted">· 36°43′N 4°25′W</span>
          </p>
          <aside data-calm className="hidden md:block max-w-[19rem] reveal" style={{ ['--d' as string]: '400ms' }}>
            <Rich text={t.pagoda} className="font-display text-[1.35rem] leading-[1.2] text-ink2" />
          </aside>
        </div>

        <div className="flex-1 min-h-[14vh]" />

        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 items-end">
          <h1 id="hero-title" data-calm className="lg:col-span-7 w-fit display text-[clamp(4.2rem,12.5vw,13.5rem)] text-ink -ml-[0.04em]">
            <Rise text={t.name1} />
            <Rise text={`_${t.name2}_`} delay={110} className="lg:pl-[0.55em]" />
          </h1>

          <div data-calm className="lg:col-span-5 lg:pb-5 xl:pl-10 w-fit">
            <Rich text={t.role} className="font-display text-[1.75rem] sm:text-[2.1rem] leading-[1.08] text-ink max-w-[20ch] reveal" />
            <div className="mt-5 reveal" style={{ ['--d' as string]: '80ms' }}>
              <p className="flex items-center gap-2 label label-ink"><span className="live-dot" aria-hidden="true" />{t.status}</p>
              <p className="mt-2 label tracking-[0.1em] lg:whitespace-nowrap">
                {t.chips.map((c, i) => <React.Fragment key={c}>{i > 0 && <span className="mx-2 opacity-50" aria-hidden="true">/</span>}{c}</React.Fragment>)}
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5 reveal" style={{ ['--d' as string]: '160ms' }}>
              <a href="#projects" className="btn btn-solid">{t.ctaProjects}<i className="fa-solid fa-arrow-right arrow text-[11px]" aria-hidden="true" /></a>
              <button type="button" onClick={onOpenCv} className="btn"><i className="fa-regular fa-file-lines" aria-hidden="true" />{t.ctaCv}</button>
            </div>
          </div>
        </div>

        <div data-calm className="mt-10 pt-4 border-t border-line flex items-center justify-between gap-6 animate-in fade-in fill-mode-both duration-1000 delay-700">
          <a href="#about" className="label label-ink inline-flex items-center gap-3">
            <span className="scroll-cue" aria-hidden="true" />{t.scroll}
          </a>
          <p className="caption hidden sm:flex items-center gap-2 text-ink2">
            <span className="lens-icon" aria-hidden="true" />
            {touch ? t.lensTouch : t.lens}
          </p>
          {/* room on the right for the assistant's button */}
          <div className="flex items-center gap-2 pr-[4.5rem] sm:pr-20">
            <ExternalLink href={CONTACT.github} className="icon-btn" aria-label="GitHub"><i className="fa-brands fa-github" aria-hidden="true" /></ExternalLink>
            <ExternalLink href={CONTACT.linkedin} className="icon-btn" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" aria-hidden="true" /></ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
