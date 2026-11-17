import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Journey from './components/Journey';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Terminal from './components/Terminal';
import Preloader from './components/Preloader';
import DocumentViewer from './components/DocumentViewer';
import { translations, type Lang } from './translations';
import { buildCvDoc } from './utils/cvDoc';
import { bus, CHAPTERS, type ChapterId } from './engine/bus';
import { prefersReducedMotion } from './components/ui';
import type { ViewerDoc } from './types';

// The assistant is non-essential: load it after first paint, in its own chunk.
const Assistant = lazy(() => import('./components/Assistant'));

const readLang = (): Lang => {
  try {
    const s = localStorage.getItem('lang');
    if (s === 'es' || s === 'en') return s;
  } catch { /* storage blocked */ }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
};
const introSeen = () => {
  try { return sessionStorage.getItem('intro') === '1'; } catch { return false; }
};

const SECTION_TO_CHAPTER: Record<string, ChapterId> = {
  home: 'hero', about: 'about', skills: 'skills', projects: 'projects', journey: 'journey', contact: 'contact',
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(readLang);
  const [loading, setLoading] = useState(() => !introSeen() && !prefersReducedMotion());
  const [active, setActive] = useState<ChapterId>('hero');
  const [terminal, setTerminal] = useState(false);
  const [doc, setDoc] = useState<ViewerDoc | null>(null);
  const [webgl, setWebgl] = useState<'pending' | 'on' | 'off'>('pending');
  const [aiReady, setAiReady] = useState(false);
  const [noteOpen, setNoteOpen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef(terminal);
  terminalRef.current = terminal;

  const t = translations[lang];
  const flat = webgl === 'off';

  // ── Language ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translations[lang].meta.title;
    try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  }, [lang]);

  // ── The world (lazy WebGL engine) ─────────────────────────────
  useEffect(() => {
    let disposed = false;
    let world: { dispose(): void } | null = null;
    const fail = () => {
      world?.dispose();
      world = null;
      if (!disposed) setWebgl('off');
    };
    import('./engine/World')
      .then(({ World, canUseWebGL }) => {
        if (disposed) return;
        // ?2d forces the no-WebGL experience (handy for testing the fallback).
        const forced2d = new URLSearchParams(location.search).has('2d');
        if (forced2d || !canUseWebGL() || !canvasRef.current) { fail(); return; }
        const low = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
        try {
          world = new World(canvasRef.current, {
            reduced: prefersReducedMotion(),
            low,
            journey: [...translations.es.journey.items].reverse().map((m) => ({ kind: m.kind, year: m.period.match(/\d{4}/)?.[0] ?? '' })),
            onFail: fail,
          });
          setWebgl('on');
        } catch (err) {
          console.warn('[world] WebGL unavailable, using fallback', err);
          fail();
        }
      })
      .catch(fail);
    return () => { disposed = true; world?.dispose(); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('no-webgl', webgl === 'off');
  }, [webgl]);

  // Intro: the hero prints itself in as the loader breaks away (or at once
  // when there is no loader).
  useEffect(() => {
    if (!loading) {
      if (!bus.introAt) bus.introAt = performance.now();
      const id = window.setTimeout(() => setAiReady(true), 1500);
      return () => clearTimeout(id);
    }
  }, [loading]);

  const revealIntro = useCallback(() => { bus.introAt = performance.now(); }, []);
  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem('intro', '1'); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // ── Pointer → world (parallax, the lens) ──────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      bus.px = (e.clientX / window.innerWidth) * 2 - 1;
      bus.py = (e.clientY / window.innerHeight) * 2 - 1;
      bus.lx = e.clientX;
      bus.ly = e.clientY;
      bus.lens = 'hover';
    };
    // Touch: the lens blooms only on a real tap. A finger that starts a scroll
    // moves (or the browser cancels the pointer), so it never fires mid-scroll.
    let down: { x: number; y: number; t: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      down = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId };
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      // event timestamps, not handler time: a busy main thread must not turn a tap into a press
      const still = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10 && e.timeStamp - down.t < 350;
      down = null;
      if (!still) return;
      bus.lx = e.clientX;
      bus.ly = e.clientY;
      bus.lens = 'tap';
      bus.lensAt = performance.now();
    };
    const onCancel = () => { down = null; };
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) bus.lens = 'off'; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  // ── Active chapter for the navigation ─────────────────────────
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(SECTION_TO_CHAPTER[e.target.id] ?? 'hero');
      }),
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    CHAPTERS.forEach((c) => {
      const el = document.querySelector(`[data-chapter="${c}"]`);
      if (el) io.observe(el);
    });
    // The last chapter is shorter than the viewport: at the very bottom of the
    // page its middle line is never crossed, so claim it explicitly.
    const onScroll = () => {
      const d = document.documentElement;
      if (window.scrollY + window.innerHeight >= d.scrollHeight - 8) setActive('contact');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  // ── Terminal shortcut ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
      if (e.key === '/' && !terminalRef.current && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setTerminal(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openCv = useCallback(() => setDoc(buildCvDoc(lang, t.viewer.cvTitle)), [lang, t.viewer.cvTitle]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[30000] btn btn-solid">{t.meta.skip}</a>

      {webgl !== 'off' ? (
        <canvas ref={canvasRef} className="world" aria-hidden="true" />
      ) : (
        <div className="world-fallback" aria-hidden="true" />
      )}

      {loading && <Preloader t={t.preloader} onReveal={revealIntro} onDone={finishIntro} />}

      <Navbar
        active={active}
        lang={lang}
        setLang={setLang}
        onOpenCv={openCv}
        onOpenTerminal={() => setTerminal(true)}
        t={t.nav}
      />

      <main id="main" className="relative z-[1]" aria-hidden={loading || undefined}>
        <Hero t={t.hero} flat={flat} onOpenCv={openCv} />
        <About t={t.about} flat={flat} />
        <Skills t={t.skills} />
        <Projects t={t.projects} />
        <Journey t={t.journey} onOpenDocument={setDoc} />
        <Contact t={t.contact} flat={flat} />
      </main>

      <Footer t={t.footer} quote={t.about.quote} />

      {webgl === 'off' && noteOpen && (
        <div className="fixed bottom-4 left-4 z-[50] max-w-xs panel rounded-xl pl-4 pr-2 py-2 flex items-start gap-2 text-xs text-ink2" role="note">
          <p className="py-1">{t.fallback}</p>
          <button type="button" onClick={() => setNoteOpen(false)} className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-muted hover:text-ink" aria-label={t.meta.dismiss}>
            <i className="fa-solid fa-xmark text-[11px]" aria-hidden="true" />
          </button>
        </div>
      )}

      <Terminal
        isOpen={terminal}
        onClose={() => setTerminal(false)}
        lang={lang}
        t={t}
        setLang={setLang}
        onOpenCv={openCv}
      />
      {aiReady && (
        <Suspense fallback={null}>
          <Assistant lang={lang} onOpenCv={openCv} />
        </Suspense>
      )}
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} labels={t.viewer} />
    </>
  );
};

export default App;
