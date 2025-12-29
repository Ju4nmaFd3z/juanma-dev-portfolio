
import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';

interface Message {
  role: 'user' | 'bot' | 'error';
  text: string;
}

interface FloatingAIProps { lang: 'es' | 'en'; }

const FloatingAI: React.FC<FloatingAIProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].ai;

  useEffect(() => {
    setMessages([{ role: 'bot', text: t.greetings[0] }]);
  }, [lang, t.greetings]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[10001] flex flex-col items-end">
      {isOpen ? (
        <div className="w-[calc(100vw-3rem)] sm:w-[420px] h-[500px] max-h-[85vh] glass-card rounded-[2.5rem] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border-white/20 animate-in zoom-in duration-300">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white/40 flex items-center justify-center">
                <i className="fa-solid fa-robot text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">{t.label}</span>
                <span className="flex items-center gap-2 text-[8px] text-amber-500 font-black uppercase mt-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  {t.status}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col max-w-[85%] gap-2">
                  <div className="px-5 py-4 rounded-2xl text-[13px] leading-relaxed shadow-sm bg-white/5 border border-white/10 text-neutral-400 rounded-tl-none italic">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-black/60 border-t border-white/10 space-y-4">
            <div className="relative flex items-center gap-3 opacity-50 pointer-events-none">
              <input 
                disabled
                type="text" 
                placeholder={t.placeholder} 
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[13px] text-white focus:outline-none" 
              />
              <button 
                disabled
                className="w-12 h-12 bg-white/10 text-white/20 rounded-xl flex items-center justify-center"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group flex items-center">
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 pointer-events-none transition-all duration-500">
            <div className="bg-amber-500/[0.08] backdrop-blur-xl border border-amber-500/30 px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-200/90">{t.tooltip}</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(true)} className="relative w-16 h-16 bg-white/12 text-white/30 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 hover:rounded-[2rem] border border-white/10">
            <i className="fa-solid fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-[#050505]"></span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingAI;
