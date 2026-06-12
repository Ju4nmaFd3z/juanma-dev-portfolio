
import React, { useState, useEffect, memo } from 'react';
import { translations } from '../translations';
import { Project } from '../types';

interface ProjectsProps { lang: 'es' | 'en'; }

const Projects: React.FC<ProjectsProps> = ({ lang }) => {
  const t = translations[lang].projects;
  const [filter, setFilter] = useState<'all' | 'software' | 'systems'>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = {
    es: { all: 'Todos', software: 'Software', systems: 'Sistemas' },
    en: { all: 'All', software: 'Software', systems: 'Systems' }
  };

  const projectData: Project[] = [
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
      icon: 'fa-solid fa-gamepad',
      gradient: 'from-rose-500/30 to-purple-600/30',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
      url: 'https://genetix-arena.vercel.app/',
      repo: 'https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git'
    },
    {
      ...t.items[2],
      category: 'systems',
      icon: 'fa-solid fa-server',
      gradient: 'from-emerald-600/20 to-blue-600/20',
      image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=1200',
      url: 'https://www.netacad.com/es/courses/ccna-introduction-networks?courseLang=en-US'
    },
    {
      ...t.items[3],
      category: 'software',
      icon: 'fa-solid fa-bolt',
      gradient: 'from-purple-700/30 to-violet-500/30',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
      url: 'https://glitchnight.com'
    },
    {
      ...t.items[4],
      category: 'software',
      icon: 'fa-solid fa-display',
      gradient: 'from-fuchsia-600/30 to-cyan-500/30',
      image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=1200',
      url: 'https://fixme-arcade.vercel.app'
    },
    {
      ...t.items[5],
      category: 'systems',
      icon: 'fa-solid fa-robot',
      gradient: 'from-emerald-600/30 to-teal-600/30',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
      url: 'https://www.linkedin.com/posts/juanma-fern%C3%A1ndez-rodr%C3%ADguez_presentaci%C3%B3n-pr%C3%A1cticas-fix-me-2026-share-7466445967605760000-vEC4/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFOruqgByHSrgA1VcfWtYh5BeWtvxvpMzFo'
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projectData 
    : projectData.filter(p => p.category === filter);

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
    
    let displayDiff = diff;
    if (diff > 1 && diff >= filteredProjects.length - 1) displayDiff = diff - filteredProjects.length;
    if (diff < -1 && diff <= - (filteredProjects.length - 1)) displayDiff = diff + filteredProjects.length;

    if (displayDiff === 0) {
      return "z-30 opacity-100 scale-100 translate-x-0 blur-0 shadow-2xl";
    } else if (displayDiff === 1) {
      return "z-10 opacity-40 scale-75 translate-x-[35%] sm:translate-x-[45%] lg:translate-x-[55%] xl:translate-x-[65%] blur-sm pointer-events-none rotate-y-[-10deg]";
    } else if (displayDiff === -1) {
      return "z-10 opacity-40 scale-75 translate-x-[-35%] sm:translate-x-[-45%] lg:translate-x-[-55%] xl:translate-x-[-65%] blur-sm pointer-events-none rotate-y-[10deg]";
    } else {
      return "z-0 opacity-0 scale-50 translate-x-0 blur-xl pointer-events-none";
    }
  };

  return (
    <div className="relative overflow-visible">
      <div className="absolute -right-24 top-0 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col gap-8 md:gap-6 lg:gap-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-px bg-blue-600 dark:bg-blue-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500">{t.title}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none mb-4 text-neutral-900 dark:text-white">
              {t.sectionHeading1} <span className="gradient-text">{t.sectionHeading2}</span>
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

        <div className="relative py-12 lg:py-16 px-4 sm:px-0">
          <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 left-[-5rem] z-50">
            <button
              onClick={prevProject}
              aria-label="Previous project"
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-90 group"
            >
              <i className="fa-solid fa-chevron-left text-neutral-400 group-hover:text-blue-600 transition-colors" aria-hidden="true"></i>
            </button>
          </div>

          <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 right-[-5rem] z-50">
            <button
              onClick={nextProject}
              aria-label="Next project"
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-90 group"
            >
              <i className="fa-solid fa-chevron-right text-neutral-400 group-hover:text-blue-600 transition-colors" aria-hidden="true"></i>
            </button>
          </div>

          <div className="relative h-[480px] sm:h-[560px] lg:h-[600px] w-full perspective-1000">
            {filteredProjects.map((p, i) => (
              <div
                key={p.title}
                className={`absolute inset-0 m-auto w-full max-w-[310px] sm:max-w-[460px] lg:max-w-[620px] xl:max-w-[750px] h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${getCardStyles(i)}`}
              >
                <div className="group relative flex flex-col glass-card rounded-[2.5rem] border-black/5 dark:border-white/5 hover:border-blue-600/30 dark:hover:border-blue-500/30 transition-all duration-700 h-full shadow-sm dark:shadow-none overflow-hidden [transform:translateZ(0)]">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-[2.5rem] [transform:translateZ(0)]">
                    <div className={`absolute inset-0 bg-gradient-to-t from-neutral-900 dark:from-[#050505] via-transparent to-transparent z-10 opacity-80 transition-opacity duration-700`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} z-10 mix-blend-overlay`} />
                    
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                    />
                    
                    <div className="absolute top-8 left-8 z-20 w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-white text-lg shadow-xl">
                      <i className={p.icon}></i>
                    </div>

                    <div className="absolute top-8 right-8 z-20 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                        {p.category === 'software' ? (lang === 'es' ? 'Desarrollo' : 'Dev') : (lang === 'es' ? 'Infraestructura' : 'Infra')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8 lg:p-10 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                      {p.tech.map((tech) => (
                        <span key={tech} className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest text-neutral-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-3 py-1.5 rounded-lg group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:border-blue-500/20 transition-all">
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
                          {p.title.includes('Genetix') ? 'Demo Live' : p.title === 'OpenClaw Agent' ? (lang === 'es' ? 'Ver Resumen' : 'View Summary') : (lang === 'es' ? 'Explorar' : 'Explore')}
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

          <div className="flex items-center justify-center gap-6 mt-10 mb-2">
            <button 
              onClick={prevProject}
              className="xl:hidden w-12 h-12 rounded-xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 active:scale-90 shadow-sm"
              aria-label="Previous Project"
            >
              <i className="fa-solid fa-chevron-left text-neutral-500 text-sm"></i>
            </button>

            <div className="flex gap-3">
              {filteredProjects.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${activeIndex === i ? 'w-8 bg-blue-600' : 'w-2 bg-neutral-300 dark:bg-neutral-800'}`}
                  aria-label={`Go to project ${i + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={nextProject}
              className="xl:hidden w-12 h-12 rounded-xl glass-card flex items-center justify-center border border-black/10 dark:border-white/10 active:scale-90 shadow-sm"
              aria-label="Next Project"
            >
              <i className="fa-solid fa-chevron-right text-neutral-500 text-sm"></i>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] overflow-hidden border-blue-500/10 shadow-sm dark:shadow-none">
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t.buildingStatus}</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{t.buildingBadge}</span>
                  </div>
                </div>

                <h3 className="text-3xl lg:text-4xl font-display font-black text-neutral-900 dark:text-white mb-4 leading-none">
                  {t.buildingTitle} <span className="gradient-text">{t.buildingTitleHighlight}</span>
                </h3>

                <p className="text-neutral-500 dark:text-neutral-400 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
                  {t.buildingDesc}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mr-1">{t.buildingFocus} →</span>
                  {['React', 'Java', 'TypeScript', 'APIs'].map((tag) => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/8 dark:border-white/8 rounded-xl text-neutral-600 dark:text-neutral-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-auto grid grid-cols-2 gap-3 lg:min-w-[260px]">
                {[
                  { value: '50+', label: t.statsCommits },
                  { value: '6',   label: t.statsProjects },
                  { value: '5+',  label: t.statsTech },
                  { value: '2',   label: t.statsProd },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-6 bg-black/[0.03] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl text-center">
                    <span className="text-3xl font-display font-black text-neutral-900 dark:text-white mb-1">{stat.value}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 leading-tight">{stat.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
      </div>
    </div>
  );
};

export default memo(Projects);
