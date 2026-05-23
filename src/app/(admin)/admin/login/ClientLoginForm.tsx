'use client'

import { motion } from 'motion/react'
import { useActionState } from 'react'

export function ClientLoginForm({ 
  loginAction, 
  errorMessage 
}: { 
  loginAction: (formData: FormData) => void,
  errorMessage?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md bg-card p-8 sm:p-12 rounded-[2rem] neumorphic border border-white/5"
    >
      <form action={loginAction} className="flex flex-col gap-2 text-white">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-background rounded-2xl mx-auto mb-6 flex items-center justify-center neumorphic-inner border border-white/5"
        >
           <span className="text-primary font-bold text-4xl">S</span>
        </motion.div>
        
        <h2 className="text-3xl font-extrabold mb-8 text-center tracking-tight">Admin<span className="text-primary">.dev</span></h2>
        
        <div className="mb-4">
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2" htmlFor="email">
            Email Address
          </label>
          <input
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm"
            name="email"
            placeholder="admin@example.com"
            required
          />
        </div>
        
        <div className="mb-8">
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>

        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)]"
        >
          Access Portal
        </motion.button>

        {errorMessage && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-primary/10 text-primary text-center rounded-2xl border border-primary/20 text-xs font-bold"
          >
            {errorMessage}
          </motion.p>
        )}
      </form>
    </motion.div>
  )
}
