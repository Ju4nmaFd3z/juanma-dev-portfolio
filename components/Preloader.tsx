
import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onLoadingComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Fase 1: Mostrar el texto
    const appearanceTimer = setTimeout(() => setShowContent(true), 100);
    
    // Fase 2: Iniciar salida después de 2.5 segundos
    const exitTimer = setTimeout(() => setIsExiting(true), 2500);
    
    // Fase 3: Desmontar componente tras la animación de salida
    const completeTimer = setTimeout(() => onLoadingComplete(), 3300);

    return () => {
      clearTimeout(appearanceTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[20000] flex items-center justify-center bg-[#050505] transition-all duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
        isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo / Texto Central */}
        <div 
          className={`flex flex-col items-center gap-2 transition-all duration-1000 ease-out ${
            showContent ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-95'
          }`}
        >
          <div className="flex flex-col items-center leading-none">
            <span className="text-white font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-[-0.05em]">
              JUANMA
            </span>
            <span className="gradient-text font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-[-0.05em]">
              FERNÁNDEZ
            </span>
          </div>
          
          {/* Barra de carga minimalista */}
          <div className="mt-8 w-48 h-[1px] bg-white/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-loader-progress"></div>
          </div>
        </div>

        {/* Decoración de fondo sutil */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/5 rounded-full blur-[120px] transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>

      <style>{`
        @keyframes loader-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loader-progress {
          animation: loader-progress 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Preloader;
