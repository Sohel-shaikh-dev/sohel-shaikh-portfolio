"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate, AnimatePresence } from 'motion/react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Database,
  LineChart,
  BarChart,
  Table,
  Menu,
  X,
  ExternalLink,
  Github,
  Phone,
  Mail,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import React, { useState, useRef, useTransition } from 'react';
import { ScrollyCanvas } from '../../components/ScrollyCanvas';
import { JourneyAnimation } from '../../components/JourneyAnimation';
import { FirefliesBackground } from '../../components/FirefliesBackground';
import { submitContactForm } from './actions';
import { AlertModal } from '../../components/admin/AlertModal';

const ExperienceCard = ({ exp, index, isLast }: { exp: any, index: number, isLast: boolean, key?: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // The line grows down exactly matching the scroll progress
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 65%", "center 35%"] // Starts earlier, when card top hits 65% of viewport
  });

  // Line disappears exactly when it reaches the next dot (scrollYProgress = 1)
  const lineOpacity = useTransform(scrollYProgress, [0, 0.95, 1], [1, 1, 0]);

  // Dot glows only while the line is traveling, then turns gray when it hands off
  const dotColor = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], ["#374151", "#ff014f", "#ff014f", "#374151"]);
  const dotScale = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0.8, 1.2, 1.2, 0.8]);
  const dotShadow = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], ["none", "0 0 15px #ff014f", "0 0 15px #ff014f", "none"]);

  return (
    <div
      ref={cardRef}
      className="relative mb-16 md:mb-10 last:mb-0"
    >
      {/* Segment Line (Grows smoothly mapped to scroll progress, then vanishes) */}
      {!isLast && (
        <motion.div
          style={{ scaleY: scrollYProgress, opacity: lineOpacity }}
          className="absolute left-6 md:left-1/2 -translate-x-1/2 w-[2px] md:w-[3px] bg-primary z-10 shadow-[0_0_15px_#ff014f] origin-top top-10 -bottom-16 md:-bottom-10"
        />
      )}

      {/* The Timeline Dot (Glows based on scroll progress) */}
      <motion.div
        style={{ backgroundColor: dotColor, scale: dotScale, boxShadow: dotShadow }}
        className="absolute top-10 left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full z-20 border-[2px] border-background transition-colors"
      />

      <div className={`w-[calc(100%-4rem)] md:w-[45%] ${exp.side === 'left' ? 'ml-auto md:ml-0 md:mr-auto' : 'ml-auto mr-0'}`}>
        <motion.div
          initial={{ opacity: 0, x: exp.side === 'left' ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          className="p-5 md:p-8 bg-card rounded-2xl md:rounded-3xl neumorphic border border-white/5 relative group hover:bg-gradient-to-br from-[#1e2124] to-[#23272b] transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-3 md:mb-6">
            <span className="px-3 md:px-4 py-1 md:py-1.5 bg-background rounded-md md:rounded-lg text-primary text-[10px] md:text-xs font-bold neumorphic-inner">
              {exp.year}
            </span>
            <p className="text-gray-500 text-[10px] md:text-sm font-semibold">{exp.company}</p>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-4 group-hover:text-primary transition-colors">
            {exp.title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-[10px] md:text-sm">
            {exp.desc}
          </p>

          {/* Connector Arrow */}
          <div className={`absolute top-9 w-3 h-3 md:w-4 md:h-4 bg-card border-white/5 border-t border-l -left-1.5 rotate-[-45deg] ${exp.side === 'left' ? 'md:-right-2 md:left-auto md:rotate-[135deg]' : 'md:-left-2'}`}></div>
        </motion.div>
      </div>
    </div>
  );
};

const ProjectTiltCard = ({ project, index }: { project: any, index: number, key?: any }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform values for rotate (-10deg to 10deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  // Dynamic spotlight that follows the mouse
  const spotlightX = useTransform(mouseXSpring, v => `${(v + 0.5) * 100}%`);
  const spotlightY = useTransform(mouseYSpring, v => `${(v + 0.5) * 100}%`);
  const background = useMotionTemplate`radial-gradient(400px circle at ${spotlightX} ${spotlightY}, rgba(255, 1, 79, 0.15), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group p-3 md:p-6 bg-card rounded-xl md:rounded-3xl neumorphic border border-white/5 transition-all w-full h-full"
    >
      {/* Spotlight overlay (Desktop only) */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background }}
        />
      )}

      {/* Pop-out content wrapper */}
      <div style={isMobile ? {} : { transform: "translateZ(40px)" }} className="relative z-20 h-full flex flex-col">
        <div className="relative overflow-hidden rounded-lg md:rounded-2xl aspect-video mb-3 md:mb-8 shrink-0">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          {/* Desktop Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-4">
            <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
              <ExternalLink size={20} />
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
              <Github size={20} />
            </button>
          </div>
        </div>

        <div className="px-1 md:px-2 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <span className="text-primary text-[7px] md:text-[10px] font-bold uppercase tracking-widest truncate mr-2">{project.category}</span>
            <div className="flex gap-1 shrink-0">
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
            </div>
          </div>
          <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-4 group-hover:text-primary transition-colors leading-tight">
            {project.title}
          </h3>
          <p className="text-gray-500 text-[9px] md:text-sm leading-snug md:leading-relaxed mb-0 md:mb-4 line-clamp-3 md:line-clamp-none flex-grow">
            {project.desc}
          </p>

          {/* Mobile Action Buttons (Visible only on mobile) */}
          <div className="flex flex-col md:hidden gap-1.5 mt-3">
            <button className="w-full py-1.5 bg-primary/10 text-primary rounded-md text-[9px] font-bold flex items-center justify-center gap-1.5">
              <ExternalLink size={10} /> Demo
            </button>
            <button className="w-full py-1.5 bg-white/5 text-white rounded-md text-[9px] font-bold flex items-center justify-center gap-1.5 border border-white/10">
              <Github size={10} /> Source
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CaseStudyCard = ({ study, index }: { study: any, index: number, key?: any }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform values for rotate for the image only (-15deg to 15deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 md:p-12 bg-card rounded-[2.5rem] neumorphic border border-white/5 transition-all hover:border-white/10 relative overflow-hidden"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Visual Side */}
      <div className={`lg:col-span-5 ${index % 2 !== 0 ? 'lg:order-2' : ''}`} style={{ perspective: 1000 }}>
        <motion.div
          style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-3xl aspect-[4/3] neumorphic-inner p-2 cursor-crosshair shadow-2xl"
        >
          <div style={isMobile ? {} : { transform: "translateZ(30px)" }} className="w-full h-full relative z-10 overflow-hidden rounded-2xl">
            <img
              src={study.image}
              alt={study.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Subtle floating elements behind image */}
          <div style={isMobile ? {} : { transform: "translateZ(-20px)" }} className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl z-0"></div>
          <div style={isMobile ? {} : { transform: "translateZ(-10px)" }} className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl z-0"></div>
        </motion.div>
      </div>

      {/* Content Side */}
      <div className="lg:col-span-7 relative z-10">
        <span className="text-primary font-bold text-xs uppercase tracking-widest mb-4 block">{study.subtitle}</span>
        <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-8 group-hover:text-primary transition-colors duration-500">{study.title}</h3>

        <div className="space-y-8 mb-10">
          <div className="group/item">
            <h4 className="text-gray-100 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/50 group-hover/item:bg-primary group-hover/item:shadow-[0_0_10px_rgba(255,1,79,0.8)] transition-all"></span> The Challenge
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed pl-4 border-l border-white/5 group-hover/item:border-primary/30 transition-colors">{study.challenge}</p>
          </div>
          <div className="group/item">
            <h4 className="text-gray-100 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500/50 group-hover/item:bg-blue-500 group-hover/item:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all"></span> The Solution
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed pl-4 border-l border-white/5 group-hover/item:border-blue-500/30 transition-colors">{study.solution}</p>
          </div>

          {/* Glowing Key Result Box */}
          <div className="p-6 bg-background/50 rounded-2xl border border-white/5 border-l-4 border-l-primary neumorphic-inner relative overflow-hidden group-hover:shadow-[0_0_30px_rgba(255,1,79,0.15)] group-hover:border-l-primary transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h4 className="text-primary font-bold mb-2 relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              Key Result
            </h4>
            <p className="text-white text-lg font-semibold tracking-tight relative z-10">{study.result}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {study.tags.map((tag: string) => (
            <span key={tag} className="px-4 py-2 bg-card rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider neumorphic-inner border border-white/5 hover:border-primary/50 hover:text-white transition-colors cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const MagneticButton = ({ children, className, onClick, ...props }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Service3DCard = ({ skill, index }: { skill: any, index: number, key?: any }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group h-full p-5 md:p-10 bg-card/40 backdrop-blur-xl rounded-2xl md:rounded-3xl neumorphic border border-white/5 hover:border-white/20 hover:bg-gradient-to-br from-[#1e2124]/90 to-[#23272b]/90 transition-colors duration-500 relative"
      >
        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-2xl md:rounded-3xl transition-colors duration-500 blur-xl pointer-events-none"></div>

        {/* 3D Popping Content */}
        <div style={isMobile ? {} : { transform: "translateZ(50px)" }} className="relative z-10 transition-transform duration-300">
          <div className="mb-4 md:mb-8 p-2 md:p-4 bg-background/50 inline-block rounded-xl md:rounded-2xl neumorphic-inner text-primary group-hover:shadow-[0_0_20px_rgba(255,1,79,0.3)] transition-all">
            {skill.icon}
          </div>
          <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-5 text-white group-hover:text-primary transition-colors leading-tight">
            {skill.title}
          </h3>
          <p className="text-[10px] md:text-base text-gray-400 leading-snug md:leading-relaxed group-hover:text-gray-300 transition-colors">
            {skill.desc}
          </p>
          <div className="mt-4 md:mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 md:w-12 h-1 bg-primary rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CertificationCard = ({ cert, index }: { cert: any, index: number, key?: any }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group h-full p-5 md:p-8 bg-card/40 backdrop-blur-xl rounded-2xl md:rounded-3xl neumorphic border border-white/5 hover:border-white/20 hover:bg-gradient-to-br from-[#1e2124]/90 to-[#23272b]/90 transition-colors duration-500 relative flex flex-col"
      >
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-2xl md:rounded-3xl transition-colors duration-500 blur-xl pointer-events-none"></div>

        <div style={isMobile ? {} : { transform: "translateZ(40px)" }} className="relative z-10 transition-transform duration-300 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <span className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest">{cert.platform}</span>
            <span className="text-gray-500 text-[10px] md:text-xs font-bold bg-background/50 px-2.5 py-1 rounded-md neumorphic-inner border border-white/5">{cert.date}</span>
          </div>
          <h3 className="text-lg md:text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors leading-tight">
            {cert.title}
          </h3>
          <p className="text-[11px] md:text-sm text-gray-400 leading-snug md:leading-relaxed group-hover:text-gray-300 transition-colors flex-grow mb-6 md:mb-8">
            {cert.desc}
          </p>
          <div className="mt-auto">
            <button className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-white group-hover:text-primary transition-colors uppercase tracking-widest">
              View Certificate <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const ParticleWrapper = ({ children, onChange, onKeyDown, ...props }: any) => {
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.KeyboardEvent<HTMLElement> | React.ChangeEvent<HTMLElement>) => {
    if (onKeyDown && e.type === 'keydown') onKeyDown(e as any);
    if (onChange && e.type === 'change') onChange(e as any);

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
    <div className="relative w-full" ref={containerRef}>
      {React.cloneElement(children, {
        onKeyDown: handleInput,
        onChange: handleInput,
        ...props
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

const NeonSendButton = ({ children, className, ...props }: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group w-full ${className}`}
      {...props}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-[#ff4d79] to-[#00f0ff] rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"></div>

      <div className="relative w-full h-full bg-card group-hover:bg-background border border-white/10 group-hover:border-primary/50 rounded-xl px-8 py-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(255,1,79,0.4)]">
        <span className="font-bold uppercase tracking-[0.2em] text-xs text-white group-hover:text-primary transition-colors flex items-center justify-center gap-2">
          {children}
        </span>
      </div>
    </motion.button>
  );
};

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href="https://wa.me/917718938615?text=Hi%20Sohel%2C%20I%20viewed%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project%20with%20you."
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
    >
      {/* Tooltip */}
      <span className="absolute right-16 px-4 py-2 bg-card border border-white/10 rounded-xl text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl neumorphic pointer-events-none translate-x-2 group-hover:translate-x-0">
        Chat on WhatsApp
      </span>

      {/* Outer Pulse */}
      <span className="absolute w-14 h-14 bg-[#25D366] rounded-full animate-ping opacity-40"></span>

      {/* Button */}
      <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 border-2 border-white/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.299-.018-.461.13-.611.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </div>
    </motion.a>
  );
};

const PolicyModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'privacy' | 'terms' | null }) => {
  if (!isOpen || !type) return null;

  const content = {
    privacy: {
      title: "Privacy Policy",
      text: (
        <div className="space-y-4 text-gray-400 text-sm md:text-base leading-relaxed">
          <p>I respect your privacy. Any information you share through this portfolio, including your contact details and project requirements, is strictly used for our direct communication.</p>
          <p>I do not sell your data to third parties, nor do I use tracking cookies to follow you around the internet. Your project ideas and business data remain strictly confidential.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      text: (
        <div className="space-y-4 text-gray-400 text-sm md:text-base leading-relaxed">
          <p>By using this website, you agree to keep things professional. The case studies, code snippets, and projects displayed here are my original, proprietary work or shared with explicit permission.</p>
          <p>Please do not copy, scrape, or repurpose my work for your own commercial use without my permission. If we decide to collaborate on a freelance project, specific terms, timelines, and NDAs will be discussed and agreed upon separately.</p>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-card rounded-3xl p-6 md:p-10 neumorphic border border-white/10 shadow-2xl z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-background rounded-full flex items-center justify-center text-gray-400 hover:text-white border border-white/5 hover:border-white/20 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6 pr-8">
          {content[type].title}
        </h3>
        {content[type].text}

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform cursor-pointer shadow-[0_0_15px_rgba(255,1,79,0.3)]"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function PortfolioClient({ 
  initialSettings, 
  initialProjects = [], 
  initialCaseStudies = [], 
  initialCertifications = [], 
  initialExperiences = [] 
}: { 
  initialSettings?: any;
  initialProjects?: any[];
  initialCaseStudies?: any[];
  initialCertifications?: any[];
  initialExperiences?: any[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  });
  const heroAboutRef = useRef<HTMLDivElement>(null);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setAlertInfo({ isOpen: true, title: 'Message Sent!', message: 'Thank you for reaching out. I will get back to you soon.', type: 'success' });
        (e.target as HTMLFormElement).reset();
      } else {
        setAlertInfo({ isOpen: true, title: 'Error', message: result.error || 'Something went wrong.', type: 'error' });
      }
    });
  };

  const { scrollYProgress } = useScroll({
    target: heroAboutRef,
    offset: ["start start", "end end"]
  });

  const stats = {
    projects: initialSettings?.stats_projects_done || '80+',
    clients: initialSettings?.stats_happy_clients || '50+',
    success: initialSettings?.stats_success_rate || '98%'
  };

  const cvUrl = initialSettings?.cv_pdf_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${initialSettings.cv_pdf_path}?download=`
    : '#';


  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Certifications', href: '#certifications' },
    { name: 'Case Study', href: '#casestudy' },
    { name: 'Service', href: '#service' },
    { name: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: <Facebook size={20} />, href: 'https://www.facebook.com/share/1asBpmQEbw/' },
    { icon: <Instagram size={20} />, href: 'https://www.instagram.com/ai_metaworld?igsh=MThqaXl5aXMwbGg3ZA==' },
    { icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/sohel-shaikhh' },
    { icon: <Github size={20} />, href: 'https://github.com/Sohel-shaikh-dev' },
  ];

  const skills = [
    { icon: <Database size={20} />, name: 'SQL' },
    { icon: <BarChart size={20} />, name: 'Power BI' },
    { icon: <Table size={20} />, name: 'Excel' },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">Sohel<span className="text-primary">.dev</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,1,79,0.3)]"
            >
              Hire Me
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background border-b border-white/5 px-6 py-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-gray-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      <div ref={heroAboutRef} className="relative">
        {/* Hero Section */}
        <main id="home" className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 md:gap-12 items-start md:items-center">

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="z-10"
            >
              <span className="inline-block text-gray-400 tracking-[0.1em] md:tracking-[0.2em] font-medium text-[8px] sm:text-[10px] md:text-sm mb-2 md:mb-6 uppercase">
                Welcome to my world
              </span>
              <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-4 md:mb-8">
                Hi, I'm <br className="block md:hidden" /><span className="text-primary tracking-tight">Sohel Shaikh</span>
                <br />
                <span className="text-gray-100 text-sm sm:text-base md:text-3xl lg:text-4xl block mt-1 md:mt-2">a Professional Data Analyst.</span>
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-xs md:text-lg leading-relaxed max-w-xl mb-6 md:mb-12">
                Detail-oriented and analytical Data Analyst with strong skills in Power BI, SQL, DAX, and Excel.
                Experienced in building interactive dashboards and transforming raw data into meaningful business insights.
              </p>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12"
              >
                <div className="flex items-center">
                  {/* Profile Image / 3D Canvas */}
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary/20 mr-2 md:mr-4">
                    <img src="/frames/ezgif-frame-001.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm text-gray-400">Available for</p>
                    <p className="font-bold text-xs md:text-base">Freelance Work</p>
                  </div>
                </div>
              </motion.div>

              {/* Desktop Only Social & Skills */}
              <div className="hidden md:grid grid-cols-2 gap-4 xl:gap-20">
                {/* Social Links */}
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-6 font-bold">Find with me</p>
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    {socialLinks.map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -5 }}
                        className="w-8 h-8 md:w-14 md:h-14 bg-card rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br from-[#1e2124] to-[#23272b] transition-all neumorphic border border-white/5"
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-6 font-bold">Best skill on</p>
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    {skills.map((skill, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="w-8 h-8 md:w-14 md:h-14 bg-card rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all neumorphic border border-white/5"
                        title={skill.name}
                      >
                        {skill.icon}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative md:ml-auto"
            >
              <div className="relative z-10 w-full max-w-[500px] aspect-[4/5] p-2 md:p-4 bg-card rounded-xl md:rounded-2xl neumorphic border border-white/5">
                <div className="w-full h-full rounded-lg md:rounded-xl overflow-hidden relative group">
                  <div ref={box1Ref} className="w-full h-full opacity-0">
                    <img src="/frames/ezgif-frame-001.jpg" className="w-full h-full object-cover" alt="Profile placeholder" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent opacity-80"></div>
                </div>
              </div>

              {/* Outline Card behind */}
              <div className="absolute -inset-4 border-2 border-white/5 rounded-[2rem] -z-20 scale-95 opacity-50"></div>

              {/* Mobile Only Social & Skills (to fill empty space below image) */}
              <div className="flex md:hidden flex-col gap-6 mt-6">
                {/* Social Links */}
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-6 font-bold">Find with me</p>
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    {socialLinks.map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -5 }}
                        className="w-8 h-8 md:w-14 md:h-14 bg-card rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br from-[#1e2124] to-[#23272b] transition-all neumorphic border border-white/5"
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-6 font-bold">Best skill on</p>
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    {skills.map((skill, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="w-8 h-8 md:w-14 md:h-14 bg-card rounded-lg md:rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all neumorphic border border-white/5"
                        title={skill.name}
                      >
                        {skill.icon}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </main>

        {/* About Section */}
        <section id="about" className="py-16 md:py-32 px-4 md:px-6 border-t border-white/5 relative bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-16 items-start lg:items-center">

              {/* Image / Visual Column */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="col-span-1 lg:col-span-5 relative"
              >
                <div className="p-2 md:p-4 bg-card rounded-xl md:rounded-3xl neumorphic border border-white/5 aspect-[3/4] relative">
                  <div className="w-full h-full rounded-lg md:rounded-2xl overflow-hidden grayscale">
                    <div ref={box2Ref} className="w-full h-full opacity-0">
                      <img src="/frames/ezgif-frame-240.jpg" className="w-full h-full object-cover" alt="Profile placeholder 2" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-2 md:left-auto md:-bottom-8 md:-right-8 p-2 md:p-6 bg-card rounded-lg md:rounded-2xl neumorphic border border-white/5 text-center z-50">
                    <p className="text-lg md:text-xl font-extrabold text-primary leading-none mb-1">Power BI</p>
                    <p className="text-[6px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold leading-tight">Certified</p>
                  </div>
                </div>
              </motion.div>

              {/* Intro Content Column */}
              <div className="col-span-1 lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-primary uppercase tracking-[0.1em] md:tracking-[0.3em] text-[10px] md:text-sm font-bold block mb-2 md:mb-4">About Me</span>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 md:mb-8 leading-tight">
                    Data Analysis & Visualization <br className="hidden md:block" />
                    <span className="text-gray-400">is what I do best.</span>
                  </h2>

                  {/* DESKTOP ONLY CONTENT (Hidden on Mobile) */}
                  <div className="hidden lg:block">
                    <p className="text-gray-400 text-xs sm:text-sm md:text-lg leading-relaxed mb-6 md:mb-10">
                      I am a passionate Data Analyst specializing in Power BI and SQL.
                      I focus on delivering KPI-based reports, data modeling, and performance optimization
                      to support data-driven business decisions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      <div className="p-6 bg-card rounded-2xl neumorphic-inner border border-white/5">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          Exploratory Analysis
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          Deep diving into datasets to discover patterns, anomalies, and relationships using SQL, Excel, and Power BI.
                        </p>
                      </div>
                      <div className="p-6 bg-card rounded-2xl neumorphic-inner border border-white/5">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Business Intelligence
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          Building interactive dashboards and automated reporting systems using Tableau, Power BI, and SQL.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-12">
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-1">{stats.projects}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Projects Done</p>
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-1">{stats.clients}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Happy Clients</p>
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-1">{stats.success}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Success Rate</p>
                      </div>
                    </div>

                    <div className="mt-16">
                      <a 
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center px-10 py-5 bg-card rounded-2xl neumorphic border border-white/5 text-primary font-bold hover:text-white transition-colors group"
                      >
                        Download My CV
                        <span className="inline-block ml-2 group-hover:translate-y-1 transition-transform">↓</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* MOBILE ONLY Full Width Content (Cards, Stats, Resume) */}
              <div className="col-span-2 lg:hidden">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <p className="text-gray-400 text-xs sm:text-sm md:text-lg leading-relaxed mb-6 md:mb-10 mt-2 md:mt-0">
                    I am a passionate Data Analyst specializing in Power BI and SQL.
                    I focus on delivering KPI-based reports, data modeling, and performance optimization
                    to support data-driven business decisions.
                  </p>

                  <div className="grid grid-cols-2 gap-3 md:gap-8 mb-8 md:mb-12">
                    <div className="p-3 md:p-6 bg-card rounded-xl md:rounded-2xl neumorphic-inner border border-white/5">
                      <h3 className="text-white font-bold text-[10px] md:text-base mb-1 md:mb-3 flex items-center gap-1 md:gap-2">
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary flex-shrink-0"></div>
                        Exploratory Analysis
                      </h3>
                      <p className="text-gray-500 text-[8px] md:text-sm leading-relaxed">
                        Deep diving into datasets to discover patterns, anomalies, and relationships using SQL, Excel, and Power BI.
                      </p>
                    </div>
                    <div className="p-3 md:p-6 bg-card rounded-xl md:rounded-2xl neumorphic-inner border border-white/5">
                      <h3 className="text-white font-bold text-[10px] md:text-base mb-1 md:mb-3 flex items-center gap-1 md:gap-2">
                        <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        Business Intelligence
                      </h3>
                      <p className="text-gray-500 text-[8px] md:text-sm leading-relaxed">
                        Building interactive dashboards and automated reporting systems using Tableau, Power BI, and SQL.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row justify-between lg:justify-start gap-4 lg:gap-12 flex-wrap">
                    <div className="text-center lg:text-left flex-1 lg:flex-none">
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.projects}</h4>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold">Projects<br className="block md:hidden" /> Done</p>
                    </div>
                    <div className="text-center lg:text-left flex-1 lg:flex-none">
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.clients}</h4>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold">Happy<br className="block md:hidden" /> Clients</p>
                    </div>
                    <div className="text-center lg:text-left flex-1 lg:flex-none">
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.success}</h4>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold">Success<br className="block md:hidden" /> Rate</p>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-16 text-center lg:text-left w-full">
                    <a 
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex justify-center w-full lg:w-auto px-6 md:px-10 py-4 md:py-5 bg-card rounded-xl md:rounded-2xl neumorphic border border-white/5 text-primary font-bold hover:text-white transition-colors group"
                    >
                      Download My CV
                      <span className="inline-block ml-2 group-hover:translate-y-1 transition-transform">↓</span>
                    </a>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        <JourneyAnimation
          progress={scrollYProgress}
          wrapperRef={heroAboutRef}
          box1Ref={box1Ref}
          box2Ref={box2Ref}
        />
      </div>

      {/* Skills Bar Section */}
      <section id="skills" className="py-16 md:py-32 px-4 md:px-6 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.3em] text-sm font-bold block mb-4"
            >
              Expertise
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-6xl font-extrabold text-white"
            >
              My Skills
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
            {/* Technical Skills - Progress Bars */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-6 md:p-10 bg-card rounded-2xl md:rounded-[2.5rem] neumorphic border border-white/5"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-10 flex items-center gap-2 md:gap-3">
                <span className="w-6 md:w-8 h-[2px] bg-primary"></span>
                Technical Skills
              </h3>

              <div className="space-y-6 md:space-y-8">
                {[
                  { name: "SQL & ETL", level: "95%", icon: <Database size={16} className="text-primary" /> },
                  { name: "Data Visualization", level: "90%", icon: <LineChart size={16} className="text-primary" /> },
                  { name: "Data Modeling", level: "85%", icon: <Table size={16} className="text-primary" /> },
                  { name: "Data Cleaning", level: "92%", icon: <Database size={16} className="text-primary" /> },
                  { name: "Advanced Excel", level: "90%", icon: <LineChart size={16} className="text-primary" /> }
                ].map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2 md:mb-3 px-1 items-center">
                      <div className="flex items-center gap-2">
                        {skill.icon}
                        <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-gray-400">{skill.name}</span>
                      </div>
                      <span className="text-primary font-bold text-[10px] md:text-sm tracking-widest">{skill.level}</span>
                    </div>
                    <div className="h-3 w-full bg-background rounded-full neumorphic-inner p-1">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: skill.level }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tools Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4 md:gap-8"
            >
              <div className="p-6 md:p-10 bg-card rounded-2xl md:rounded-[2.5rem] neumorphic border border-white/5 flex-grow">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-10 flex items-center gap-2 md:gap-3">
                  <span className="w-6 md:w-8 h-[2px] bg-primary"></span>
                  Software & Tools
                </h3>

                <div className="flex flex-wrap gap-2 md:gap-4">
                  {[
                    "Power BI", "Tableau", "Power Query", "DAX", "SQL Server",
                    "Excel (Advanced)", "SSIS", "Google Analytics",
                    "MS Word", "PowerPoint", "Data Modeling", "VS Code"
                  ].map((tool, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-3 md:px-6 py-2 md:py-4 bg-background rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold text-gray-400 border border-white/5 neumorphic-inner cursor-default hover:text-primary transition-colors"
                    >
                      {tool}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-10 bg-card rounded-2xl md:rounded-[2.5rem] neumorphic border border-white/5">
                <p className="text-gray-500 italic text-xs md:text-sm leading-relaxed">
                  "Data is the new oil, but only if you know how to refine it. My toolkit is built to transform complex datasets into high-value business assets."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 md:py-32 px-4 md:px-6 bg-background border-t border-white/5 relative overflow-hidden">
        {/* Constellation / Fireflies Background */}
        <FirefliesBackground />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.3em] text-[10px] md:text-sm font-bold block mb-2 md:mb-4"
            >
              Professional History
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-6xl font-extrabold text-white"
            >
              Work Experience
            </motion.h2>
          </div>

          <div className="relative before:absolute before:left-1/2 before:h-full before:w-[1px] before:bg-white/10 before:-translate-x-1/2">
            {(initialExperiences.length > 0 ? initialExperiences : [
              {
                year: "Feb 2025 - May 2025",
                title: "Data Analyst",
                company: "Accenture",
                desc: "Advised a hypothetical social media client by analyzing massive datasets. Evaluated 16 unique content categories to identify engagement trends, highlighting the 'animal' category as the most favored content type based on photo post volume.",
                side: "left"
              },
              {
                year: "Oct 2024 - Feb 2025",
                title: "Power BI Developer",
                company: "PwC",
                desc: "Designed Call Centre analytics reporting to track performance trends and customer ratings. Developed Churn Analysis dashboards using advanced DAX functions to support operational decision-making for 7000+ customers. Crafted Diversity & Inclusion reports to harmonize workforce data and highlight gender distribution metrics.",
                side: "right"
              }
            ]).map((exp, index, array) => (
              <ExperienceCard key={index} exp={exp} index={index} isLast={index === array.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-32 px-4 md:px-6 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm font-bold block mb-3 md:mb-4"
            >
              Visit my projects and keep your feedback
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-6xl font-extrabold text-white"
            >
              My Projects
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
            {(() => {
              const projectsData = initialProjects.length > 0 ? initialProjects : [
                {
                  title: "E-commerce Sales Dashboard",
                  category: "Power BI / Tableau",
                  image: "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=800",
                  desc: "Interactive dashboard visualizing $2M+ in annual sales data with deep-drill capabilities into regions and categories."
                },
                {
                  title: "Customer Segment Analysis",
                  category: "SQL / Data Modeling",
                  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
                  desc: "Developed complex DAX measures to segment user base into 5 distinct personas, increasing marketing ROI by 25%."
                },
                {
                  title: "Financial Risk Assessment",
                  category: "SQL / Excel Analytics",
                  image: "https://images.unsplash.com/photo-1543286386-713bcd534a70?auto=format&fit=crop&q=80&w=800",
                  desc: "Complex statistical model assessing credit risk for SME loans using historical repayment data and macro-economic factors."
                },
                {
                  title: "Inventory Optimization Tool",
                  category: "Power Query / Excel",
                  image: "https://images.unsplash.com/photo-1586769852044-692d6e3703a0?auto=format&fit=crop&q=80&w=800",
                  desc: "Reduced stockouts by 15% through dynamic inventory forecasting using Power Query and advanced Excel modeling."
                },
                {
                  title: "Healthcare Insights Engine",
                  category: "Data Visualization",
                  image: "https://images.unsplash.com/photo-1504868584819-f8e905263543?auto=format&fit=crop&q=80&w=800",
                  desc: "A holistic view of patient recovery rates and clinic efficiency metrics across 12 different hospital locations."
                },
                {
                  title: "Real Estate Market Trends",
                  category: "Market Research",
                  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
                  desc: "Scraped and analyzed 50k+ property listings to identify undervalued investment zones in Tier-1 cities."
                }
              ];

              return projectsData.map((project, index) => {
                const isHiddenOnMobile = !showAllProjects && index >= 4;
                const isHiddenOnDesktop = !showAllProjects && index >= 6;

                let visibilityClass = "block";
                if (isHiddenOnMobile && isHiddenOnDesktop) {
                  visibilityClass = "hidden";
                } else if (isHiddenOnMobile && !isHiddenOnDesktop) {
                  visibilityClass = "hidden md:block";
                }

                return (
                  <div key={index} className={visibilityClass}>
                    <ProjectTiltCard project={project} index={index} />
                  </div>
                );
              });
            })()}
          </div>

          {(() => {
            const totalProjects = 6; // Current length is 6, update this if you add more projects above
            const hasMoreOnMobile = totalProjects > 4;
            const hasMoreOnDesktop = totalProjects > 6;

            if (showAllProjects || (!hasMoreOnMobile && !hasMoreOnDesktop)) return null;

            return (
              <div className={`mt-16 flex justify-center ${hasMoreOnMobile && !hasMoreOnDesktop ? 'md:hidden' : ''} ${!hasMoreOnMobile && hasMoreOnDesktop ? 'hidden md:flex' : ''}`}>
                <div className="flex justify-center">
                  <MagneticButton
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    onClick={() => setShowAllProjects(true)}
                    className="group px-8 py-4 bg-card rounded-2xl neumorphic border border-white/5 text-primary font-bold hover:text-white transition-all flex items-center gap-3 hover:shadow-[0_0_20px_rgba(255,1,79,0.2)] cursor-pointer relative overflow-hidden"
                  >
                    {/* Subtle hover pulse layer */}
                    <span className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">View More Projects</span>
                    <ChevronDown size={20} className="relative z-10 group-hover:translate-y-1 transition-transform" />
                  </MagneticButton>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-16 md:py-32 px-4 md:px-6 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm font-bold block mb-3 md:mb-4"
            >
              Continuous Learning & Growth
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-6xl font-extrabold text-white"
            >
              Certifications
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {(initialCertifications.length > 0 ? initialCertifications : [
              {
                title: "Google Data Analytics Professional Certificate",
                platform: "Coursera",
                date: "2024",
                desc: "Comprehensive curriculum covering data cleaning, visualization, and analysis using tools like R, SQL, and Tableau."
              },
              {
                title: "Microsoft Certified: Power BI Data Analyst Associate",
                platform: "Microsoft",
                date: "2024",
                desc: "Advanced certification validating expertise in modeling, visualizing, and analyzing data with Power BI."
              },
              {
                title: "Advanced Power BI & DAX",
                issuing_platform: "Coursera",
                date_earned: "2023-01-01",
                description: "Focused on complex DAX query writing, performance optimization, and data extraction for analytical purposes."
              }
            ]).map((cert, index) => (
              <CertificationCard key={index} cert={cert} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section id="casestudy" className="py-32 px-6 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.3em] text-sm font-bold block mb-4"
            >
              Detailed Analytics Walkthrough
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white"
            >
              Case Studies
            </motion.h2>
          </div>

          <div className="flex flex-col gap-20">
            {(() => {
              const caseStudiesData = initialCaseStudies.length > 0 ? initialCaseStudies : [
                {
                  title: "Optimizing Supply Chain Through Predictive Analytics",
                  subtitle: "Logistics Industry",
                  image: "https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=1200",
                  challenge: "A leading retail chain was facing declining margins despite high footfall. They needed to identify price elasticity and optimal discount windows.",
                  solution: "Implemented an advanced Power BI data model analyzing 5 years of transaction data. Created a real-time dashboard for monitoring of SKU performance.",
                  key_result: "12% increase in overall quarterly revenue and 8% reduction in overstock inventory costs.",
                  tags: ["DAX", "Data Modeling", "Power BI", "Retail"]
                },
                {
                  title: "Healthcare Patient Flow Analysis",
                  subtitle: "Operational Efficiency Study",
                  image: "https://images.unsplash.com/photo-1504868584819-f8e905263543?auto=format&fit=crop&q=80&w=1200",
                  challenge: "A multi-specialty hospital experienced bottleneck clusters in the emergency department, leading to long wait times and patient dissatisfaction.",
                  solution: "Performed time-series analysis and queuing theory modeling on patient admission data. Identified specific hours where staffing didn't match demand.",
                  result: "Reduced average patient wait time by 30% without increasing total staff headcount through better scheduling.",
                  tags: ["Queuing Theory", "SQL", "Tableau", "Healthcare"]
                }
              ];

              return (
                <>
                  {caseStudiesData.map((study, index) => (
                    <CaseStudyCard key={index} study={study} index={index} />
                  ))}

                  {caseStudiesData.length > 2 && (
                    <div className="mt-20 text-center">
                      <div className="flex justify-center">
                        <MagneticButton className="group px-12 py-5 bg-card rounded-2xl neumorphic border border-white/5 text-primary font-bold hover:text-white transition-all hover:shadow-[0_0_20px_rgba(255,1,79,0.2)] flex items-center justify-center cursor-pointer relative overflow-hidden">
                          <span className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative z-10">View All Case Studies</span>
                          <span className="relative z-10 inline-block ml-3 group-hover:translate-x-2 transition-transform">→</span>
                        </MagneticButton>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section id="service" className="py-32 px-6 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary uppercase tracking-[0.3em] text-sm font-bold block mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white"
            >
              Service
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                title: "Business Intelligence",
                desc: "Developing comprehensive BI strategies and interactive dashboards that provide actionable insights.",
                icon: <LineChart className="text-primary" size={32} />
              },
              {
                title: "Statistical Modeling",
                desc: "Applying advanced statistical techniques to identify trends and predict future outcomes with high accuracy.",
                icon: <Database className="text-primary" size={32} />
              },
              {
                title: "Data Warehousing",
                desc: "Designing and managing efficient data pipelines and storage solutions for large-scale enterprise data.",
                icon: <Table className="text-primary" size={32} />
              },
              {
                title: "Advanced Excel Modeling",
                desc: "Expertise in Power Query, Data Models, and complex formulas for sophisticated data manipulation.",
                icon: <Database className="text-primary" size={32} />
              },
              {
                title: "Advanced SQL",
                desc: "Writing complex queries for data extraction, transformation, and load (ETL) processes.",
                icon: <Table className="text-primary" size={32} />
              },
              {
                title: "Data Storytelling",
                desc: "Translating complex data findings into clear, compelling narratives for non-technical stakeholders.",
                icon: <LineChart className="text-primary" size={32} />
              }
            ].map((skill, index) => (
              <Service3DCard key={index} skill={skill} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 px-4 md:px-6 bg-background border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-white mb-4"
            >
              Ready to elevate your <span className="text-primary tracking-tight">data?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-base md:text-lg max-w-xl mx-auto"
            >
              Let's discuss how we can transform your reporting and analytics into actionable business intelligence.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-6 md:p-10 bg-card rounded-3xl neumorphic border border-white/5 shadow-2xl"
          >
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Your Name <span className="text-primary">*</span></label>
                  <ParticleWrapper>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Sohel Shaikh"
                      className="w-full bg-background border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none neumorphic-inner focus:border-primary/50 transition-all placeholder:text-gray-700 relative z-10"
                    />
                  </ParticleWrapper>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Phone Number</label>
                  <ParticleWrapper>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+91 7718938615"
                      className="w-full bg-background border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none neumorphic-inner focus:border-primary/50 transition-all placeholder:text-gray-700 relative z-10"
                    />
                  </ParticleWrapper>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Email <span className="text-primary">*</span></label>
                  <ParticleWrapper>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="sohel82.shaikh@gmail.com"
                      className="w-full bg-background border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none neumorphic-inner focus:border-primary/50 transition-all placeholder:text-gray-700 relative z-10"
                    />
                  </ParticleWrapper>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Subject <span className="text-primary">*</span></label>
                  <ParticleWrapper>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="Data Project"
                      className="w-full bg-background border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none neumorphic-inner focus:border-primary/50 transition-all placeholder:text-gray-700 relative z-10"
                    />
                  </ParticleWrapper>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-1">Message</label>
                <ParticleWrapper>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    placeholder="Tell me about your project..."
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none neumorphic-inner focus:border-primary/50 transition-all resize-none placeholder:text-gray-700 relative z-10"
                  ></textarea>
                </ParticleWrapper>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-card rounded-2xl text-primary font-bold overflow-hidden transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></span>
                  <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-primary/30 transition-colors duration-500 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_0_20px_rgba(255,1,79,0.2)]"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {isPending ? 'Sending...' : 'Send Message'}
                    {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background neumorphic-inner flex items-center justify-center text-primary flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Call Me</p>
                  <p className="text-sm text-gray-200 font-bold">+91 7718938615</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background neumorphic-inner flex items-center justify-center text-primary flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Email Me</p>
                  <p className="text-sm text-gray-200 font-bold break-all">sohel82.shaikh@gmail.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-32 pb-12 px-6 bg-background border-t border-white/5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto">
          {/* Top part with "Back to Top" */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-8">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-card rounded-2xl neumorphic flex items-center justify-center border border-white/5">
                <span className="text-primary font-bold text-3xl">S</span>
              </div>
              <span className="text-4xl font-bold tracking-tighter text-white">Sohel<span className="text-primary">.dev</span></span>
            </div>

            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-card rounded-2xl neumorphic flex items-center justify-center text-primary border border-white/5 group hover:text-white transition-colors"
            >
              <ChevronUp size={28} className="group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            {/* About Column */}
            <div className="space-y-8">
              <h4 className="text-white font-bold text-lg uppercase tracking-[0.2em]">About Me</h4>
              <p className="text-gray-500 leading-relaxed text-base">
                Data Analyst & BI Specialist dedicated to turning complex data into visual stories that drive smart decisions.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5, scale: 1.1 }}
                    className="w-11 h-11 bg-card rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all neumorphic border border-white/5"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Navigation Column */}
            <div>
              <h4 className="text-white font-bold text-lg uppercase tracking-[0.2em] mb-8">Navigation</h4>
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-primary transition-all flex items-center gap-3 group text-base font-medium"
                    >
                      <span className="w-2 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="text-white font-bold text-lg uppercase tracking-[0.2em] mb-8">Core Services</h4>
              <ul className="space-y-4">
                {[
                  "BI Strategy",
                  "Custom Dashboards",
                  "Predictive Modeling",
                  "Data ETL Pipelines",
                  "Big Data Solutions"
                ].map((service) => (
                  <li key={service} className="text-gray-500 text-base font-medium flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-8">
              <h4 className="text-white font-bold text-lg uppercase tracking-[0.2em]">Reach Me</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-card neumorphic flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-white/5">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Phone</p>
                    <p className="text-gray-200 font-bold text-sm tracking-wide">+91 7718938615</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-card neumorphic flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-white/5">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Email</p>
                    <p className="text-gray-200 font-bold text-sm break-all">sohel82.shaikh@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-gray-600 text-sm font-semibold tracking-wider uppercase">
              <span className="hover:text-primary cursor-default transition-colors">© 2026 Analytics Portfolio</span>
              <div className="hidden md:block w-px h-4 bg-white/10"></div>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="hover:text-white transition-colors">Terms of Service</a>
            </div>

            <p className="text-gray-500 text-sm font-medium tracking-wide bg-card px-6 py-3 rounded-full border border-white/5 neumorphic-inner">
              Crafted with <span className="text-primary mx-1">❤</span> by <span className="text-white font-bold">Sohel Shaikh</span>
            </p>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />

      <AnimatePresence>
        {activeModal && (
          <PolicyModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            type={activeModal}
          />
        )}
      </AnimatePresence>

      <AlertModal 
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
