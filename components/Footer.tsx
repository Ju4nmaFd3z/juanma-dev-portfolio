import React from 'react';
import { translations } from '../translations';

interface FooterProps { lang: 'es' | 'en'; }

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang].footer;
  return (
    <footer className="py-10 border-t border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-neutral-400 dark:text-neutral-500 text-sm font-light">
          © {new Date().getFullYear()} <span className="text-neutral-700 dark:text-neutral-300 font-medium">Juan Manuel Fernández Rodríguez</span>. <span className="hidden md:inline">{t.role}</span>
        </div>
        <div className="flex gap-10">
          <a href="https://github.com/Ju4nmaFd3z" target="_blank" rel="noopener noreferrer" className="text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">GitHub</a>
          <a href="https://linkedin.com/in/juanma-fernández-rodríguez" target="_blank" rel="noopener noreferrer" className="text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;