'use client'

import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export function AlertModal({ 
  isOpen, 
  title, 
  message, 
  type = 'success',
  onClose 
}: AlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto flex flex-col gap-4 relative overflow-hidden text-center items-center"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${type === 'success' ? 'from-green-500 to-emerald-400' : 'from-red-500 to-rose-400'}`} />
              
              <div className={`p-4 rounded-full mb-2 ${type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
              </div>
              
              <h3 className="text-xl font-bold text-white">{title}</h3>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {message}
              </p>
              
              <button
                onClick={onClose}
                className={`w-full px-6 py-3 rounded-xl text-sm font-bold text-white transition-all ${type === 'success' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]'}`}
              >
                OK
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
