'use client'

import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onCancel}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />
              
              <div className="flex items-center gap-4 text-primary mb-2">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {message}
              </p>
              
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-[0_0_15px_rgba(255,1,79,0.3)] hover:shadow-[0_0_25px_rgba(255,1,79,0.5)] transition-all"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
