
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
    <section className="hero-section min-h-[90vh] flex flex-col justify-center relative pt-32 md:pt-40 lg:pt-0 pb-12 overflow-visible transition-all duration-500 z-[50]">
      
      {/* Grid principal optimizado para pantallas grandes */}
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-8 items-center relative z-10 w-full">
        
        {/* LADO IZQUIERDO: TEXTO PRINCIPAL */}
        <div className="flex flex-col items-start text-left space-y-8 order-1 lg:order-1">
          <div className="flex flex-wrap items-center justify-start gap-3">
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
          
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-display font-black leading-[0.85] tracking-tighter text-neutral-900 dark:text-white max-w-[20ch] lg:max-w-none">
            <span className="inline-block whitespace-nowrap">{t.title1}</span>
            <span className="inline lg:hidden xl:inline"> </span>
            <br className="hidden lg:block xl:hidden" />
            <span className="gradient-text inline-block whitespace-nowrap">{t.title2}</span>
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
            {renderDescription()}
          </p>
          
          <div className="flex flex-wrap justify-start gap-4 items-center pt-4 w-full">
            <button 
              onClick={scrollToContact}
              className="w-full sm:w-auto cursor-hide group relative px-6 py-4 sm:px-8 sm:py-5 bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5 overflow-hidden"
            >
              <span className="relative z-10">{lang === 'es' ? 'HABLEMOS' : 'LET\'S TALK'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform relative z-10"></i>
            </button>

            <div className="relative flex-1 sm:flex-initial w-full sm:w-auto" ref={cvRef}>
              <button 
                onClick={() => setShowCVOptions(!showCVOptions)}
                className={`w-full sm:w-auto group px-6 py-4 sm:px-8 sm:py-5 bg-black/5 dark:bg-white/5 border text-neutral-900 dark:text-white text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${showCVOptions ? 'border-blue-500/30 bg-black/10 dark:bg-white/10' : 'border-black/10 dark:border-white/10'}`}
              >
                <span className="whitespace-nowrap">{t.cv}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${showCVOptions ? 'rotate-180' : ''}`}></i>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showCVOptions ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl p-2 space-y-1">
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
            </div>

            <div className={`flex gap-3 justify-start transition-all duration-500 ${showCVOptions ? 'mt-4' : 'mt-0'}`}>
              {[
                { icon: 'fa-brands fa-github', url: 'https://github.com/Ju4nmaFd3z' },
                { icon: 'fa-brands fa-linkedin-in', url: 'https://www.linkedin.com/in/juanma-fernández-rodríguez' }
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center glass-card rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all border border-black/5 dark:border-white/5 group active:scale-95 shrink-0"
                >
                  <i className={`${link.icon} text-lg sm:text-xl text-neutral-700 dark:text-white group-hover:scale-110 transition-transform duration-300`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: FOTO PROFESIONAL */}
        <div className="relative flex justify-center items-center order-2 lg:order-2">
          <div className="relative w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[380px] xl:max-w-[440px] group perspective-1000">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[165%] h-[165%] bg-indigo-950/25 dark:bg-indigo-950/35 rounded-full blur-[150px] -z-10 animate-glow-pulse-organic"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] bg-blue-900/10 dark:bg-blue-800/15 rounded-full blur-[110px] -z-10 group-hover:bg-blue-700/20 transition-all duration-1000"></div>
            
            <div className="relative animate-in zoom-in-95 fade-in duration-1000 ease-out flex items-center justify-center">
              <div className="relative glass-card p-4 rounded-[4rem] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden group-hover:scale-[1.03] group-hover:border-blue-500/20 transition-all duration-1000">
                <div className="absolute inset-0 z-20 pointer-events-none rounded-[3.8rem] ring-inset ring-1 ring-white/10 shadow-[inset_0_0_80px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_0_120px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_0_60px_rgba(30,58,138,0.2)] transition-all duration-1000"></div>
                <img 
                  src="https://static.vecteezy.com/system/resources/thumbnails/071/080/381/small/a-handsome-young-man-isolated-on-transparent-background-is-smiling-and-looking-up-with-a-happy-and-carefree-expression-on-his-face-free-png.png" 
                  alt="Juanma Fernández" 
                  className="relative w-full h-auto object-cover rounded-[3.8rem] transition-all duration-1000 z-10 select-none pointer-events-none group-hover:brightness-[1.04]"
                  style={{ 
                    maskImage: 'radial-gradient(ellipse at center, black 68%, transparent 95%)', 
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 68%, transparent 95%)' 
                  }}
                />
              </div>

              <div className="absolute -bottom-4 -right-2 sm:-right-6 glass-card p-3 sm:p-4 rounded-3xl border border-white/20 shadow-xl animate-bounce-slow z-30 transform hover:scale-105 transition-transform duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-950 flex items-center justify-center text-white">
                    <i className="fa-solid fa-code text-[10px]"></i>
                  </div>
                  <div className="flex flex-col pr-1 sm:pr-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Availability</span>
                    <span className="text-[11px] font-black text-neutral-900 dark:text-white whitespace-nowrap">Ready for Internships</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse-organic {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); filter: blur(150px); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: blur(170px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-glow-pulse-organic {
          animation: glow-pulse-organic 12s ease-in-out infinite;
        }
        
        @media (orientation: landscape) {
          .hero-section {
            padding-top: 10rem !important;
            padding-bottom: 2rem !important;
            min-height: auto !important;
          }
        }

        @media (orientation: landscape) and (min-width: 1024px) {
          .hero-section {
            padding-top: 12rem !important;
            padding-bottom: 4rem !important;
            min-height: 90vh !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
