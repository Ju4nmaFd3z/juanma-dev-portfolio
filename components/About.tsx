
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { translations } from '../translations';

interface AboutProps { lang: 'es' | 'en'; }

const About: React.FC<AboutProps> = ({ lang }) => {
  const t = translations[lang].about;
  const [isSkillsVisible, setIsSkillsVisible] = useState(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const stats = [
    { label: t.stats[0].label, value: t.stats[0].value, sub: t.stats[0].sub, icon: 'fa-solid fa-star', color: 'blue' },
    { label: t.stats[1].label, value: t.stats[1].value, sub: t.stats[1].sub, icon: 'fa-solid fa-plane-up', color: 'purple' },
    { label: t.stats[2].label, value: t.stats[2].value, sub: t.stats[2].sub, icon: 'fa-solid fa-shield-halved', color: 'emerald' }
  ];

  // =========================================================================================
  // CONFIGURACIÓN DE GALERÍA DE INFANCIA
  // Sustituye las URLs de abajo por las rutas de tus fotos finales (ej: "/fotos/foto1.jpg")
  // =========================================================================================
  const childhoodPhotos = [
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800", // <-- SUSTITUIR POR TU FOTO 1 (La principal)
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800", // <-- SUSTITUIR POR TU FOTO 2
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800"  // <-- SUSTITUIR POR TU FOTO 3
  ];
  // =========================================================================================

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSkillsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Navegación de fotos
  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % childhoodPhotos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + childhoodPhotos.length) % childhoodPhotos.length);
  };

  // Bloquear scroll y gestos de teclado
  useEffect(() => {
    if (isPhotoExpanded) {
      document.body.style.overflow = 'hidden';
      document.body.classList.remove('cursor-hidden-active');
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsPhotoExpanded(false);
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isPhotoExpanded]);

  return (
    <div className="relative">
      <div className="flex flex-col mb-16">
        <span className="text-blue-600 dark:text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">{t.badge}</span>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-none text-neutral-900 dark:text-white">
          {t.title1} <br />
          <span className="gradient-text">{t.title2}</span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Bio Card */}
        <div className="lg:col-span-8 glass-card p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
          {/* Foto de infancia interactiva */}
          <div className="absolute top-10 right-10 hidden sm:block z-30">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPhotoIndex(0);
                setIsPhotoExpanded(true);
              }}
              className="relative group cursor-hide block"
              aria-label="Ver fotos de mi infancia"
            >
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              {/* Apilamiento visual de fotos (Efecto abanico) */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-white/10 bg-neutral-800 rotate-6 translate-x-1 translate-y-1 scale-95 opacity-40 transition-transform group-hover:rotate-12 group-hover:translate-x-3"></div>
                <img 
                  src={childhoodPhotos[0]} 
                  alt="Juanma pequeño" 
                  className="relative w-20 h-20 rounded-full object-cover border border-white/10 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 shadow-lg cursor-zoom-in z-10"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-neutral-900 dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-tighter shadow-sm z-20">
                2000s
              </div>
            </button>
          </div>

          <div className="space-y-8 relative z-10">
            <p className="text-2xl md:text-3xl text-neutral-800 dark:text-white font-light leading-snug tracking-tight pr-0 sm:pr-32">
              {t.desc1.split('{span1}')[0]}
              <span className="text-blue-600 dark:text-blue-400 italic font-medium">{t.desc1Span1}</span>
              {t.desc1.split('{span1}')[1].split('{span2}')[0]}
              <span className="text-neutral-900 dark:text-white font-semibold underline decoration-blue-500/30 underline-offset-8">{t.desc1Span2}</span>
              {t.desc1.split('{span2}')[1].split('{span3}')[0]}
              <span className="text-blue-600 dark:text-blue-400 italic font-medium">{t.desc1Span3}</span>
              {t.desc1.split('{span3}')[1]}
            </p>
            
            <div className="space-y-6 text-neutral-600 dark:text-neutral-400 text-lg font-light leading-relaxed max-w-3xl">
              <p>
                {t.desc2.split('{strong1}')[0]}
                <strong className="text-neutral-900 dark:text-white font-bold">SMR</strong>
                {t.desc2.split('{strong1}')[1].split('{strong2}')[0]}
                <strong className="text-neutral-900 dark:text-white font-bold">{lang === 'es' ? 'Italia' : 'Italy'}</strong>
                {t.desc2.split('{strong2}')[1]}
              </p>
              <p>
                {t.desc3.split('{span}')[0]}
                <span className="text-blue-600 dark:text-blue-400 font-medium">{t.desc3Span}</span>
                {t.desc3.split('{span}')[1]}
              </p>
            </div>
          </div>
        </div>

        {/* Skills Bento */}
        <div ref={skillsRef} className="lg:col-span-4 glass-card p-10 rounded-[2.5rem] bg-gradient-to-br from-black/[0.01] dark:from-white/[0.03] to-transparent shadow-sm">
           <h3 className="text-neutral-700 dark:text-white font-bold uppercase tracking-widest text-[10px] mb-10 flex items-center gap-3">
            <span className="w-8 h-px bg-blue-600 dark:bg-blue-500"></span>
            {t.skills}
          </h3>
          <div className="space-y-8">
            {t.skillsList.map((skill, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight">{skill.name}</span>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{skill.level}</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: isSkillsVisible ? skill.level : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-center italic">
            <p className="text-[11px] text-neutral-500 uppercase leading-relaxed tracking-wider font-medium">
              {t.quote}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {stats.map((stat, i) => (
          <div key={i} className="lg:col-span-4 glass-card p-8 rounded-[2rem] hover:translate-y-[-4px] transition-transform duration-500 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 border border-${stat.color}-500/20`}>
              <i className={`${stat.icon} text-lg`}></i>
            </div>
            <div className="text-3xl font-display font-black text-neutral-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
            <div className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Renderizado del Modal mediante Portal al final del body */}
      {isPhotoExpanded && createPortal(
        <div 
          className="fixed inset-0 z-[2147483645] flex items-center justify-center p-4 sm:p-12 bg-black/90 backdrop-blur-3xl transition-all duration-500"
          style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
          onClick={() => setIsPhotoExpanded(false)}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { opacity: 0; transform: scale(0.95) translateX(20px); } to { opacity: 1; transform: scale(1) translateX(0); } }
          `}</style>

          <div className="relative max-w-5xl w-full flex flex-col items-center group/modal">
            {/* Botón de cierre */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPhotoExpanded(false); }}
              className="absolute -top-16 right-0 sm:-right-12 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 active:scale-90 z-50"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Navegación Lateral */}
            <button 
              onClick={prevPhoto}
              className="absolute left-4 sm:-left-20 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all opacity-0 group-hover/modal:opacity-100 z-50"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-4 sm:-right-20 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all opacity-0 group-hover/modal:opacity-100 z-50"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            
            <div className="relative w-full flex justify-center items-center overflow-hidden py-10">
              <div 
                key={currentPhotoIndex}
                className="relative"
                style={{ animation: 'slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}
              >
                <img 
                  src={childhoodPhotos[currentPhotoIndex]} 
                  alt={`Juanma pequeño ${currentPhotoIndex + 1}`} 
                  className="max-h-[70vh] w-auto rounded-[1.5rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 object-contain transition-transform duration-500"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Etiqueta 2000s */}
                <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 bg-white text-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-3xl text-xs sm:text-base font-black uppercase tracking-[0.4em] shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-black/5 select-none transform rotate-3">
                  2000<span className="text-blue-600">s</span>
                </div>
              </div>
            </div>
            
            {/* Indicadores de Galería */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex gap-3">
                {childhoodPhotos.map((_, i) => (
                  <button 
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i); }}
                    className={`h-1.5 transition-all duration-500 rounded-full ${currentPhotoIndex === i ? 'w-10 bg-blue-500' : 'w-2 bg-white/20'}`}
                  />
                ))}
              </div>
              
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.6em] select-none flex items-center gap-6">
                <span className="w-12 h-px bg-white/10"></span>
                {lang === 'es' ? `RECUERDO ${currentPhotoIndex + 1} / ${childhoodPhotos.length}` : `MEMORY ${currentPhotoIndex + 1} / ${childhoodPhotos.length}`}
                <span className="w-12 h-px bg-white/10"></span>
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default About;
