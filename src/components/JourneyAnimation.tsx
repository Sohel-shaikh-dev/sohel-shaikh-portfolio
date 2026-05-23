import { useEffect, useState, RefObject } from 'react';
import { motion, useTransform, MotionValue } from 'motion/react';
import { ScrollyCanvas } from './ScrollyCanvas';

interface JourneyAnimationProps {
  progress: MotionValue<number>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  box1Ref: RefObject<HTMLDivElement | null>;
  box2Ref: RefObject<HTMLDivElement | null>;
}

export function JourneyAnimation({ progress, wrapperRef, box1Ref, box2Ref }: JourneyAnimationProps) {
  const [coords, setCoords] = useState({
    start: { x: 0, y: 0, w: 0, h: 0 },
    end: { x: 0, y: 0, w: 0, h: 0 },
    isMobile: false
  });

  useEffect(() => {
    const updateCoords = () => {
      if (!wrapperRef.current || !box1Ref.current || !box2Ref.current) return;
      
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const b1Rect = box1Ref.current.getBoundingClientRect();
      const b2Rect = box2Ref.current.getBoundingClientRect();
      
      setCoords({
        start: {
          x: b1Rect.left - wrapperRect.left,
          y: b1Rect.top - wrapperRect.top,
          w: b1Rect.width,
          h: b1Rect.height
        },
        end: {
          x: b2Rect.left - wrapperRect.left,
          y: b2Rect.top - wrapperRect.top,
          w: b2Rect.width,
          h: b2Rect.height
        },
        isMobile: window.innerWidth < 768
      });
    };

    // Give it a tiny delay to ensure layout is settled
    setTimeout(updateCoords, 100);
    
    // Observe wrapper and both boxes for maximum accuracy
    const resizeObserver = new ResizeObserver(updateCoords);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (box1Ref.current) resizeObserver.observe(box1Ref.current);
    if (box2Ref.current) resizeObserver.observe(box2Ref.current);
    window.addEventListener('resize', updateCoords);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCoords);
    };
  }, [wrapperRef, box1Ref, box2Ref]);

  // Interpolate coordinates. On mobile, the scroll journey is much longer due to stacked sections.
  const endThreshold = coords.isMobile ? 0.4 : 0.5;
  const x = useTransform(progress, [0, endThreshold], [coords.start.x, coords.end.x]);
  const y = useTransform(progress, [0, endThreshold], [coords.start.y, coords.end.y]);
  const width = useTransform(progress, [0, endThreshold], [coords.start.w, coords.end.w]);
  const height = useTransform(progress, [0, endThreshold], [coords.start.h, coords.end.h]);
  
  // Animation effects
  const rotate = useTransform(progress, [0.1, endThreshold - 0.1], [0, 360]); 
  const scale = useTransform(progress, [0, endThreshold / 2, endThreshold], [1, 0.6, 1]); // Shrink in the middle
  
  const isReady = coords.start.w > 0;

  // Centers for the SVG line
  const lineStart = { x: coords.start.x + coords.start.w / 2, y: coords.start.y + coords.start.h / 2 };
  const lineEnd = { x: coords.end.x + coords.end.w / 2, y: coords.end.y + coords.end.h / 2 };

  // Calculate a control point for a nice curve instead of a straight line
  // On mobile, curve slightly to the right to avoid going off-screen left
  const controlPoint = {
    x: coords.isMobile ? (lineStart.x + lineEnd.x) / 2 + 100 : Math.min(lineStart.x, lineEnd.x) - 200,
    y: (lineStart.y + lineEnd.y) / 2
  };
  const pathData = `M ${lineStart.x} ${lineStart.y} Q ${controlPoint.x} ${controlPoint.y} ${lineEnd.x} ${lineEnd.y}`;

  return (
    <div style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
      {/* The Animated Line */}
      <svg 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <motion.path
          d={pathData}
          fill="transparent"
          stroke="#ff014f"
          strokeWidth="3"
          strokeDasharray="8 8"
          style={{ pathLength: progress }}
          className="opacity-70"
        />
      </svg>

      {/* The Floating Canvas */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          x,
          y,
          width,
          height,
          rotate,
          scale,
          zIndex: 40,
          transformOrigin: 'center center'
        }}
        className="rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(255,1,79,0.4)] border border-primary/20 bg-background pointer-events-auto"
      >
        <ScrollyCanvas 
          progress={progress} 
          className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0 hover:scale-110"
        />
      </motion.div>
    </div>
  );
}
