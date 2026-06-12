
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingAI from './components/FloatingAI';
import SnowEffect from './components/SnowEffect';
import CursorGlow from './components/CursorGlow';
import Terminal from './components/Terminal';
import Preloader from './components/Preloader';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadingComplete = useCallback(() => setIsLoading(false), []);
  const isTerminalOpenRef = useRef(isTerminalOpen);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const t = translations[lang];

  useEffect(() => { isTerminalOpenRef.current = isTerminalOpen; }, [isTerminalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTypingField = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;
      if (e.key === '/' && !isTerminalOpenRef.current && !isTypingField) {
        e.preventDefault();
        setIsTerminalOpen(true);
      }
      if (e.key === 'Escape') setIsTerminalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Stable — reads current open state via ref

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const root = window.document.documentElement;
    const themeMeta = document.getElementById('theme-meta');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      if (themeMeta) themeMeta.setAttribute('content', '#050505');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      if (themeMeta) themeMeta.setAttribute('content', '#fafafa');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const sectionIds = ['home', 'about', 'projects', 'experience-education', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const handleOpenTerminal  = useCallback(() => setIsTerminalOpen(true),  []);
  const handleCloseTerminal = useCallback(() => setIsTerminalOpen(false), []);

  return (
    <>
      {isLoading && <Preloader onLoadingComplete={handleLoadingComplete} />}

      {!isLoading && <SnowEffect theme={theme} />}
      {!isLoading && <CursorGlow />}

      <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-hidden={isLoading}>
        <Navbar
          activeSection={activeSection}
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenTerminal={handleOpenTerminal}
        />
        <Terminal isOpen={isTerminalOpen} onClose={handleCloseTerminal} lang={lang} />
      </div>

      <div className={`min-h-screen relative selection:bg-blue-500/30 text-neutral-800 dark:text-neutral-200 transition-opacity duration-1000 ${isLoading ? 'opacity-0 overflow-hidden h-screen' : 'opacity-100'}`}>
        
        <main id="main" className="container mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
          <section id="home" aria-label={t.nav.home}>
            <Hero lang={lang} />
          </section>

          <section id="about" className="section-fade py-14 lg:py-24 border-t border-black/5 dark:border-white/5" aria-label={t.nav.about}>
            <About lang={lang} />
          </section>

          <section id="projects" className="section-fade py-14 lg:py-24 border-t border-black/5 dark:border-white/5" aria-label={t.nav.projects}>
            <Projects lang={lang} />
          </section>

          <section id="experience-education" className="section-fade py-14 lg:py-24 border-t border-black/5 dark:border-white/5" aria-label={t.nav.journey}>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <Experience lang={lang} />
              <Education lang={lang} />
            </div>
          </section>

          <section id="contact" className="section-fade py-14 lg:py-24 border-t border-black/5 dark:border-white/5" aria-label={t.nav.contact}>
            <Contact lang={lang} />
          </section>
        </main>

        <Footer lang={lang} />
      </div>

      {!isLoading && <FloatingAI lang={lang} />}
    </>
  );
};

export default App;
