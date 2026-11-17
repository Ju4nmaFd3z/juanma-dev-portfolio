import React, { useEffect, useState } from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { AsciiArt, BrandMark, ExternalLink } from './ui';

/** Width of one circuit-trace tile: 96 monospace columns at 8 px. */
const TILE = 96 * 0.602 * 8;
const SPEEDS = [1, 0.8, 1.25, 0.9, 1.1, 0.7];

/** A faint circuit trace across almost the whole width: tiles of the same
 * animated piece, each running at its own speed so the pattern never repeats. */
const Circuit: React.FC = () => {
  const [n, setN] = useState(3);
  useEffect(() => {
    const fit = () => setN(Math.max(1, Math.ceil((window.innerWidth * 0.94) / TILE)));
    fit();
    window.addEventListener('resize', fit, { passive: true });
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="circuit mx-auto w-[94vw] flex justify-center overflow-hidden pt-6 pb-1" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <AsciiArt key={i} piece="circuit-trace" size={8} speed={SPEEDS[i % SPEEDS.length]} label="" className="shrink-0" />
      ))}
    </div>
  );
};

const Footer: React.FC<{ t: T['footer']; quote: string }> = ({ t, quote }) => (
  <footer className="relative z-[1] border-t border-line bg-bg">
    <div className="overflow-hidden border-b border-line py-7" aria-hidden="true">
      <div className="marquee">
        {[0, 1].map((k) => (
          <span key={k} className="display text-[clamp(2.6rem,5.5vw,5rem)] text-ink2 whitespace-nowrap">
            <em className="text-accentText">“</em>{quote}<em className="text-accentText">”</em>
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>

    <Circuit />

    <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 flex flex-wrap items-end justify-between gap-8">
      <div>
        <p className="flex items-center gap-3">
          <BrandMark size={30} />
          <span className="text-[1.15rem] font-medium tracking-[-0.01em] text-ink">Juanma Fernández</span>
        </p>
        <p className="mt-3 label">{t.role}</p>
        <p className="mt-6 caption">© {new Date().getFullYear()} · Málaga</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:pr-20">
        <ExternalLink href={CONTACT.github} className="icon-btn" aria-label="GitHub"><i className="fa-brands fa-github" aria-hidden="true" /></ExternalLink>
        <ExternalLink href={CONTACT.linkedin} className="icon-btn" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" aria-hidden="true" /></ExternalLink>
        <a href={`mailto:${CONTACT.email}`} className="icon-btn" aria-label={`Email: ${CONTACT.email}`}><i className="fa-regular fa-envelope" aria-hidden="true" /></a>
        <a href="#home" className="btn btn-sm ml-1"><i className="fa-solid fa-arrow-up text-[10px]" aria-hidden="true" />{t.top}</a>
      </div>
    </div>
  </footer>
);

export default Footer;
