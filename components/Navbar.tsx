import React, { useEffect, useRef, useState } from 'react';
import type { ChapterId } from '../engine/bus';
import { CHAPTERS } from '../engine/bus';
import type { Lang, T } from '../translations';

interface NavbarProps {
  active: ChapterId;
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
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

/** 5×5 pixel monogram used as the logo. */
const Mark: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="7" height="7" fill="var(--accent)" />
    {['..#....', '..#.#.#', '..#.###', '#.#.#.#', '.#..#.#'].flatMap((row, y) =>
      [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y + 1} width="1" height="1" fill="var(--on-accent)" /> : null)),
    )}
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ active, lang, setLang, theme, toggleTheme, onOpenCv, onOpenTerminal, t }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const idx = CHAPTERS.indexOf(active);

  const themeBtn = (
    <button type="button" onClick={toggleTheme} className="icon-btn" aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}>
      <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
    </button>
  );
  const langBtn = (
    <button type="button" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="icon-btn font-mono text-xs font-bold" aria-label={t.langLabel}>
      {lang === 'es' ? 'EN' : 'ES'}
    </button>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[10060] transition-colors duration-200 ${scrolled || open ? 'bg-panel border-b border-line backdrop-blur-md' : 'bg-transparent border-b border-transparent'}`}
      >
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10" aria-label="Principal">
          <a href="#home" className="flex items-center gap-3 shrink-0" aria-label="Juanma Fernández — inicio">
            <Mark />
            <span className="hidden sm:block font-pixel text-[13px] text-ink">juanma.dev</span>
          </a>

          <ul className="hidden xl:flex items-center gap-1 mx-auto">
            {CHAPTERS.map((c, i) => (
              <li key={c}>
                <a
                  href={`#${SECTION_ID[c]}`}
                  aria-current={active === c ? 'true' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors ${active === c ? 'bg-accent text-onAccent' : 'text-ink2 hover:text-ink hover:bg-bg2'}`}
                >
                  <span className="opacity-60" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {t[LABEL_KEY[c]]}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto xl:ml-0 flex items-center gap-2">
            <button type="button" onClick={onOpenTerminal} className="icon-btn hidden md:inline-flex font-mono text-xs" aria-label={t.terminal} title={t.terminal}>
              <span aria-hidden="true">&gt;_</span>
            </button>
            <div className="hidden md:flex gap-2">{langBtn}{themeBtn}</div>
            <button type="button" onClick={onOpenCv} className="btn btn-primary !min-h-[44px] !py-2 !px-4 !shadow-none hover:!translate-x-0 hover:!translate-y-0">
              <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
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
              <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[10050] bg-bg pt-20 px-6 pb-8 flex flex-col xl:hidden" role="dialog" aria-modal="true" aria-label={t.menu}>
          <ol className="flex-1 flex flex-col justify-center gap-1">
            {CHAPTERS.map((c, i) => (
              <li key={c}>
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={`#${SECTION_ID[c]}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === c ? 'true' : undefined}
                  className={`flex items-baseline gap-4 py-3 border-b border-line ${active === c ? 'text-accentText' : 'text-ink'}`}
                >
                  <span className="font-pixel text-xs text-muted w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display text-4xl sm:text-5xl">{t[LABEL_KEY[c]]}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            {langBtn}
            {themeBtn}
            <button type="button" onClick={() => { setOpen(false); onOpenTerminal(); }} className="icon-btn font-mono text-xs" aria-label={t.terminal}>
              <span aria-hidden="true">&gt;_</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress rail — desktop */}
      <nav className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-[900] flex-col items-end gap-2" aria-label={`${idx + 1} / ${CHAPTERS.length}`}>
        <span className="font-pixel text-[10px] text-muted mb-2" aria-hidden="true">
          {String(idx + 1).padStart(2, '0')}/{String(CHAPTERS.length).padStart(2, '0')}
        </span>
        {CHAPTERS.map((c) => (
          <a
            key={c}
            href={`#${SECTION_ID[c]}`}
            className="group flex items-center gap-2 py-1"
            aria-label={t[LABEL_KEY[c]]}
            aria-current={active === c ? 'true' : undefined}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              {t[LABEL_KEY[c]]}
            </span>
            <span className={`rail-tick block w-2 ${active === c ? 'h-6 bg-accent' : 'h-2 bg-lineStrong group-hover:bg-ink'}`} />
          </a>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
