'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'motion/react'

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const ParticleWrapper = ({ children, className = '' }: { children: React.ReactElement, className?: string }) => {
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  let childOnKeyDown: any;
  let childOnChange: any;

  if (React.isValidElement(children)) {
    childOnKeyDown = (children.props as any).onKeyDown;
    childOnChange = (children.props as any).onChange;
  }

  const handleInput = (e: any) => {
    if (e.type === 'keydown' && childOnKeyDown) childOnKeyDown(e);
    if (e.type === 'change' && childOnChange) childOnChange(e);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newParticles = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: random(10, rect.width - 20),
        y: random(10, rect.height - 20),
        color: ['#ff014f', '#00f0ff', '#ffffff'][Math.floor(Math.random() * 3)]
      }));

      setParticles(prev => [...prev, ...newParticles].slice(-20));

      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 800);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {React.cloneElement(children, {
        onKeyDown: handleInput,
        onChange: handleInput,
      })}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
            animate={{
              opacity: 0,
              scale: 0,
              x: p.x + random(-40, 40),
              y: p.y + random(-50, -10)
            }}
            transition={{ duration: random(0.4, 0.8), ease: "easeOut" }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`
            }}
          />
        ))}
      </div>
    </div>
  );
};
