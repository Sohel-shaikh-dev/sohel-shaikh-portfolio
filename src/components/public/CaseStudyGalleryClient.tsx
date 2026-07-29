'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

export function CaseStudyGalleryClient({ gallery }: { gallery: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedIndex(null);
        setZoomLevel(1);
      }
      if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => prev !== null && prev < gallery.length - 1 ? prev + 1 : prev);
        setZoomLevel(1);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, gallery.length]);

  if (!gallery || gallery.length === 0) return null;

  const getMediaUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${path}`;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setZoomLevel(1);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < gallery.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setZoomLevel(1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setZoomLevel(1);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-white/5">
      <h3 className="text-3xl font-extrabold text-white mb-10 text-center">Project Gallery</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {gallery.map((g: any, i: number) => (
          <div 
            key={i} 
            className="aspect-video rounded-3xl overflow-hidden bg-card border border-white/5 neumorphic shadow-xl group relative cursor-zoom-in"
            onClick={() => openLightbox(i)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(i);
              }
            }}
          >
            <Image 
              src={getMediaUrl(g.image_path)} 
              alt={`Gallery Image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-background/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10">
                <ZoomIn size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center flex-col"
            onClick={closeLightbox}
          >
            {/* Top Bar Controls */}
            <div 
              className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-end gap-3 z-[210] bg-gradient-to-b from-black/80 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 0.5, 1)); }}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomLevel(1); }}
                className="px-4 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold backdrop-blur-md transition-colors"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 0.5, 4)); }}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <div className="w-px h-10 bg-white/20 mx-2"></div>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Arrows */}
            {selectedIndex > 0 && (
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            
            {selectedIndex < gallery.length - 1 && (
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Draggable & Zoomable Image Area */}
            <div 
              className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                drag
                dragElastic={0.1}
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full h-full flex items-center justify-center p-4 md:p-12"
              >
                <img 
                  src={getMediaUrl(gallery[selectedIndex].image_path)} 
                  alt={`Gallery Image ${selectedIndex + 1}`} 
                  className="max-w-full max-h-full object-contain pointer-events-none rounded-xl shadow-2xl" 
                  draggable="false"
                />
              </motion.div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase font-bold pointer-events-none">
              Drag to pan • Use arrow keys to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
