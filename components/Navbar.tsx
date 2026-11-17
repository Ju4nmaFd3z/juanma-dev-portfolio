import React, { useEffect, useRef, useState } from 'react';
import type { ChapterId } from '../engine/bus';
import { CHAPTERS } from '../engine/bus';
import type { Lang, T } from '../translations';
import { BrandMark } from './ui';

interface NavbarProps {
  active: ChapterId;
  lang: Lang;
  setLang: (l: Lang) => void;
  onOpenCv: () => void;
  onOpenTerminal: () => void;
  t: T['nav'];
}

const SECTION_ID: Record<ChapterId, string> = {
  hero: 'home', about: 'about', skills: 'skills', projects: 'projects', journey: 'journey', contact: 'contact',
};
const LABEL_KEY: Record<ChapterId, keyof T['nav']> = {
  hero: 'home', about: 'about', skills: 'skills', projects: 'projects', journey: 'journey', contact: 'contact',
};

const Navbar: React.FC<NavbarProps> = ({ active, lang, setLang, onOpenCv, onOpenTerminal, t }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // Mobile menu: lock scroll, focus first link, Esc closes, focus returns.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      menuBtn.current?.focus();
    };
  }, [open]);


  const langBtn = (
    <button type="button" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="icon-btn font-mono text-[11px] font-medium tracking-wider" aria-label={t.langLabel}>
      {lang === 'es' ? 'EN' : 'ES'}
    </button>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[10060] transition-[background-color,border-color] duration-500 border-b ${scrolled || open ? 'bg-panel border-line backdrop-blur-xl' : 'nav-fade border-transparent'}`}
      >
        <nav data-calm-global className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-5 sm:px-8 lg:px-12" aria-label={t.main}>
          <a href="#home" className="flex items-center gap-3 shrink-0 group" aria-label={t.homeLink}>
            <BrandMark />
            <span className="hidden sm:block text-[15px] font-medium tracking-[-0.01em] text-ink">Juanma Fernández</span>
          </a>

          <ul className="hidden xl:flex items-center gap-1 mx-auto">
            {CHAPTERS.map((c) => (
              <li key={c}>
                <a
                  href={`#${SECTION_ID[c]}`}
                  aria-current={active === c ? 'true' : undefined}
                  className={`relative flex items-center px-3.5 py-2 text-[0.9rem] rounded-full transition-colors ${active === c ? 'text-ink bg-bg2' : 'text-muted hover:text-ink'}`}
                >
                  {t[LABEL_KEY[c]]}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto xl:ml-0 flex items-center gap-2">
            <button type="button" onClick={onOpenTerminal} className="icon-btn font-mono text-[11px]" aria-label={t.terminal} title={t.terminal}>
              <span aria-hidden="true">&gt;_</span>
            </button>
            <div className="hidden md:flex">{langBtn}</div>
            <button type="button" onClick={onOpenCv} className="btn btn-solid btn-sm !min-h-[44px]">
              <i className="fa-solid fa-arrow-down text-[10px]" aria-hidden="true" />
              {t.cv}
            </button>
            <button
              ref={menuBtn}
              type="button"
              className="icon-btn xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.close : t.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars-staggered'} text-[13px]`} aria-hidden="true" />
            </button>
          </div>
        </nav>
        <span ref={bar} className="absolute left-0 right-0 -bottom-px h-px bg-accent origin-left" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[10050] bg-bg pt-24 px-6 pb-8 flex flex-col xl:hidden" role="dialog" aria-modal="true" aria-label={t.menu}>
          <ol className="flex-1 flex flex-col justify-center">
            {CHAPTERS.map((c, i) => (
              <li key={c} className="border-b border-line">
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={`#${SECTION_ID[c]}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === c ? 'true' : undefined}
                  className="flex items-baseline gap-5 py-3.5"
                >
                  <span className={`display text-[2.9rem] sm:text-6xl ${active === c ? 'italic text-accentText' : 'text-ink'}`}>{t[LABEL_KEY[c]]}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 pt-6">
            {langBtn}
          </div>
        </div>
      )}

      {/* Chapter rail — desktop */}
      <nav className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-[900] flex-col items-end gap-1" aria-label={t.sections}>
        {CHAPTERS.map((c) => (
          <a
            key={c}
            href={`#${SECTION_ID[c]}`}
            className="group flex items-center gap-3 py-1.5"
            aria-label={t[LABEL_KEY[c]]}
            aria-current={active === c ? 'true' : undefined}
          >
            <span className="label opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition-all">
              {t[LABEL_KEY[c]]}
            </span>
            <span className={`block rounded-full transition-all duration-500 ${active === c ? 'w-2.5 h-2.5 bg-accent' : 'w-1.5 h-1.5 bg-lineStrong group-hover:bg-ink'}`} />
          </a>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
