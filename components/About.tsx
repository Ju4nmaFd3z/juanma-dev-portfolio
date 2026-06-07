import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../translations';

interface AboutProps { lang: 'es' | 'en'; }

const About: React.FC<AboutProps> = ({ lang }) => {
  const t = translations[lang].about;
  const [isSkillsVisible, setIsSkillsVisible] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const statColorMap = {
    blue:    'bg-blue-500/10    text-blue-600    dark:text-blue-400    border-blue-500/20',
    purple:  'bg-purple-500/10  text-purple-600  dark:text-purple-400  border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  } as const;

  const stats: { label: string; value: string; sub: string; icon: string; color: keyof typeof statColorMap }[] = [
    { label: t.stats[0].label, value: t.stats[0].value, sub: t.stats[0].sub, icon: 'fa-solid fa-star', color: 'blue' },
    { label: t.stats[1].label, value: t.stats[1].value, sub: t.stats[1].sub, icon: 'fa-solid fa-plane-up', color: 'purple' },
    { label: t.stats[2].label, value: t.stats[2].value, sub: t.stats[2].sub, icon: 'fa-solid fa-shield-halved', color: 'emerald' },
  ];

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
        <div className="lg:col-span-8 glass-card p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <p className="text-2xl md:text-3xl text-neutral-800 dark:text-white font-light leading-snug tracking-tight">
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
        <div ref={skillsRef} className="lg:col-span-4 glass-card p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-black/[0.01] dark:from-white/[0.03] to-transparent shadow-sm">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                  <i className="fa-solid fa-bolt text-sm"></i>
                </span>
                <div>
                  <h3 className="text-base font-display font-black text-neutral-900 dark:text-white tracking-tight leading-none">{t.skills}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mt-1">{t.skillsSub}</p>
                </div>
              </div>
            </div>
            <div className="h-px bg-black/5 dark:bg-white/5 mt-6" />
          </div>
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

        {/* Stats Row — 3 columnas en móvil, subgrid en desktop */}
        <div className="lg:contents grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="lg:col-span-4 glass-card p-3 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] hover:translate-y-[-4px] transition-transform duration-500 shadow-sm">
              <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 border ${statColorMap[stat.color]}`}>
                <i className={`${stat.icon} text-xs sm:text-lg`}></i>
              </div>
              <div className="text-lg sm:text-3xl font-display font-black text-neutral-900 dark:text-white mb-0.5 sm:mb-1 leading-none">{stat.value}</div>
              <div className="text-[7px] sm:text-[10px] font-bold text-neutral-500 dark:text-neutral-300 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0 sm:mb-1 leading-tight">{stat.label}</div>
              <div className="hidden sm:block text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;