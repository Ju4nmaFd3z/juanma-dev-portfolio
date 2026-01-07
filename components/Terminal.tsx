
import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en';
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, lang }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Record<string, () => void> = {
    help: () => {
      const msg = lang === 'es' 
        ? 'Comandos disponibles: help, clear, whoami, projects, neofetch, contact, exit' 
        : 'Available commands: help, clear, whoami, projects, neofetch, contact, exit';
      setHistory(prev => [...prev, `> help`, msg]);
    },
    clear: () => setHistory([]),
    whoami: () => {
      const msg = lang === 'es'
        ? 'Juanma Fernández: Técnico SMR, futuro Dev DAM. Amante del hardware y el código limpio.'
        : 'Juanma Fernández: IT Tech, future Software Dev. Hardware lover & clean code enthusiast.';
      setHistory(prev => [...prev, `> whoami`, msg]);
    },
    projects: () => {
      setHistory(prev => [...prev, `> projects`, lang === 'es' ? 'Navegando a Proyectos...' : 'Navigating to Projects...']);
      setTimeout(() => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }, 500);
    },
    neofetch: () => {
      const art = [
        `> neofetch`,
        `      _  ___  ___ `,
        `     | ||   \\/   |`,
        `  _  | || |\\  /| |  JUANMA@PORTFOLIO`,
        ` | |_| || | \\/ | |  ----------------`,
        `  \\___/ |_|    |_|  OS: Kali Linux / Win 11`,
        `                    HOST: DAM-SMR-v1.0`,
        `                    SHELL: Zsh / Bash`,
        `                    IDE: VS Code / IntelliJ`,
        `                    SKILLS: Java, SQL, IT`
      ];
      setHistory(prev => [...prev, ...art]);
    },
    contact: () => {
      setHistory(prev => [...prev, `> contact`, lang === 'es' ? 'Abriendo contacto...' : 'Opening contact...']);
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }, 500);
    },
    exit: () => onClose(),
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(focusInput, 100);
      if (history.length === 0) {
        setHistory([lang === 'es' ? 'Bienvenido a Juanma-Terminal v1.0' : 'Welcome to Juanma-Terminal v1.0', 'Escribe "help" para ver los comandos.']);
      }
      return () => clearTimeout(timer);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    if (!cmd) return;

    if (commands[cmd]) {
      commands[cmd]();
    } else {
      setHistory(prev => [...prev, `> ${cmd}`, lang === 'es' ? `Comando no encontrado: ${cmd}` : `Command not found: ${cmd}`]);
    }
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
      onClick={focusInput}
    >
      <div 
        className="w-full max-w-3xl glass-card rounded-2xl border border-white/20 bg-black/90 shadow-2xl overflow-hidden flex flex-col h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">juanma@bash — 80x24</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="text-neutral-500 hover:text-white transition-colors p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Terminal Content Area */}
        <div 
          ref={scrollRef}
          onClick={focusInput}
          className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-2 text-emerald-500 custom-scrollbar scroll-smooth cursor-text"
        >
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed opacity-90">{line}</div>
          ))}
          <form onSubmit={handleCommand} className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">$</span>
            <input 
              ref={inputRef}
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none text-emerald-400 p-0 m-0 caret-emerald-400 cursor-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
