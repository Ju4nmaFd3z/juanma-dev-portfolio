
import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

interface ProjectsProps { lang: 'es' | 'en'; }

const Projects: React.FC<ProjectsProps> = ({ lang }) => {
  const t = translations[lang].projects;
  const [filter, setFilter] = useState<'all' | 'software' | 'systems'>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = {
    es: { all: 'Todos', software: 'Software', systems: 'Sistemas' },
    en: { all: 'All', software: 'Software', systems: 'Systems' }
  };

  const projectData = [
    {
      ...t.items[0],
      category: 'software',
      icon: 'fa-solid fa-dna',
      gradient: 'from-indigo-600/30 to-blue-600/30',
      image: 'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&q=80&w=1200',
      url: 'https://genetix-xi.vercel.app/',
      repo: 'https://github.com/Ju4nmaFd3z/Genetix.git'
    },
    {
      ...t.items[1],
      category: 'software',
      icon: 'fa-solid fa-code-branch',
      gradient: 'from-blue-600/20 to-purple-600/20',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
      url: 'https://github.com/Ju4nmaFd3z'
    },
    {
      ...t.items[2],
      category: 'systems',
      icon: 'fa-solid fa-server',
      gradient: 'from-emerald-600/20 to-blue-600/20',
      image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=1200',
      url: 'https://www.netacad.com/es/courses/ccna-introduction-networks?courseLang=en-US'
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projectData 
    : projectData.filter(p => p.category === filter);

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  const nextProject = () => {
    setActiveIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  const prevProject = () => {
    setActiveIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  };

  const getCardStyles = (index: number) => {
    const diff = index - activeIndex;
    
    // Lógica para que el carrusel sea infinito visualmente en el cálculo de distancias
    let displayDiff = diff;
    if (diff > 1) displayDiff = diff - filteredProjects.length;
    if (diff < -1) displayDiff = diff + filteredProjects.length;

    if (displayDiff === 0) {
      return "z-30 opacity-100 scale-100 translate-x-0 blur-0 shadow-2xl";
    } else if (displayDiff === 1 || (activeIndex === filteredProjects.length - 1 && index === 0)) {
      return "z-10 opacity-40 scale-75 translate-x-[40%] sm:translate-x-[60%] blur-sm pointer-events-none rotate-y-[-10deg]";
    } else if (displayDiff === -1 || (activeIndex === 0 && index === filteredProjects.length - 1)) {
      return "z-10 opacity-40 scale-75 translate-x-[-40%] sm:translate-x-[-60%] blur-sm pointer-events-none rotate-y-[10deg]";
    } else {
      return "z-0 opacity-0 scale-50 translate-x-0 blur-xl pointer-events-none";
    }
  };

  return (
    <div className="relative overflow-visible">
      {/* Background decoration */}
      <div className="absolute -right-24 top-0 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col gap-8 md:gap-6 lg:gap-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-px bg-blue-600 dark:bg-blue-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500">{t.title}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none mb-4 text-neutral-900 dark:text-white">
              MIS <span className="gradient-text">CREACIONES.</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg font-light leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-1.5 rounded-2xl w-full sm:w-auto">
              {(['all', 'software', 'systems'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === cat 
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg' 
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                  }`}
                >
                  {categories[lang][cat]}
                </button>
              ))}
            </div>
            
            <a 
              href="https://github.com/Ju4nmaFd3z" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 glass-card rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 transition-all border-black/5 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              {t.github} <i className="fa-brands fa-github text-sm"></i>
            </a>
          </div>
        </div>

        {/* Carousel Area - Margenes refinados para añadir aire sutil */}
        <div className="relative py-12 lg:py-16 px-4 sm:px-0">
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-[-2rem] lg:left-[-4rem] z-50">
            <button 
              onClick={prevProject}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-90 group"
            >
              <i className="fa-solid fa-chevron-left text-neutral-400 group-hover:text-blue-600 transition-colors"></i>
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-[-2rem] lg:right-[-4rem] z-50">
            <button 
              onClick={nextProject}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-90 group"
            >
              <i className="fa-solid fa-chevron-right text-neutral-400 group-hover:text-blue-600 transition-colors"></i>
            </button>
          </div>

          {/* Cards Container */}
          <div className="relative h-[550px] sm:h-[600px] w-full perspective-1000">
            {filteredProjects.map((p, i) => (
              <div 
                key={i} 
                className={`absolute inset-0 m-auto w-full max-w-[350px] sm:max-w-[500px] lg:max-w-[650px] h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${getCardStyles(i)}`}
              >
                <div className="group relative flex flex-col glass-card rounded-[2.5rem] overflow-hidden border-black/5 dark:border-white/5 hover:border-blue-600/30 dark:hover:border-blue-500/30 transition-all duration-700 h-full shadow-sm dark:shadow-none">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-t from-neutral-900 dark:from-[#050505] via-transparent to-transparent z-10 opacity-80 transition-opacity duration-700`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} z-10 mix-blend-overlay`} />
                    
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-1000 ease-out" 
                    />
                    
                    {/* Category Icon */}
                    <div className="absolute top-8 left-8 z-20 w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-white text-lg shadow-xl">
                      <i className={p.icon}></i>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-8 right-8 z-20 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                        {p.category === 'software' ? (lang === 'es' ? 'Desarrollo' : 'Dev') : (lang === 'es' ? 'Infraestructura' : 'Infra')}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 sm:p-10 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                      {p.tech.map((tech, ti) => (
                        <span key={ti} className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest text-neutral-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-3 py-1.5 rounded-lg group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:border-blue-500/20 transition-all">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl font-display font-black mb-3 sm:mb-4 text-neutral-900 dark:text-white leading-tight">
                        {p.title}
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm sm:text-base leading-relaxed font-light mb-6 sm:mb-8 transition-colors line-clamp-3 sm:line-clamp-none">
                        {p.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 sm:pt-8 border-t border-black/5 dark:border-white/5">
                      <div className="flex gap-4">
                        <a 
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-safe flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                        >
                          {p.title === 'Genetix' ? 'Demo Live' : (lang === 'es' ? 'Explorar' : 'Explore')}
                          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                        
                        {p.repo && (
                          <a 
                            href={p.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-safe flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-all duration-300"
                          >
                            GitHub
                            <i className="fa-brands fa-github text-[11px]"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators - Ajustado margen superior e inferior */}
          <div className="flex justify-center gap-3 mt-10 mb-2">
            {filteredProjects.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${activeIndex === i ? 'w-8 bg-blue-600' : 'w-2 bg-neutral-300 dark:bg-neutral-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Learning Phase CTA */}
        <div className="glass-card rounded-[2rem] p-10 lg:p-12 border border-blue-500/10 bg-gradient-to-r from-blue-500/[0.05] dark:from-blue-500/[0.02] to-transparent text-center shadow-sm dark:shadow-none">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-4">
              {lang === 'es' ? 'Construyendo mi futuro...' : 'Building my future...'}
            </h4>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed mb-8">
              {lang === 'es' 
                ? 'Actualmente estoy explorando nuevas fronteras en el desarrollo móvil y arquitecturas escalables. Mi repositorio de GitHub es testigo de mi progreso diario.' 
                : 'I am currently exploring new frontiers in mobile development and scalable architectures. My GitHub repository witnesses my daily progress.'}
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-neutral-900 dark:text-white mb-1">100+</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Commits / Mes</span>
              </div>
              <div className="w-px h-12 bg-black/10 dark:bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-neutral-900 dark:text-white mb-1">5+</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Tecnologías</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
