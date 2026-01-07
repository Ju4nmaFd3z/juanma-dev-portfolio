
import React, { useState, useEffect } from 'react';
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
import Terminal from './components/Terminal';
import Preloader from './components/Preloader';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as 'dark' | 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const t = translations[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isTerminalOpen) {
        e.preventDefault();
        setIsTerminalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalOpen]);

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
        el.classList.add('section-fade');
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <>
      {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}
      
      {/* Elementos de fondo y UI fija fuera del contenedor escalado */}
      <SnowEffect theme={theme} />

      <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar 
          activeSection={activeSection} 
          lang={lang} 
          setLang={setLang} 
          theme={theme} 
          toggleTheme={toggleTheme}
          onOpenTerminal={() => setIsTerminalOpen(true)}
        />
        <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} lang={lang} />
      </div>

      {/* Contenedor principal con la animación de escala */}
      <div className={`min-h-screen relative selection:bg-blue-500/30 text-neutral-800 dark:text-neutral-200 transition-all duration-1000 ${isLoading ? 'opacity-0 scale-95 overflow-hidden h-screen' : 'opacity-100 scale-100'}`}>
        
        <main className="container mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
          <section id="home">
            <Hero lang={lang} />
          </section>
          
          <section id="about" className="py-10 lg:py-24">
            <About lang={lang} />
          </section>
          
          <section id="projects" className="py-10 lg:py-24 border-t border-black/5 dark:border-white/5">
            <Projects lang={lang} />
          </section>
          
          <section id="experience-education" className="py-10 lg:py-24 border-t border-black/5 dark:border-white/5">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <Experience lang={lang} />
              <Education lang={lang} />
            </div>
          </section>

          <section id="contact" className="py-10 lg:py-24 border-t border-black/5 dark:border-white/5">
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
