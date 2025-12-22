import React from 'react';
import { translations } from '../translations';

interface ExperienceProps { lang: 'es' | 'en'; }

const Experience: React.FC<ExperienceProps> = ({ lang }) => {
  const t = translations[lang].experience;

  return (
    <div className="relative">
      <h2 className="text-2xl font-display font-bold mb-12 flex items-center gap-4 text-neutral-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 text-sm">
          <i className="fa-solid fa-briefcase"></i>
        </span>
        {t.title}
      </h2>

      <div className="space-y-12">
        {t.items.map((exp, i) => (
          <div key={i} className="group relative">
            <div className="absolute -left-[2.35rem] top-0 h-full w-px bg-gradient-to-b from-blue-600/50 dark:from-blue-500/50 via-blue-500/20 to-transparent" />
            <div className="glass-card relative overflow-hidden rounded-2xl p-8 transition-all duration-500 border-black/5 dark:border-white/5 hover:border-blue-600/30 dark:hover:border-blue-500/30 shadow-sm dark:shadow-none">
              <div className="flex flex-col gap-6 mb-6">
                {/* Fila superior: Tipo y Periodo */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border border-blue-500/10 shrink-0">
                    {exp.type}
                  </div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-black/5 dark:border-white/5 whitespace-nowrap">
                    {exp.period}
                  </div>
                </div>

                {/* Información del puesto y empresa */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight tracking-tight">
                    {exp.role}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2 text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                    <span className="whitespace-nowrap">{exp.company}</span>
                    <span className="hidden sm:block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                    <span className="whitespace-nowrap">{exp.location}</span>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {exp.points.map((point, pi) => (
                  <li key={pi} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed group/item">
                    <i className="fa-solid fa-check text-blue-600 dark:text-blue-500 mt-1.5 text-[10px] opacity-50 group-hover/item:opacity-100 transition-opacity"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 pt-6">
                {exp.tags.map((tag, ti) => (
                  <span key={ti} className="text-[9px] font-black uppercase tracking-tighter text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="group relative">
           <div className="absolute -left-[2.35rem] top-0 h-full w-px border-l border-black/10 dark:border-white/10 border-dashed" />
           <div className="glass-card rounded-2xl p-6 border-dashed border-black/10 dark:border-white/10 opacity-60">
             <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{t.footer}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;