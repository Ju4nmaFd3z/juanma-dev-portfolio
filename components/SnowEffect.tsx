import React, { useEffect, useRef, memo } from 'react';

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

    const dpr = window.devicePixelRatio || 1;
    let animId = 0;
    let particles: { x: number; y: number; radius: number; speed: number; opacity: number; wind: number }[] = [];

    // Pre-compute outside the draw loop — theme is constant between frames
    const baseColor = theme === 'dark' ? '255, 255, 255' : '147, 197, 253';

    const cssW = () => window.innerWidth;
    const cssH = () => window.innerHeight;

    const init = () => {
      const w = cssW();
      const h = cssH();
      particles = [];
      // Cap at 120 to keep per-frame cost bounded on large/high-DPI screens
      const density = Math.min(Math.floor((w * h) / 8000), 120);
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 1.1 + 0.5,
          speed: Math.random() * 0.15 + 0.05,
          opacity: Math.random() * 0.25 + 0.15,
          wind: Math.random() * 0.05 - 0.025,
        });
      }
    };

    const resize = () => {
      const w = cssW();
      const h = cssH();
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      // Clamp existing particles rather than reinitialising — prevents jarring reset
      particles.forEach(p => {
        if (p.x > w) p.x = Math.random() * w;
        if (p.y > h) p.y = Math.random() * h;
      });
    };

    const draw = () => {
      const w = canvas.width  / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        p.x += p.wind + Math.sin(p.y / 200) * 0.05;

        if (p.y > h)  { p.y = -5; p.x = Math.random() * w; }
        if (p.x > w)    p.x = 0;
        if (p.x < 0)    p.x = w;
      }

      ctx.restore();
      animId = requestAnimationFrame(draw);
    };

    const stop = () => { cancelAnimationFrame(animId); animId = 0; };
    const play = () => { if (animId) return; animId = requestAnimationFrame(draw); };
    const handleVisibility = () => { document.hidden ? stop() : play(); };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    init();
    resize();
    play();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 animate-in fade-in duration-1000"
    />
  );
};

export default memo(SnowEffect);
