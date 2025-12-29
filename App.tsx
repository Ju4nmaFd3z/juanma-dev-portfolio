
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
import { translations } from './translations';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState<'es' | 'en'>('es');
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
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
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
    <div className="min-h-screen relative bg-gray-100 dark:bg-[#050505] selection:bg-blue-500/30 text-neutral-800 dark:text-neutral-200 transition-colors duration-700">
      <SnowEffect theme={theme} />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar activeSection={activeSection} lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
        <section id="home">
          <Hero lang={lang} />
        </section>
        
        <section id="about" className="py-10 lg:py-24 border-t border-black/5 dark:border-white/5">
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
      <FloatingAI lang={lang} />
    </div>
  );
};

export default App;
