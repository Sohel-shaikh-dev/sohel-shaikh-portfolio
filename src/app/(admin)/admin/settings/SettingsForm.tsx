'use client'

import { useState, useEffect } from 'react'
import { updateSiteSettings, seedDemoData } from './actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from '@/components/admin/ParticleWrapper'
import { FileUpload } from '@/components/admin/FileUpload'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { AlertModal } from '@/components/admin/AlertModal'

export function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })

  const showAlert = (title: string, message: string, type: 'success'|'error') => {
    setAlertInfo({ isOpen: true, title, message, type })
  }
  
  const [formData, setFormData] = useState({
    stats_projects_done: initialData?.stats_projects_done || '80+',
    stats_happy_clients: initialData?.stats_happy_clients || '50+',
    stats_success_rate: initialData?.stats_success_rate || '98%',
    cv_pdf_path: initialData?.cv_pdf_path || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateSiteSettings(formData)
      showAlert('Success', 'Settings updated successfully!', 'success')
      router.refresh()
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to update settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleSeedClick() {
    setShowConfirm(true)
  }

  async function handleConfirmSeed() {
    setShowConfirm(false)
    setSeeding(true)
    try {
      await seedDemoData()
      showAlert('Success', 'Demo data seeded successfully!', 'success')
      router.refresh()
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to seed demo data', 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit} 
        className="bg-card p-6 md:p-8 rounded-[2rem] neumorphic flex flex-col gap-6"
      >
        <div className="mb-2">
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            Site Settings
          </h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Manage Global Portfolio Content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Projects Done</label>
            <ParticleWrapper>
              <input 
                required 
                value={formData.stats_projects_done} 
                onChange={e => setFormData({...formData, stats_projects_done: e.target.value})}
                className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
              />
            </ParticleWrapper>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Happy Clients</label>
            <ParticleWrapper>
              <input 
                required 
                value={formData.stats_happy_clients} 
                onChange={e => setFormData({...formData, stats_happy_clients: e.target.value})}
                className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
              />
            </ParticleWrapper>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Success Rate</label>
            <ParticleWrapper>
              <input 
                required 
                value={formData.stats_success_rate} 
                onChange={e => setFormData({...formData, stats_success_rate: e.target.value})}
                className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
              />
            </ParticleWrapper>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Resume / CV (.pdf)</label>
          {formData.cv_pdf_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">Uploaded: {formData.cv_pdf_path}</span>
              <div className="flex items-center gap-4">
                <span className="text-green-400 font-bold">✓</span>
                <button type="button" onClick={() => setFormData({...formData, cv_pdf_path: ''})} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase">Change</button>
              </div>
            </div>
          ) : (
             <FileUpload bucket="portfolio-media" folder="documents" accept="application/pdf" onUploadComplete={(path) => setFormData({...formData, cv_pdf_path: path})} />
          )}
        </div>

        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading} 
          type="submit" 
          className="mt-4 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Settings...' : 'Save Settings'}
        </motion.button>
      </motion.form>



      <AlertModal
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
      />
    </div>
  )
}
