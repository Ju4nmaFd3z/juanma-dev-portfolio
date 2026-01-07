
import React, { useEffect, useRef } from 'react';

interface SnowEffectProps {
  theme?: 'dark' | 'light';
}

const SnowEffect: React.FC<SnowEffectProps> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; speed: number; opacity: number; wind: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      // Densidad equilibrada: ni mucha para saturar, ni poca para desaparecer
      const density = (window.innerWidth * window.innerHeight) / 8000;
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Tamaño sutil tipo "polvo de estrellas"
          radius: Math.random() * 1.1 + 0.5, 
          // Caída muy pausada y elegante
          speed: Math.random() * 0.15 + 0.05, 
          // Opacidad mínima garantizada para que se vea
          opacity: Math.random() * 0.25 + 0.15,
          wind: Math.random() * 0.05 - 0.025
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        // Color blanco para dark, azulado suave para light
        const color = theme === 'dark' ? `255, 255, 255` : `147, 197, 253`;
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        p.x += p.wind + Math.sin(p.y / 200) * 0.05;

        // Reposicionar cuando sale de pantalla
        if (p.y > canvas.height) {
          p.y = -5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      // z-0 para estar sobre el fondo del body pero bajo el contenido (z-10)
      className="fixed inset-0 pointer-events-none z-0" 
    />
  );
};

export default SnowEffect;
