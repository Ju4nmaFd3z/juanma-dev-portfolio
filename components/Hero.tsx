
import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';

interface HeroProps { lang: 'es' | 'en'; }

const Hero: React.FC<HeroProps> = ({ lang }) => {
  const t = translations[lang].hero;
  const [showCVOptions, setShowCVOptions] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cvRef.current && !cvRef.current.contains(event.target as Node)) {
        setShowCVOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadCV = (fileLang: 'es' | 'en') => {
    const fileName = fileLang === 'es' 
      ? 'CVJuanManuelFernandezRodriguezES.pdf' 
      : 'CVJuanManuelFernandezRodriguezEN.pdf';
      
    const link = document.createElement('a');
    link.href = `/${fileName}`; 
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCVOptions(false);
  };

  const renderDescription = () => {
    const parts = t.desc.split('{bold}');
    return (
      <>
        {parts[0]}
        <strong className="text-black dark:text-white font-bold">{t.descBold}</strong>
        {parts[1]}
      </>
    );
  };

  return (
    <section className={`min-h-[70vh] md:min-h-[60vh] lg:min-h-[85vh] flex flex-col justify-center relative pt-28 md:pt-24 md:portrait:pt-40 lg:pt-48 overflow-visible transition-all duration-500 z-[50] ${showCVOptions ? 'pb-44' : 'pb-12'}`}>
      {/* Elementos decorativos de fondo (Marca de agua) - Ajustado top-32 para evitar el header */}
      <div className="absolute right-0 top-32 h-[75vh] hidden xl:flex flex-col justify-center items-end select-none pointer-events-none z-0">
        <span className="font-display font-black text-[400px] leading-[0.7] tracking-tighter text-black/5 dark:text-white/5">
          SMR
        </span>
        <span className="font-display font-black text-[400px] leading-[0.7] tracking-tighter text-blue-500/10 dark:text-blue-500/5 filter blur-[1px] mt-2">
          DAM
        </span>
      </div>

      <div className="max-w-6xl relative z-10 text-left">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 glass-card rounded-full border border-blue-500/20 bg-blue-500/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {t.role}
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 py-1.5 px-4 glass-card rounded-full border border-black/5 dark:border-white/5">
            <i className="fa-solid fa-location-dot text-[10px] text-neutral-400 dark:text-neutral-500"></i>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">Málaga, ES</span>
          </div>
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black mb-10 leading-[0.9] tracking-tighter text-neutral-900 dark:text-white">
          {t.title1} <br />
          <span className="gradient-text">{t.title2}</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-3xl mb-14 leading-relaxed">
          {renderDescription()}
        </p>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={scrollToContact}
            className="w-full sm:w-auto cursor-hide group relative px-8 py-5 bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5 overflow-hidden"
          >
            <span className="relative z-10">{t.cta}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform relative z-10"></i>
          </button>

          <div className="flex flex-1 sm:flex-initial items-center gap-3">
            <div className="relative flex-1 sm:flex-initial" ref={cvRef}>
              <button 
                onClick={() => setShowCVOptions(!showCVOptions)}
                className={`w-full sm:w-auto group px-8 py-5 bg-black/5 dark:bg-white/5 border text-neutral-900 dark:text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${showCVOptions ? 'border-blue-500/30 bg-black/10 dark:bg-white/10' : 'border-black/10 dark:border-white/10'}`}
              >
                <span className="whitespace-nowrap">{t.cv}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${showCVOptions ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showCVOptions && (
                <div className="absolute top-full mt-3 left-0 w-60 bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-out origin-top-left z-[100]">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-[8px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Idioma / Language</div>
                    <button 
                      onClick={() => downloadCV('es')}
                      className="w-full group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-600/10 dark:hover:bg-blue-500/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">🇪🇸</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200">Español</span>
                      </div>
                      <i className="fa-solid fa-download text-[10px] text-blue-600 dark:text-blue-400 opacity-30 group-hover:opacity-100 transition-all"></i>
                    </button>
                    <button 
                      onClick={() => downloadCV('en')}
                      className="w-full group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-600/10 dark:hover:bg-blue-500/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">🇬🇧</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-200">English</span>
                      </div>
                      <i className="fa-solid fa-download text-[10px] text-blue-600 dark:text-blue-400 opacity-30 group-hover:opacity-100 transition-all"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {[
                { icon: 'fa-brands fa-github', url: 'https://github.com/Ju4nmaFd3z' },
                { icon: 'fa-brands fa-linkedin-in', url: 'https://www.linkedin.com/in/juanma-fernández-rodríguez' }
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 flex items-center justify-center glass-card rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all border border-black/5 dark:border-white/5 group active:scale-95 shrink-0"
                >
                  <i className={`${link.icon} text-xl text-neutral-700 dark:text-white group-hover:scale-110 transition-transform duration-300`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
