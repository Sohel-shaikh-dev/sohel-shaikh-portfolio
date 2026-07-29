'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Search } from 'lucide-react'
import { PLATFORMS, AVAILABLE_ICONS, SocialIcon } from '@/components/SocialIconMap'

export function SharedSocialLinkForm({ 
  initialData, 
  onClose,
  addAction,
  updateAction
}: { 
  initialData?: any, 
  onClose: () => void,
  addAction: (data: any) => Promise<any>,
  updateAction: (id: string, data: any) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // States
  const [selectedPlatform, setSelectedPlatform] = useState(
    initialData ? (initialData.platform_key === 'custom' ? 'custom' : initialData.platform_key) : ''
  )
  const [platformName, setPlatformName] = useState(initialData?.platform_name || '')
  const [platformKey, setPlatformKey] = useState(initialData?.platform_key || '')
  const [iconName, setIconName] = useState(initialData?.icon_name || '')
  const [url, setUrl] = useState(initialData?.url || '')
  
  const [iconSearch, setIconSearch] = useState('')

  const handlePlatformSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedPlatform(val)
    if (val === 'custom') {
      setPlatformName('')
      setPlatformKey('custom')
      setIconName('FaGlobe') // Default
    } else if (val) {
      const plat = PLATFORMS.find(p => p.key === val)
      if (plat) {
        setPlatformName(plat.name)
        setPlatformKey(plat.key)
        setIconName(plat.iconName)
      }
    } else {
      setPlatformName('')
      setPlatformKey('')
      setIconName('')
    }
  }

  const validateUrl = (url: string, key: string) => {
    if (!url) return 'URL is required'
    try {
      if (key === 'email' && !url.includes('@')) {
        return 'Please enter a valid email address'
      }
      if (key !== 'email') {
        new URL(url) // Will throw if invalid
      }
    } catch {
      return 'Please enter a valid URL (e.g. https://...)'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!selectedPlatform) {
      setError('Please select a platform')
      return
    }

    const trimmedUrl = url.trim()
    const validationError = validateUrl(trimmedUrl, platformKey)
    if (validationError) {
      setError(validationError)
      return
    }

    if (selectedPlatform === 'custom' && !platformName.trim()) {
      setError('Custom platform name is required')
      return
    }

    try {
      setLoading(true)
      const payload = {
        platform_name: platformName,
        platform_key: platformKey,
        icon_name: iconName,
        url: trimmedUrl
      }
      
      if (initialData?.id) {
        await updateAction(initialData.id, payload)
      } else {
        await addAction(payload)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredIcons = AVAILABLE_ICONS.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()))

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-xl bg-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">
            {initialData ? 'Edit Social Link' : 'Add Social Link'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Platform</label>
              <select 
                value={selectedPlatform}
                onChange={handlePlatformSelect}
                className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 focus:border-primary/50 outline-none transition-all text-sm appearance-none"
              >
                <option value="">Select Platform</option>
                {PLATFORMS.map(p => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
                <option value="custom">Custom Platform</option>
              </select>
            </div>

            {selectedPlatform === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 overflow-hidden"
              >
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Custom Platform Name</label>
                  <input 
                    type="text"
                    value={platformName}
                    onChange={e => setPlatformName(e.target.value)}
                    placeholder="e.g. My Awesome Blog"
                    className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 focus:border-primary/50 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Choose Icon</label>
                  <div className="bg-background rounded-2xl border border-white/5 p-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="text"
                        placeholder="Search icons..."
                        value={iconSearch}
                        onChange={e => setIconSearch(e.target.value)}
                        className="w-full rounded-xl pl-10 pr-4 py-2 bg-card border border-white/5 focus:border-primary/50 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {filteredIcons.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setIconName(icon)}
                          title={icon}
                          className={`p-2 rounded-xl flex items-center justify-center transition-all ${iconName === icon ? 'bg-primary text-white shadow-lg scale-110' : 'bg-card text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          <SocialIcon iconName={icon} size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">
                {platformKey === 'email' ? 'Email Address' : 'URL'}
              </label>
              <div className="relative">
                {iconName && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <SocialIcon iconName={iconName} size={18} />
                  </div>
                )}
                <input 
                  type={platformKey === 'email' ? 'email' : 'text'}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={platformKey === 'email' ? 'hello@example.com' : 'https://...'}
                  className={`w-full rounded-2xl py-3 pr-5 bg-background border border-white/5 focus:border-primary/50 outline-none transition-all text-sm ${iconName ? 'pl-12' : 'pl-5'}`}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(255,1,79,0.3)] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Social Link'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
