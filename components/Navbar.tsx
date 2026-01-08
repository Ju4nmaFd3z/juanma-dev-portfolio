
import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../translations';

interface NavbarProps {
  activeSection: string;
  lang: 'es' | 'en';
  setLang: (lang: 'es' | 'en') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenTerminal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, lang, setLang, theme, toggleTheme, onOpenTerminal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCVMenu, setShowCVMenu] = useState(false);
  const [showPrefsMenu, setShowPrefsMenu] = useState(false);
  
  const cvMenuRef = useRef<HTMLDivElement>(null);
  const prefsMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (cvMenuRef.current && !cvMenuRef.current.contains(event.target as Node)) {
        setShowCVMenu(false);
      }
      if (prefsMenuRef.current && !prefsMenuRef.current.contains(event.target as Node)) {
        setShowPrefsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: t.home, id: 'home' },
    { name: t.about, id: 'about' },
    { name: t.projects, id: 'projects' },
    { name: t.journey, id: 'experience-education' },
    { name: t.contact, id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = target.getBoundingClientRect().top;
    window.scrollTo({
      top: elementRect - bodyRect - offset,
      behavior: 'smooth'
    });
    setIsMenuOpen(false);
  };

  const togglePrefsMenu = () => {
    const nextState = !showPrefsMenu;
    setShowPrefsMenu(nextState);
    if (nextState) {
      setIsMenuOpen(false);
      setShowCVMenu(false);
    }
  };

  const toggleMobileNav = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (nextState) {
      setShowPrefsMenu(false);
      setShowCVMenu(false);
    }
  };

  const downloadCV = (fileLang: 'es' | 'en') => {
    const fileName = fileLang === 'es' 
      ? 'CVJuanManuelFernandezRodriguezES.pdf' 
      : 'CVJuanManuelFernandezRodriguezEN.pdf';
    
    const link = document.createElement('a');
    link.href = `/${fileName}`; 
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCVMenu(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] flex justify-center transition-all duration-500 px-4 sm:px-6 ${isScrolled ? 'pt-2 sm:pt-4' : 'pt-4 sm:pt-8'}`}>
      <nav className={`w-full max-w-5xl rounded-2xl h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border transition-all duration-500 ${
        isScrolled 
        ? 'bg-white/30 dark:bg-black/30 backdrop-blur-3xl border-black/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]' 
        : 'bg-black/5 dark:bg-white/5 backdrop-blur-md border-black/5 dark:border-white/5'
      }`}>
        
        <button onClick={() => handleNavClick('home')} className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] group-hover:bg-black/[0.07] dark:group-hover:bg-white/[0.07] group-hover:border-black/20 dark:group-hover:border-white/20 transition-all duration-700">
            <span className="text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white font-display font-bold text-sm sm:text-base tracking-tighter">JF</span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-display font-bold text-[11px] tracking-[0.15em] text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white uppercase transition-colors text-left">JUANMA</span>
            <span className="text-[7px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-[0.3em] mt-0.5 group-hover:text-neutral-500 transition-colors text-left">FERNÁNDEZ</span>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl border border-black/5 dark:border-white/5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeSection === link.id ? 'text-black dark:text-white bg-white/60 dark:bg-white/10 shadow-sm backdrop-blur-md' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Terminal Button */}
          <button 
            onClick={onOpenTerminal}
            className="w-8 h-8 sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
            title="Open Terminal (/)"
          >
            <i className="fa-solid fa-terminal text-[10px] text-emerald-500 group-hover:scale-110 transition-transform"></i>
          </button>

          {/* Preferences Dropdown */}
          <div className="relative" ref={prefsMenuRef}>
            <button 
              onClick={togglePrefsMenu}
              className={`w-8 h-8 sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all ${showPrefsMenu ? 'bg-black/10 dark:bg-white/10 border-blue-500/30' : ''}`}
              aria-label="Preferences"
            >
              <i className={`fa-solid fa-sliders text-[10px] text-neutral-500 dark:text-neutral-400 transition-transform duration-500 ${showPrefsMenu ? 'rotate-90 text-blue-500' : ''}`}></i>
            </button>

            {showPrefsMenu && (
              <div className="absolute top-full right-0 mt-3 w-52 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-out origin-top-right z-[100]">
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-[8px] font-black text-neutral-400 uppercase tracking-widest">{lang === 'es' ? 'Preferencias' : 'Preferences'}</div>
                  
                  {/* Language Selector in Dropdown */}
                  <div className="flex bg-black/[0.05] dark:bg-white/[0.05] rounded-xl p-1 mb-2">
                    <button 
                      onClick={() => setLang('es')}
                      className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${lang === 'es' ? 'bg-white/60 dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                    >
                      ESPAÑOL
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-white/60 dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                    >
                      ENGLISH
                    </button>
                  </div>

                  {/* Theme Toggle in Dropdown */}
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight">
                      {theme === 'dark' ? (lang === 'es' ? 'Modo Oscuro' : 'Dark Mode') : (lang === 'es' ? 'Modo Claro' : 'Light Mode')}
                    </span>
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-moon text-blue-400' : 'fa-sun text-amber-500'} text-xs`}></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={cvMenuRef}>
            <button 
              onClick={() => setShowCVMenu(!showCVMenu)}
              className={`hidden lg:flex items-center gap-2 px-4 py-2 lg:h-[38px] bg-black/[0.03] dark:bg-white/[0.03] text-black/70 dark:text-white/70 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/10 transition-all ${showCVMenu ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-blue-500/30' : ''}`}
            >
              <i className="fa-solid fa-download text-[10px]"></i>
              {t.downloadCV}
              <i className={`fa-solid fa-chevron-down text-[7px] transition-transform duration-300 ${showCVMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {showCVMenu && (
              <div className="absolute top-full right-0 mt-3 w-52 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-out origin-top-right">
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-[8px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">{lang === 'es' ? 'Seleccionar Idioma' : 'Select Language'}</div>
                  <button 
                    onClick={() => downloadCV('es')}
                    className="w-full px-3 py-3 rounded-xl flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                  >
                    <span>Español</span>
                    <i className="fa-solid fa-download text-[9px] opacity-30 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-300"></i>
                  </button>
                  <button 
                    onClick={() => downloadCV('en')}
                    className="w-full px-3 py-3 rounded-xl flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                  >
                    <span>English</span>
                    <i className="fa-solid fa-download text-[9px] opacity-30 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-300"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button className="lg:hidden text-black/70 dark:text-white/70 p-2" onClick={toggleMobileNav}>
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl transition-transform duration-300`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`absolute top-full left-0 right-0 mt-3 overflow-hidden transition-all duration-500 lg:hidden ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className={`bg-white/90 dark:bg-black/80 backdrop-blur-3xl rounded-2xl p-2 border border-black/10 dark:border-white/10 shadow-2xl mx-4 flex flex-col gap-1 transition-transform duration-500 ${isMenuOpen ? 'translate-y-0' : '-translate-y-4'}`}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left p-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex justify-between items-center transition-all ${
                  activeSection === link.id ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
                {activeSection === link.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>}
              </button>
            ))}
            
            <button 
              onClick={() => { setIsMenuOpen(false); onOpenTerminal(); }}
              className="w-full text-left p-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex justify-between items-center transition-all text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
            >
              Terminal (Shell)
              <i className="fa-solid fa-terminal"></i>
            </button>

            <div className="h-px bg-black/5 dark:bg-white/5 my-2 mx-4"></div>

            <div className="grid grid-cols-2 gap-2 p-2">
              <button onClick={() => downloadCV('es')} className="flex flex-col items-center gap-2 py-4 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-black/5 dark:border-white/5 active:scale-95">
                <span className="text-xl mb-1">🇪🇸</span>
                CV ESPAÑOL
              </button>
              <button onClick={() => downloadCV('en')} className="flex flex-col items-center gap-2 py-4 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-black/5 dark:border-white/5 active:scale-95">
                <span className="text-xl mb-1">🇬🇧</span>
                CV ENGLISH
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
