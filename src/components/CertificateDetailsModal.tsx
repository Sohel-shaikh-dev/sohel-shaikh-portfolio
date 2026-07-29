'use client'

import { motion, AnimatePresence } from 'motion/react'
import { X, ExternalLink, Download, Award, Calendar, CheckCircle, ZoomIn, ZoomOut, Maximize, FileText } from 'lucide-react'
import { useState, useRef } from 'react'

export function CertificateDetailsModal({ cert, onClose }: { cert: any, onClose: () => void }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!cert) return null;

  const thumbnailUrl = cert.thumbnail;
  const logoUrl = cert.logo;
  const pdfUrl = cert.pdfUrl;

  // If there's neither a thumbnail nor a logo, we should hide the entire left visual section to save space
  const hasVisuals = !!(thumbnailUrl || logoUrl);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] neumorphic relative border border-white/5 flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white/5 transition-colors border border-white/10"
          >
            <X size={20} />
          </button>

          {/* Left Side - Visuals (Conditionally Rendered) */}
          {hasVisuals && (
            <div className="w-full md:w-2/5 bg-background/50 border-r border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
              
              {thumbnailUrl && (
                <div 
                  className="relative z-10 w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-6 group cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                >
                  <img src={thumbnailUrl} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-background/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10">
                      <Maximize size={24} />
                    </div>
                  </div>
                </div>
              )}
  
              {logoUrl && (
                <div className={`relative z-10 w-24 h-24 rounded-2xl bg-white p-3 shadow-2xl border-4 border-card ${thumbnailUrl ? '-mt-16' : ''}`}>
                  <img src={logoUrl} alt={cert.platform} className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          )}

          {/* Right Side - Details */}
          <div className={`w-full p-8 md:p-10 flex flex-col ${hasVisuals ? 'md:w-3/5' : ''}`}>
            <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-widest text-primary">
              {cert.platform && (
                <span className="flex items-center gap-1"><Award size={14} /> {cert.platform}</span>
              )}
              {cert.date && (
                <>
                  {cert.platform && <span className="text-gray-600">•</span>}
                  <span className="flex items-center gap-1 text-gray-400"><Calendar size={14} /> {cert.date}</span>
                </>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
              {cert.title}
            </h2>

            {cert.desc && (
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">About the Certification</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {cert.desc}
                </p>
              </div>
            )}

            {cert.skills && cert.skills.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Skills Verified</h4>
                <div className="flex flex-wrap gap-2">
                  {cert.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-background rounded-lg text-xs text-gray-300 font-medium border border-white/5 flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-primary" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cert.credentialId && (
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Credential ID</h4>
                <p className="text-sm text-gray-300 font-mono bg-background/50 py-2 px-3 rounded border border-white/5 inline-block">{cert.credentialId}</p>
              </div>
            )}

            {(cert.credentialUrl || pdfUrl) && (
              <div className="mt-auto flex flex-wrap gap-4 pt-6 border-t border-white/5">
                {cert.credentialUrl && (
                  <a 
                    href={cert.credentialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary/90 shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] flex-1 text-sm whitespace-nowrap"
                  >
                    Verify Credential <ExternalLink size={16} />
                  </a>
                )}
                {pdfUrl && (
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-background border border-white/10 text-white rounded-xl font-bold transition-all hover:bg-white/5 flex-1 text-sm whitespace-nowrap"
                  >
                    View Certificate <FileText size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox Overlay */}
      {isLightboxOpen && thumbnailUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center flex-col"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Top Bar Controls */}
          <div 
            className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-end gap-3 z-[210] bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-4 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold backdrop-blur-md transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-10 bg-white/20 mx-2"></div>
            <button
              onClick={() => {
                setIsLightboxOpen(false);
                setZoomLevel(1);
              }}
              className="w-10 h-10 bg-primary/80 hover:bg-primary rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Draggable & Zoomable Image Area */}
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              drag
              dragConstraints={containerRef}
              dragElastic={0.1}
              animate={{ scale: zoomLevel }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full flex items-center justify-center p-4 md:p-12"
            >
              <img 
                src={thumbnailUrl} 
                alt={cert.title} 
                className="max-w-full max-h-full object-contain pointer-events-none rounded-xl shadow-2xl" 
                draggable="false"
              />
            </motion.div>
          </div>
          
          {/* Helper Text */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase font-bold pointer-events-none">
            Drag to pan • Scroll or click to zoom
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
