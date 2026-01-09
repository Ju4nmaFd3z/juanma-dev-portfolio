
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';

// Verificación de entorno estricta: Solo Vercel o Localhost. 
// Bloquea explícitamente entornos de Google AI Studio o previsualizaciones externas.
const IS_VERCEL_ENV = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1') &&
  !window.location.hostname.includes('google.com') &&
  !window.location.hostname.includes('aistudio');

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface FloatingAIProps { lang: 'es' | 'en'; }

const MarkdownLite = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        let content = line.trim();
        if (!content) return <div key={i} className="h-1" />;

        const headerMatch = content.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerText = headerMatch[2];
          return (
            <div key={i} className={`font-bold text-blue-400 mt-3 mb-1 ${level === 1 ? 'text-lg border-b border-white/10 pb-1' : 'text-sm'} uppercase tracking-wider`}>
              {processInlineStyles(headerText)}
            </div>
          );
        }

        const isBullet = content.startsWith('* ') || content.startsWith('- ');
        if (isBullet) content = content.substring(2);

        return (
          <div key={i} className={`${isBullet ? 'flex gap-2 pl-2' : ''} leading-relaxed text-[13px]`}>
            {isBullet && <span className="text-blue-500 font-bold shrink-0">•</span>}
            <span className="flex-1">{processInlineStyles(content)}</span>
          </div>
        );
      })}
    </div>
  );
};

function processInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={j} className="italic text-blue-300">{part.slice(1, -1)}</em>;
    return part;
  });
}

