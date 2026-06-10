import React from 'react';
import { translations } from '../translations';

interface EducationProps { lang: 'es' | 'en'; }

const certColorMap = {
  cyan: {
    iconBg:      'bg-cyan-500/10',
    iconText:    'text-cyan-500 dark:text-cyan-400',
    border:      'border-cyan-600/20 dark:border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/40 dark:hover:border-cyan-400/40',
    hoverShadow: 'hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.10),0_0_0_1px_rgba(6,182,212,0.08)]',
    glowColor:   'rgba(6,182,212,0.10)',
  },
  amber: {
    iconBg:      'bg-amber-500/10',
    iconText:    'text-amber-500 dark:text-amber-400',
    border:      'border-amber-600/20 dark:border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40 dark:hover:border-amber-400/40',
    hoverShadow: 'hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.10),0_0_0_1px_rgba(245,158,11,0.08)]',
    glowColor:   'rgba(245,158,11,0.10)',
  },
} as const;

type CertColorKey = keyof typeof certColorMap;

const Education: React.FC<EducationProps> = ({ lang }) => {
  const t = translations[lang].education;

  return (
    <div className="relative">

      {/* ── Academic Education ─────────────────────────────────────── */}
      <h2 className="text-2xl font-display font-bold mb-12 flex items-center gap-4 text-neutral-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500 text-sm">
          <i className="fa-solid fa-graduation-cap"></i>
        </span>
        {t.title}
      </h2>

      <div className="space-y-6">
        {t.items.map((edu, i) => (
          <div key={i} className={`group glass-card relative overflow-hidden rounded-2xl p-5 sm:p-8 border ${i === 0 ? 'border-purple-600/20 dark:border-purple-500/20' : 'border-blue-600/20 dark:border-blue-500/20'} transition-all duration-500 shadow-sm dark:shadow-none`}>
            <div className="flex gap-6">
              <div className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/5 dark:border-white/5 ${i === 0 ? 'bg-purple-600/5 text-purple-600 dark:text-purple-400' : 'bg-blue-600/5 text-blue-600 dark:text-blue-400'}`}>
                <i className={`${i === 0 ? 'fa-solid fa-code' : 'fa-solid fa-server'} text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase">{edu.period}</div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shrink-0 whitespace-nowrap ${edu.status === 'En curso' || edu.status === 'In progress' ? 'border-amber-600/20 text-amber-600 bg-amber-500/5' : 'border-green-600/20 text-green-600 bg-green-500/5'}`}>
                    {edu.status}
                  </span>
                </div>
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

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="relative my-10 flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
          <i className="fa-solid fa-medal text-amber-500 text-[10px]"></i>
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      </div>

      {/* ── Certifications ─────────────────────────────────────────── */}
      <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-4 text-neutral-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-sm">
          <i className="fa-solid fa-certificate"></i>
        </span>
        {t.certs.title}
      </h2>

      <div className="space-y-6">
        {t.certs.items.map((cert, i) => {
          const colorKey = (cert.color in certColorMap ? cert.color : 'cyan') as CertColorKey;
          const c = certColorMap[colorKey];

          return (
            <div
              key={i}
              className={`cert-card group glass-card relative rounded-2xl overflow-hidden border ${c.border} ${c.hoverBorder} ${c.hoverShadow} shadow-sm dark:shadow-none transition-all duration-500`}
            >
              {/* Ambient glow — radial gradient, sin bordes duros */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 60% 50% at 100% 0%, ${c.glowColor}, transparent)` }}
                aria-hidden="true"
              />

              {/* Shimmer sweep */}
              <div className="cert-shine-layer" aria-hidden="true" />

              {/* Content */}
              <div className="relative z-10 flex gap-4 sm:gap-6 p-5 sm:p-8">
                <div className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/5 dark:border-white/5 ${c.iconBg} ${c.iconText}`}>
                  <i className={`${cert.icon} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase flex items-center gap-2 flex-wrap min-w-0">
                      <span>{cert.issuer}</span>
                      <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0"></span>
                      <span>{cert.year}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-600/20 text-green-600 bg-green-500/5 shrink-0 whitespace-nowrap">
                      <i className="fa-solid fa-circle-check text-[9px]"></i>
                      {t.certs.verified}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cert.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 pt-5 mt-5">
                    {cert.skills.map((skill, si) => (
                      <span key={si} className="text-[9px] font-black uppercase tracking-tighter text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Education;
