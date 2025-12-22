import React from 'react';
import { translations } from '../translations';

interface EducationProps { lang: 'es' | 'en'; }

const Education: React.FC<EducationProps> = ({ lang }) => {
  const t = translations[lang].education;

  return (
    <div className="relative">
      <h2 className="text-2xl font-display font-bold mb-12 flex items-center gap-4 text-neutral-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500 text-sm">
          <i className="fa-solid fa-graduation-cap"></i>
        </span>
        {t.title}
      </h2>

      <div className="space-y-6">
        {t.items.map((edu, i) => (
          <div key={i} className={`group glass-card relative overflow-hidden rounded-2xl p-8 border ${i === 0 ? 'border-purple-600/20 dark:border-purple-500/20' : 'border-blue-600/20 dark:border-blue-500/20'} transition-all duration-500 shadow-sm dark:shadow-none`}>
            <div className="absolute top-6 right-6">
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${edu.status === 'En curso' || edu.status === 'In progress' ? 'border-amber-600/20 text-amber-600 bg-amber-500/5' : 'border-green-600/20 text-green-600 bg-green-500/5'}`}>
                {edu.status}
              </span>
            </div>
            <div className="flex gap-6">
              <div className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/5 dark:border-white/5 ${i === 0 ? 'bg-purple-600/5 text-purple-600 dark:text-purple-400' : 'bg-blue-600/5 text-blue-600 dark:text-blue-400'}`}>
                <i className={`${i === 0 ? 'fa-solid fa-code' : 'fa-solid fa-server'} text-lg`}></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-2 tracking-[0.2em] uppercase">{edu.period}</div>
                <h3 className="text-xl font-bold mb-1 text-neutral-900 dark:text-white">{edu.degree}</h3>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-school text-[10px] opacity-50"></i>
                  <a 
                    href="https://fpalanturing.es/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors no-cursor-effect"
                  >
                    {edu.school}
                  </a>
                </div>
                <p className="text-neutral-500 dark:text-neutral-500 text-xs leading-relaxed font-light">{edu.desc}</p>
                {edu.highlights && (
                  <div className="flex flex-wrap gap-3 border-t border-black/5 dark:border-white/5 pt-5 mt-5">
                    {edu.highlights.map((h, hi) => (
                      <div key={hi} className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                        <i className="fa-solid fa-certificate text-blue-600 dark:text-blue-400 opacity-70"></i>
                        {h}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;