
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';

// Declaración de tipos para window.aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
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
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'error', text: string, needsKey?: boolean}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [githubData, setGithubData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang].ai;

  useEffect(() => {
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
        console.warn("GitHub API limited", e);
      }
    };
    fetchGH();
  }, []);

  useEffect(() => {
    const randomGreeting = t.greetings[Math.floor(Math.random() * t.greetings.length)];
    setMessages([{role: 'bot', text: randomGreeting}]);
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOpenKeySelector = async () => {
    if (!window.aistudio) return;
    try {
      await window.aistudio.openSelectKey();
      setMessages(prev => [...prev.filter(m => m.role !== 'error'), {
        role: 'bot', 
        text: lang === 'es' ? "¡Configuración actualizada! Prueba a preguntarme de nuevo." : "Configuration updated! Try asking me again."
      }]);
    } catch (e) {
      console.error("Error opening key selector", e);
    }
  };

  const handleAsk = async (customInput?: string) => {
    const userMsg = customInput || input.trim();
    if (!userMsg || isTyping) return;
    
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput('');
    setIsTyping(true);

    try {
      // Acceso directo a la variable inyectada.
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
        // Verificación para entorno de desarrollo/AI Studio
        const hasKey = (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') 
          ? await window.aistudio.hasSelectedApiKey() 
          : false;
          
        if (!hasKey) {
          throw new Error("MISSING_KEY");
        }
      }

      // Inicialización instanciada justo antes del uso para asegurar la clave más reciente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dynamicInstruction = `${t.system} ${githubData ? `DATOS GITHUB ACTUALES DE JUANMA: Bio: ${githubData.bio}. Repos públicos: ${githubData.public_repos}. Repos actualizados recientemente: ${githubData.recent}.` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: dynamicInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const botResponse = response.text || (lang === 'es' ? "No he podido obtener una respuesta clara. ¿Puedes intentarlo de nuevo?" : "I couldn't get a clear response. Can you try again?");
      
      setMessages(prev => [...prev, {role: 'bot', text: botResponse}]);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      
      let friendlyText = lang === 'es' 
        ? "Ha ocurrido un error inesperado al conectar con el servidor de IA." 
        : "An unexpected error occurred while connecting to the AI server.";
        
      if (error.message === "MISSING_KEY" || error.status === 403 || error.message.includes("API key")) {
        friendlyText = lang === 'es'
          ? "Error de autenticación. Verifica que 'API_KEY' esté correctamente configurada en las variables de entorno de Vercel y que el despliegue esté actualizado."
          : "Authentication error. Verify that 'API_KEY' is correctly configured in Vercel environment variables and the deployment is up to date.";
      }
      
      setMessages(prev => [...prev, {
        role: 'error', 
        text: friendlyText,
        needsKey: !!window.aistudio
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { 
      label: lang === 'es' ? 'Stack de Juanma' : 'Juanma\'s Tech Stack', 
      prompt: lang === 'es' ? '¿Cuáles son las tecnologías y lenguajes que domina Juanma actualmente?' : 'What are the technologies and languages that Juanma currently masters?' 
    },
    { 
      label: lang === 'es' ? 'Erasmus en Italia' : 'Erasmus in Italy', 
      prompt: lang === 'es' ? 'Cuéntame sobre la experiencia Erasmus de Juanma en Italia. ¿Qué tareas realizó?' : 'Tell me about Juanma\'s Erasmus experience in Italy. What tasks did he perform?' 
    },
    { 
      label: lang === 'es' ? '¿Está disponible?' : 'Is he available?', 
      prompt: lang === 'es' ? '¿Está Juanma abierto a ofertas de prácticas o empleo actualmente? ¿Cómo puedo contactar con él?' : 'Is Juanma currently open to internship or job offers? How can I contact him?' 
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[10001] flex flex-col items-end">
      {isOpen ? (
        <div className="w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] max-h-[85vh] glass-card rounded-[2.5rem] flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border-white/20 animate-in zoom-in duration-300">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-robot text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">{t.label}</span>
                <span className="flex items-center gap-2 text-[8px] text-emerald-500 font-black uppercase mt-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
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
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className="flex flex-col max-w-[85%] gap-2">
                  {m.role === 'error' ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-3 text-red-500">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span className="text-[11px] font-black uppercase tracking-widest">{t.errorTitle}</span>
                      </div>
                      <p className="text-[12px] text-red-200/80 leading-relaxed">{m.text}</p>
                      {m.needsKey && (
                        <button 
                          onClick={handleOpenKeySelector}
                          className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-200 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all border border-red-500/30"
                        >
                          {lang === 'es' ? 'CONFIGURAR CLAVE' : 'SETUP KEY'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={`px-5 py-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none'}`}>
                      {m.role === 'bot' ? <MarkdownLite text={m.text} /> : m.text}
                    </div>
                  )}
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
            <div className="grid grid-cols-2 sm:flex sm:justify-between gap-2 sm:gap-1 sm:overflow-hidden pb-1 no-scrollbar">
              {quickActions.map((qa, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAsk(qa.prompt)}
                  disabled={isTyping}
                  className={`${i === 2 ? 'col-span-2 sm:flex-1' : 'col-span-1 sm:flex-1'} cursor-hide whitespace-nowrap px-3 py-2 sm:px-1 glass-card rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-tighter text-blue-400 hover:bg-blue-900 hover:text-white transition-all border-blue-500/20 active:scale-95 disabled:opacity-50`}
                >
                  {qa.label}
                </button>
              ))}
            </div>
            <div className="relative flex items-center gap-3">
              <input 
                type="text" value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()} 
                placeholder={t.placeholder} 
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600" 
              />
              <button 
                onClick={() => handleAsk()} 
                disabled={!input.trim() || isTyping} 
                className="cursor-hide w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-blue-900 hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group flex items-center">
          <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 pointer-events-none transition-all duration-500">
            <div className="bg-blue-500/[0.08] backdrop-blur-xl border border-blue-500/30 px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/90">{t.tooltip}</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(true)} className="relative w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 hover:rounded-[2rem] hover:bg-blue-900 hover:text-white">
            <i className="fa-solid fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#050505]"></span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingAI;
