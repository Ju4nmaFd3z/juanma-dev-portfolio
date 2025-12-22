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
      const density = (window.innerWidth * window.innerHeight) / 8000;
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3, 
          speed: Math.random() * 0.25 + 0.08, 
          opacity: Math.random() * 0.35 + 0.05,
          wind: Math.random() * 0.1 - 0.05
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        // Color adaptativo: blanco en oscuro, azul-acero suave en claro
        const color = theme === 'dark' ? `255, 255, 255` : `100, 149, 237`;
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        p.x += p.wind + Math.sin(p.y / 100) * 0.1;

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
  }, [theme]); // Re-dibujar cuando cambie el tema

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none -z-5 ${theme === 'dark' ? 'opacity-40' : 'opacity-20'}`} 
    />
  );
};

export default SnowEffect;