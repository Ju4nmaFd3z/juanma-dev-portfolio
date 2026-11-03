import React from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { ExternalLink } from './ui';

const Footer: React.FC<{ t: T['footer']; quote: string }> = ({ t, quote }) => (
  <footer className="relative z-[1] border-t border-line bg-panel backdrop-blur-sm">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="font-pixel text-sm text-ink">Juanma Fernández</p>
        <p className="mt-1 text-sm text-muted">{t.role}</p>
        <p className="mt-4 font-display text-lg text-ink2 max-w-[52ch]">“{quote}”</p>
        <p className="mt-6 text-xs text-muted max-w-[70ch] leading-relaxed">
          {t.built}{' '}
          <ExternalLink href="https://www.ascii-magic.com/ascii" className="link-u text-ink2">{t.ascii}</ExternalLink>
        </p>
        <p className="mt-2 text-xs text-muted">
          © {new Date().getFullYear()} Juan Manuel Fernández Rodríguez · Málaga · <span className="hidden md:inline font-mono">{t.terminal}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ExternalLink href={CONTACT.github} className="icon-btn" aria-label="GitHub"><i className="fa-brands fa-github" aria-hidden="true" /></ExternalLink>
        <ExternalLink href={CONTACT.linkedin} className="icon-btn" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" aria-hidden="true" /></ExternalLink>
        <a href={`mailto:${CONTACT.email}`} className="icon-btn" aria-label={`Email: ${CONTACT.email}`}><i className="fa-solid fa-envelope" aria-hidden="true" /></a>
        <a href="#home" className="btn btn-ghost !min-h-[44px] !py-2"><i className="fa-solid fa-arrow-up" aria-hidden="true" />{t.top}</a>
      </div>
    </div>
  </footer>
);

export default Footer;