const FloatingAI: React.FC<FloatingAIProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'error', text: string, sources?: any[]}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [githubData, setGithubData] = useState<any>(null);
  const [serviceRestricted, setServiceRestricted] = useState(!IS_VERCEL_ENV);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].ai;

  useEffect(() => {
    // Si no estamos en Vercel, el servicio se marca como restringido permanentemente
    if (!IS_VERCEL_ENV) {
      setServiceRestricted(true);
      return;
    }

    const fetchGH = async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/Ju4nmaFd3z'),
          fetch('https://api.github.com/users/Ju4nmaFd3z/repos?sort=updated&per_page=5')
        ]);
        const user = await userRes.json();
        const repos = await reposRes.json();
        setGithubData({
          bio: user.bio,
          public_repos: user.public_repos,
          recent: repos.map((r: any) => `${r.name} (${r.language})`).join(', ')
        });
      } catch (e) {
        console.warn("GH API data fallback");
      }
    };
    fetchGH();
  }, []);

  useEffect(() => {
    if (serviceRestricted) {
      setMessages([{role: 'error', text: t.maintenanceMsg}]);
    } else if (isOpen && messages.length <= 1) {
      const randomGreeting = t.greetings[Math.floor(Math.random() * t.greetings.length)];
      setMessages([{role: 'bot', text: randomGreeting}]);
    }
  }, [lang, isOpen, serviceRestricted]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleAsk = async (customInput?: string) => {
    if (serviceRestricted || isTyping) return;

    const userMsg = customInput || input.trim();
    if (!userMsg) return;
    
    if (!navigator.onLine) {
      setMessages(prev => [...prev, {role: 'user', text: userMsg}, {role: 'error', text: t.errorOffline}]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput('');
    setIsTyping(true);

    try {
      // Instanciamos la API justo antes del uso para máxima seguridad
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dynamicInstruction = `${t.system} ${githubData ? `GH INFO: Bio: ${githubData.bio}. Repos: ${githubData.public_repos}. Recent: ${githubData.recent}.` : ''}`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: dynamicInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const botResponse = response.text || t.errorDesc;
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      setMessages(prev => [...prev, {role: 'bot', text: botResponse, sources}]);
    } catch (error: any) {
      // Manejo elegante de cuota o errores de API sin romper la estética
      console.error("AI Assistant Pause");
      setMessages(prev => [...prev, { role: 'error', text: t.errorDesc }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { label: lang === 'es' ? 'Sobre Juanma' : 'About Juanma', prompt: lang === 'es' ? 'Hazme un resumen profesional de Juanma.' : 'Give me a professional summary of Juanma.' },
    { label: lang === 'es' ? 'Stack Técnico' : 'Tech Stack', prompt: lang === 'es' ? '¿Cuáles son las hard skills de Juanma?' : 'What are Juanma\'s hard skills?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[10001] flex flex-col items-end">
      {isOpen ? (
        <div className="w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] max-h-[85vh] glass-card rounded-[2.5rem] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border-white/20 animate-in zoom-in duration-300">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg ${serviceRestricted ? 'grayscale' : ''}`}>
                <i className="fa-solid fa-robot text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">{t.label}</span>
                <span className={`flex items-center gap-2 text-[8px] font-black uppercase mt-2 ${serviceRestricted ? 'text-amber-500' : 'text-emerald-500'}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serviceRestricted ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${serviceRestricted ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  {serviceRestricted ? t.maintenanceStatus : t.status}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`${m.role === 'error' ? 'w-full' : 'max-w-[85%]'}`}>
                  <div className={`px-5 py-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all duration-500 ${
                    m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 
                    m.role === 'error' ? 'bg-neutral-900/40 border border-white/5 text-neutral-400 rounded-xl relative overflow-hidden backdrop-blur-sm' :
                    'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none'
                  }`}>
                    {m.role === 'error' && (
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3 pb-2 border-b border-white/5">
                        <i className="fa-solid fa-shield-halved text-neutral-600"></i>
                        {t.errorTitle}
                      </div>
                    )}
                    <MarkdownLite text={m.text} />
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/70 mb-2 block">
                          {lang === 'es' ? 'Fuentes:' : 'Sources:'}
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {m.sources.map((source, si) => (
                            source.web && (
                              <a 
                                key={si} href={source.web.uri} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-neutral-400 hover:text-blue-400 transition-colors flex items-center gap-2 truncate no-cursor-effect"
                              >
                                <i className="fa-solid fa-link text-[8px]"></i>
                                <span className="truncate">{source.web.title || source.web.uri}</span>
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-none animate-pulse">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-black/60 border-t border-white/10 space-y-4">
            {!serviceRestricted && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {quickActions.map((qa, i) => (
                  <button 
                    key={i} onClick={() => handleAsk(qa.prompt)}
                    className="cursor-hide whitespace-nowrap px-4 py-2 glass-card rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-900 hover:text-white transition-all border-blue-500/20"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex items-center gap-3">
              <input 
                type="text" value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()} 
                placeholder={serviceRestricted ? t.placeholderMaintenance : t.placeholder} 
                disabled={serviceRestricted || isTyping}
                className={`flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[13px] text-white focus:outline-none transition-all placeholder:text-neutral-600 ${
                  !serviceRestricted ? 'focus:border-blue-500/50' : 'cursor-not-allowed opacity-50'
                }`} 
              />
              <button 
                onClick={() => handleAsk()} 
                disabled={!input.trim() || isTyping || serviceRestricted} 
                className="cursor-hide w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-blue-900 hover:text-white transition-all shadow-xl disabled:opacity-30"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group flex items-center">
          <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 pointer-events-none transition-all duration-500">
            <div className={`backdrop-blur-xl border px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl transition-colors duration-300 ${serviceRestricted ? 'bg-amber-500/[0.08] border-amber-500/30' : 'bg-blue-500/[0.08] border-blue-500/30'}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90">
                {serviceRestricted ? t.maintenanceStatus : t.tooltip}
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(true)} className={`relative w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 hover:rounded-[2rem] hover:bg-blue-900 hover:text-white ${serviceRestricted ? 'grayscale' : ''}`}>
            <i className="fa-solid fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
            <span className={`absolute -top-1 -right-1 flex h-4 w-4 z-10 ${serviceRestricted ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full border-2 border-[#050505]`}></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingAI;
