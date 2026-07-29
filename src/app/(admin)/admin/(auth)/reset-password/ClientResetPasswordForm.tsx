'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Check, X, CheckCircle2 } from 'lucide-react'

export function ClientResetPasswordForm({ 
  updatePasswordAction 
}: { 
  updatePasswordAction: (password: string) => Promise<{ success: boolean; message: string }>
}) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Validation states
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const isValidPassword = Object.values(reqs).every(Boolean)
  const passwordsMatch = password !== '' && password === confirmPassword
  const canSubmit = isValidPassword && passwordsMatch

  // Calculate strength (0 to 5)
  const strengthScore = Object.values(reqs).filter(Boolean).length

  // Strength colors and labels
  const getStrengthData = () => {
    if (strengthScore === 0) return { width: '0%', color: 'bg-gray-700', label: '' }
    if (strengthScore <= 2) return { width: `${(strengthScore/5)*100}%`, color: 'bg-red-500', label: 'Weak' }
    if (strengthScore <= 4) return { width: `${(strengthScore/5)*100}%`, color: 'bg-yellow-500', label: 'Good' }
    return { width: '100%', color: 'bg-green-500', label: 'Strong' }
  }

  const strengthData = getStrengthData()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setResult(null)
    
    try {
      const res = await updatePasswordAction(password)
      setResult(res)
      if (res.success) {
        setTimeout(() => {
          router.push('/admin/login')
        }, 3000)
      }
    } catch (err: any) {
      setResult({ success: false, message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const RequirementItem = ({ fulfilled, text }: { fulfilled: boolean, text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {fulfilled ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <X size={14} className="text-gray-600" />
      )}
      <span className={fulfilled ? "text-gray-300" : "text-gray-500"}>{text}</span>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md bg-card p-8 sm:p-12 rounded-[2rem] neumorphic border border-white/5 relative"
    >
      <div className="flex flex-col gap-2 text-white">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-background rounded-2xl mx-auto mb-6 flex items-center justify-center neumorphic-inner border border-white/5"
        >
           <Lock className="text-primary" size={28} />
        </motion.div>
        
        <h2 className="text-3xl font-extrabold mb-2 text-center tracking-tight">Set New Password</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Please enter your new password below to regain access.</p>
        
        <AnimatePresence mode="wait">
          {result?.success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              >
                <CheckCircle2 className="text-primary mb-4" size={56} />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
              <p className="text-gray-400 text-sm">Your password has been changed successfully.</p>
              <p className="text-gray-500 text-xs mt-6 uppercase tracking-widest font-bold animate-pulse">
                Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="flex flex-col gap-2"
            >
              {/* New Password Input */}
              <div className="mb-4 relative">
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm pr-12 disabled:opacity-50"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              <div className="mb-6 px-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Password Strength</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${strengthScore === 5 ? 'text-green-500' : 'text-gray-400'}`}>
                    {strengthData.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-300 ${strengthData.color}`}
                    style={{ width: strengthData.width }}
                  ></div>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-background p-4 rounded-xl border border-white/5 neumorphic-inner">
                <RequirementItem fulfilled={reqs.length} text="Min 8 characters" />
                <RequirementItem fulfilled={reqs.uppercase} text="One uppercase" />
                <RequirementItem fulfilled={reqs.lowercase} text="One lowercase" />
                <RequirementItem fulfilled={reqs.number} text="One number" />
                <RequirementItem fulfilled={reqs.special} text="One special char" />
              </div>

              {/* Confirm Password Input */}
              <div className="mb-8 relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">
                    Confirm Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider mr-2 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordsMatch ? 'Matches' : "Doesn't Match"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    className={`w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner outline-none transition-all text-sm pr-12 disabled:opacity-50 ${confirmPassword.length > 0 && !passwordsMatch ? 'focus:border-red-500 border-red-500/50' : 'focus:border-primary/50'}`}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button 
                whileHover={!loading && canSubmit ? { y: -2 } : {}}
                whileTap={!loading && canSubmit ? { scale: 0.98 } : {}}
                disabled={loading || !canSubmit}
                type="submit"
                className="bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
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
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
