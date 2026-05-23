import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, MotionValue } from 'motion/react';

interface ScrollyCanvasProps {
  progress: MotionValue<number>;
  className?: string;
}

const FRAME_COUNT = 240;

// Helper to pad the frame number with leading zeros (e.g., 001, 045, 240)
const currentFrame = (index: number) => 
  `/frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

export function ScrollyCanvas({ progress, className = "" }: ScrollyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all images on component mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        // Force a draw of the first frame as soon as it's ready
        if (i === 1) {
          setImagesLoaded(true);
        }
      };
      loadedImages.push(img);
    }
    
    setImages(loadedImages);
  }, []);

  // Function to draw a specific frame
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0 || !images[frameIndex]) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const img = images[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    // Set internal canvas resolution to match the image resolution
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Initial draw when first image loads or canvas resizes
  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new ResizeObserver(() => {
      if (imagesLoaded && images.length > 0) {
        const latest = progress.get();
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.floor(latest * FRAME_COUNT))
        );
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    });

    observer.observe(canvasRef.current);

    // Also trigger an immediate draw just in case
    if (imagesLoaded && images.length > 0) {
      drawFrame(0);
    }

    return () => observer.disconnect();
  }, [imagesLoaded, images, progress]);

  // Update canvas on scroll progress change
  useMotionValueEvent(progress, "change", (latest) => {
    if (!imagesLoaded) return;
    
    // Calculate which frame to show based on scroll progress (0 to 1)
    // frameIndex is 0-indexed (0 to 239)
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(latest * FRAME_COUNT))
    );

    requestAnimationFrame(() => drawFrame(frameIndex));
  });

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
    />
  );
}
