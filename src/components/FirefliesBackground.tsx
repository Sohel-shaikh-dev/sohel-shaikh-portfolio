import React, { useEffect, useRef } from 'react';

export const FirefliesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    
    // We want the canvas to cover the entire parent section height
    const updateSize = () => {
      if (canvas.parentElement) {
        width = canvas.width = window.innerWidth;
        // Get the actual computed height of the section
        const parentHeight = canvas.parentElement.getBoundingClientRect().height;
        // Fallback to window height if something goes wrong, but section height is preferred
        canvas.height = parentHeight > 0 ? parentHeight : window.innerHeight;
      }
    };
    
    updateSize();

    let particles: Array<{ x: number, y: number, radius: number, vx: number, vy: number, alpha: number, pulse: number }> = [];

    const initParticles = () => {
      particles = [];
      // Calculate particle count based on area, but cap at 160 for mobile performance
      const numParticles = Math.min(Math.floor(width * canvas.height / 8000), 160);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.8, // Slightly larger white stars
          vx: (Math.random() - 0.5) * 0.3, // Slower, cleaner movement
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * 0.02
        });
      }
    };

    initParticles();

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      // Disable mouse grab on mobile/touch screens to prevent "stuck" interactions
      if (window.innerWidth < 768) {
        mouse.x = -1000;
        mouse.y = -1000;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Pulse alpha
        p.alpha += p.pulse;
        if (p.alpha > 0.8 || p.alpha < 0.1) p.pulse *= -1;

        // Wrap around edges to create continuous flow
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle (White Star)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`; // White glow
        ctx.fill();
        
        // Draw constellation lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          
          // Only calculate square root if close enough (performance optimization)
          if (distSq < 15000) { // roughly 120px
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Crisp, very faint white lines for a cleaner web
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist/120)})`;
            ctx.stroke();
          }
        }
        
        // Draw constellation lines to mouse cursor
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distMouseSq < 22500) { // roughly 150px
          const distMouse = Math.sqrt(distMouseSq);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          // Much brighter and slightly thicker line for strong "grab" feeling
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - distMouse/150)})`;
          ctx.stroke();
          ctx.lineWidth = 1.0; // Reset for other lines
        }
      }

      requestAnimationFrame(draw);
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateSize();
        initParticles();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    
    // Also observe the parent element for height changes (e.g. accordion open/close)
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
