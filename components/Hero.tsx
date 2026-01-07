
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
    <section className={`min-h-[85vh] flex flex-col justify-center relative pt-32 md:pt-40 lg:pt-48 overflow-visible transition-all duration-500 z-[50] ${showCVOptions ? 'pb-44' : 'pb-12'}`}>
      
      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* LADO IZQUIERDO: TEXTO PRINCIPAL */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
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
              <i className="fa-solid fa-location-dot text-[10px] text-neutral-400"></i>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Málaga, ES</span>
            </div>
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black leading-[0.85] tracking-tighter text-neutral-900 dark:text-white">
            {t.title1} <br />
            <span className="gradient-text">{t.title2}</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
            {renderDescription()}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center pt-4">
            <button 
              onClick={scrollToContact}
              className="w-full sm:w-auto cursor-hide group relative px-8 py-5 bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5 overflow-hidden"
            >
              <span className="relative z-10">{lang === 'es' ? 'HABLEMOS' : 'LET\'S TALK'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform relative z-10"></i>
            </button>

            <div className="relative flex-1 sm:flex-initial" ref={cvRef}>
              <button 
                onClick={() => setShowCVOptions(!showCVOptions)}
                className={`w-full sm:w-auto group px-8 py-5 bg-black/5 dark:bg-white/5 border text-neutral-900 dark:text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${showCVOptions ? 'border-blue-500/30 bg-black/10 dark:bg-white/10' : 'border-black/10 dark:border-white/10'}`}
              >
                <span className="whitespace-nowrap">{t.cv}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${showCVOptions ? 'rotate-180' : ''}`}></i>
              </button>
              
              {showCVOptions && (
                <div className="absolute top-full mt-3 left-0 w-60 bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-out origin-top-right z-[100]">
                  <div className="p-2 space-y-1">
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

        {/* LADO DERECHO: COMPOSICIÓN PROFESIONAL DINÁMICA - ESCALADO AGRESIVO */}
        <div className="lg:col-span-5 relative">
          <div className="relative flex justify-center items-end group perspective-1000">
            
            {/* ELEMENTOS TRASEROS: Luces ambientales */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] group-hover:bg-purple-500/15 transition-all duration-1000 ease-in-out -z-10"></div>
            
            {/* FOTO PRINCIPAL: Efecto PNG puro - TRANSFORMACIONES AGRESIVAS */}
            <div className="relative animate-in slide-in-from-bottom-12 fade-in duration-1000 ease-out overflow-visible flex items-end">
              <img 
                src="/images/me.png" 
                alt="Juanma Fernández" 
                className="w-full h-auto object-contain filter dark:brightness-[0.9] contrast-[1.05] transition-all duration-700 select-none pointer-events-none z-10 
                           origin-bottom
                           max-w-[450px]
                           lg:max-w-[800px] lg:scale-110 lg:translate-y-12
                           xl:max-w-[1000px] xl:scale-[1.5] xl:translate-y-40
                           2xl:max-w-[1200px] 2xl:scale-[1.7] 2xl:translate-y-56
                           group-hover:-translate-y-2 lg:group-hover:translate-y-10 xl:group-hover:translate-y-36 2xl:group-hover:translate-y-52"
                style={{ 
                  maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', 
                  WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' 
                }}
              />
            </div>

            {/* ELEMENTOS DELANTEROS: Floating Status Card */}
            <div className="hidden lg:block absolute bottom-16 -left-8 sm:bottom-1 sm:-left-16 glass-card p-5 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-bounce-slow transform hover:scale-110 transition-transform duration-500 cursor-default z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <i className="fa-solid fa-code text-lg"></i>
                </div>
                <div className="flex flex-col pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Availability</span>
                  </div>
                  <span className="text-xs font-black text-neutral-900 dark:text-white whitespace-nowrap">Ready for Internships</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Texto Vertical Decorativo */}
      <div className="absolute -right-16 top-[55%] -translate-y-1/2 rotate-90 hidden xl:block">
        <span className="text-[10px] font-black uppercase tracking-[1em] text-neutral-300 dark:text-neutral-800 whitespace-nowrap">
          EST. 2007 // MÁLAGA ES
        </span>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
