'use client'

import { useState } from 'react'
import { addExperience, updateExperience } from '@/app/(admin)/admin/experiences/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'

export function ExperienceForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })

  const showAlert = (title: string, message: string, type: 'success'|'error') => {
    setAlertInfo({ isOpen: true, title, message, type })
  }
  const isEditing = !!initialData
  
  const [formData, setFormData] = useState({
    job_title: initialData?.job_title || '',
    company_name: initialData?.company_name || '',
    date_range: initialData?.date_range || '',
    description: initialData?.description || ''
  })

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    setShowConfirm(false)
    setLoading(true)
    try {
      if (isEditing) {
        await updateExperience(initialData.id, formData)
        showAlert('Success', 'Experience updated successfully!', 'success')
      } else {
        await addExperience(formData)
        showAlert('Success', 'Experience added successfully!', 'success')
      }
      router.push('/admin/experience')
      router.refresh()
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to save experience', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleFormSubmit} 
      className="bg-card p-6 md:p-8 rounded-[2rem] neumorphic flex flex-col gap-6"
    >
      <div className="mb-2">
        <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="w-4 h-[2px] bg-primary"></span>
          {isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Update your professional timeline</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Job Title</label>
          <ParticleWrapper>
            <input 
              required 
              value={formData.job_title} 
              onChange={e => setFormData({...formData, job_title: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </ParticleWrapper>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Company Name</label>
          <ParticleWrapper>
            <input 
              required 
              value={formData.company_name} 
              onChange={e => setFormData({...formData, company_name: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Date Range</label>
        <ParticleWrapper>
          <input 
            required 
            value={formData.date_range} 
            onChange={e => setFormData({...formData, date_range: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            placeholder="e.g. Feb 2025 - May 2025"
          />
        </ParticleWrapper>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Description</label>
        <ParticleWrapper>
          <textarea 
            required 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={5}
          />
        </ParticleWrapper>
      </div>

      <motion.button 
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading} 
        type="submit" 
        className="mt-4 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving Experience...' : (isEditing ? 'Update Experience' : 'Save Experience')}
      </motion.button>

      <ConfirmModal
        isOpen={showConfirm}
        title={isEditing ? "Apply Changes" : "Save Experience"}
        message={isEditing ? "Are you sure you want to apply these changes?" : "Are you sure you want to save this experience?"}
        confirmText={isEditing ? "Apply Changes" : "Save"}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />

      <AlertModal
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => {
          setAlertInfo({ ...alertInfo, isOpen: false })
          if (alertInfo.type === 'success') {
            router.push('/admin/experience')
          }
        }}
      />
    </motion.form>
  )
}
