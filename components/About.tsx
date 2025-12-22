import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../translations';

interface AboutProps { lang: 'es' | 'en'; }

const About: React.FC<AboutProps> = ({ lang }) => {
  const t = translations[lang].about;
  const [isSkillsVisible, setIsSkillsVisible] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const stats = [
    { label: t.stats[0].label, value: t.stats[0].value, sub: t.stats[0].sub, icon: 'fa-solid fa-star', color: 'blue' },
    { label: t.stats[1].label, value: t.stats[1].value, sub: t.stats[1].sub, icon: 'fa-solid fa-plane-up', color: 'purple' },
    { label: t.stats[2].label, value: t.stats[2].value, sub: t.stats[2].sub, icon: 'fa-solid fa-shield-halved', color: 'emerald' }
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
        <div className="lg:col-span-8 glass-card p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="space-y-8">
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
    </div>
  );
};

export default About;