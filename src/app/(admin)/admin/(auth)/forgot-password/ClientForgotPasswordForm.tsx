'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export function ClientForgotPasswordForm({ 
  requestResetAction 
}: { 
  requestResetAction: (email: string, origin: string) => Promise<{ success: boolean; message: string }>
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    try {
      const res = await requestResetAction(email, window.location.origin)
      setResult(res)
    } catch (err: any) {
      setResult({ success: false, message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md bg-card p-8 sm:p-12 rounded-[2rem] neumorphic border border-white/5 relative"
    >
      <Link href="/admin/login" className="absolute top-8 left-8 text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft size={20} />
      </Link>

      <div className="flex flex-col gap-2 text-white mt-4">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-background rounded-2xl mx-auto mb-6 flex items-center justify-center neumorphic-inner border border-white/5"
        >
           <Mail className="text-primary" size={28} />
        </motion.div>
        
        <h2 className="text-3xl font-extrabold mb-2 text-center tracking-tight">Reset Password</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Enter your email address and we'll send you a link to reset your password.</p>
        
        {result?.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center"
          >
            <CheckCircle2 className="text-primary mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
            <p className="text-gray-400 text-sm">{result.message}</p>
            <Link href="/admin/login" className="mt-6 text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors">
              Return to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="mb-8">
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm disabled:opacity-50"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aimetaworldd@gmail.com"
                required
                disabled={loading}
              />
            </div>

            <motion.button 
              whileHover={!loading ? { y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              type="submit"
              className="bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>

            {result && !result.success && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-red-500/10 text-red-400 text-center rounded-2xl border border-red-500/20 text-xs font-bold"
              >
                {result.message}
              </motion.p>
            )}
          </form>
        )}
      </div>
    </motion.div>
  )
}
