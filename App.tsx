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
const FloatingAI = lazy(() => import('./components/FloatingAI'));

const readLang = (): Lang => {
  try {
    const s = localStorage.getItem('lang');
    if (s === 'es' || s === 'en') return s;
  } catch { /* storage blocked */ }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
};
const readTheme = (): 'dark' | 'light' => {
  try {
    const s = localStorage.getItem('theme');
    if (s === 'dark' || s === 'light') return s;
  } catch { /* storage blocked */ }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};
const introSeen = () => {
  try { return sessionStorage.getItem('intro') === '1'; } catch { return false; }
};

const SECTION_TO_CHAPTER: Record<string, ChapterId> = {
  home: 'hero', about: 'about', skills: 'skills', projects: 'projects', journey: 'journey', contact: 'contact',
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(readLang);
  const [theme, setTheme] = useState<'dark' | 'light'>(readTheme);
  const [loading, setLoading] = useState(() => !introSeen() && !prefersReducedMotion());
  const [active, setActive] = useState<ChapterId>('hero');
  const [terminal, setTerminal] = useState(false);
  const [doc, setDoc] = useState<ViewerDoc | null>(null);
  const [webgl, setWebgl] = useState<'pending' | 'on' | 'off'>('pending');
  const [aiReady, setAiReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef(terminal);
  terminalRef.current = terminal;

  const t = translations[lang];

  // ── Theme & language ──────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    document.getElementById('theme-meta')?.setAttribute('content', theme === 'dark' ? '#07080f' : '#f2ecdf');
    bus.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'es'
      ? 'Juanma Fernández · Sistemas, redes y software'
      : 'Juanma Fernández · Systems, networks & software';
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
          world = new World(canvasRef.current, { reduced: prefersReducedMotion(), low, onFail: fail });
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

  // Intro resolve: when the preloader is gone, the world "resolves" in.
  useEffect(() => {
    if (!loading) {
      bus.introAt = performance.now();
      const id = window.setTimeout(() => setAiReady(true), 1500);
      return () => clearTimeout(id);
    }
  }, [loading]);

  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem('intro', '1'); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // ── Pointer → world (parallax, dish aim) ──────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      bus.px = (e.clientX / window.innerWidth) * 2 - 1;
      bus.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
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
    return () => io.disconnect();
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
  const toggleTheme = useCallback(() => setTheme((p) => (p === 'dark' ? 'light' : 'dark')), []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[30000] btn btn-primary">{t.meta.skip}</a>

      {webgl !== 'off' ? (
        <canvas ref={canvasRef} className="world" aria-hidden="true" />
      ) : (
        <div className="world-fallback" aria-hidden="true" />
      )}

      {loading && <Preloader t={t.preloader} onDone={finishIntro} />}

      <Navbar
        active={active}
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenCv={openCv}
        onOpenTerminal={() => setTerminal(true)}
        t={t.nav}
      />

      <main id="main" className="relative z-[1]" aria-hidden={loading || undefined}>
        <Hero t={t.hero} onOpenCv={openCv} />
        <About t={t.about} />
        <Skills t={t.skills} />
        <Projects t={t.projects} />
        <Journey t={t.journey} onOpenDocument={setDoc} />
        <Contact t={t.contact} onOpenCv={openCv} cvLabel={t.hero.ctaCv} />
      </main>

      <Footer t={t.footer} quote={t.about.quote} />

      {webgl === 'off' && (
        <p className="fixed bottom-3 left-3 z-[50] max-w-xs panel px-3 py-2 text-xs text-muted" role="note">{t.fallback}</p>
      )}

      <Terminal isOpen={terminal} onClose={() => setTerminal(false)} lang={lang} />
      {aiReady && (
        <Suspense fallback={null}>
          <FloatingAI lang={lang} />
        </Suspense>
      )}
      <DocumentViewer doc={doc} onClose={() => setDoc(null)} labels={t.viewer} />
    </>
  );
};

export default App;
