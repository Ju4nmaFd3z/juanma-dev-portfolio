import React, { useEffect, useMemo, useRef, useState } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en';
}

// Easter egg: press "/" anywhere. A real (tiny) shell over the portfolio.
const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, lang }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const es = lang === 'es';

  const go = (id: string, msg: string) => {
    setHistory((p) => [...p, msg]);
    window.setTimeout(() => {
      onClose();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  const commands = useMemo<Record<string, () => void>>(() => ({
    help: () => setHistory((p) => [...p, es
      ? 'Comandos: help, whoami, neofetch, stack, origin, skills, projects, journey, contact, clear, exit'
      : 'Commands: help, whoami, neofetch, stack, origin, skills, projects, journey, contact, clear, exit']),
    clear: () => setHistory([]),
    whoami: () => setHistory((p) => [...p, es
      ? 'Juanma Fernández — Técnico SMR, estudiante de DAM. Hardware, redes, sistemas y código.'
      : 'Juanma Fernández — Systems technician, DAM student. Hardware, networks, systems and code.']),
    neofetch: () => setHistory((p) => [...p,
      '   ██ ███    ███   juanma@pixel-dimension',
      '   ██ ████  ████   ----------------------',
      '   ██ ██ ████ ██   OS: macOS / Kali Linux',
      '█  ██ ██  ██  ██   HOST: DAM · SMR',
      ' ███  ██      ██   SHELL: Zsh / Bash',
      '                   IDE: VS Code / Antigravity',
      '                   SKILLS: Java, SQL, TypeScript, IT, Claude Code',
    ]),
    stack: () => setHistory((p) => [...p, 'L6 DevOps', 'L5 Web', 'L4 ' + (es ? 'Programación' : 'Programming'), 'L3 ' + (es ? 'Datos' : 'Data'), 'L2 ' + (es ? 'Sistemas' : 'Systems'), 'L1 ' + (es ? 'Redes' : 'Networks'), 'L0 Hardware']),
    origin: () => go('about', es ? 'cd /origen …' : 'cd /origin …'),
    skills: () => go('skills', es ? 'cd /pila …' : 'cd /stack …'),
    projects: () => go('projects', es ? 'cd /proyectos …' : 'cd /projects …'),
    journey: () => go('journey', es ? 'cd /evolucion …' : 'cd /evolution …'),
    contact: () => go('contact', es ? 'Abriendo conexión …' : 'Opening connection …'),
    exit: () => onClose(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [es, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    if (history.length === 0) {
      setHistory([es ? 'Pixel-Terminal v2.0 — escribe "help".' : 'Pixel-Terminal v2.0 — type "help".']);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', onKey); prevFocus?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    if (!cmd) return;
    setHistory((p) => [...p, `$ ${cmd}`]);
    if (commands[cmd]) commands[cmd]();
    else setHistory((p) => [...p, es ? `Comando no encontrado: ${cmd}` : `Command not found: ${cmd}`]);
    setPast((p) => [cmd, ...p].slice(0, 30));
    setCursor(-1);
    setInput('');
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && past.length) {
      e.preventDefault();
      const c = Math.min(past.length - 1, cursor + 1);
      setCursor(c); setInput(past[c]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const c = cursor - 1;
      setCursor(c); setInput(c >= 0 ? past[c] : '');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[19500] bg-black/70 flex items-center justify-center p-4 sm:p-10" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Terminal" className="w-full max-w-3xl h-[70vh] flex flex-col border-2 border-[#2e3864] bg-[#07080f] text-[#f3ead7] shadow-[8px_8px_0_0_#000] px-frame">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e3864] bg-[#111527]">
          <span className="font-pixel text-[11px] text-[#9fb0d8]">juanma@pixel-dimension — bash</span>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center text-[#9fb0d8] hover:text-white" aria-label={es ? 'Cerrar terminal' : 'Close terminal'}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div ref={scrollRef} onClick={() => inputRef.current?.focus()} className="flex-1 p-4 sm:p-6 font-mono text-sm overflow-y-auto custom-scrollbar space-y-1.5" aria-live="polite">
          {history.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap leading-relaxed ${line.startsWith('$') ? 'text-[#f2b134]' : 'text-[#6fe0c4]'}`}>{line}</div>
          ))}
          <form onSubmit={run} className="flex gap-3 pt-1">
            <label htmlFor="term-input" className="text-[#f2b134] font-bold shrink-0">$</label>
            <input
              id="term-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKey}
              className="flex-1 bg-transparent border-none outline-none text-[#f3ead7] font-mono"
              autoComplete="off"
              spellCheck={false}
              aria-label={es ? 'Comando' : 'Command'}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
