'use client'

import { motion } from 'motion/react'

export function AnimatedCard({ children, index = 0, className = '' }: { children: React.ReactNode, index?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`bg-card rounded-2xl neumorphic border border-white/5 transition-all hover:shadow-[0_0_20px_rgba(255,1,79,0.1)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
