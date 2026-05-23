'use client'

import { useState } from 'react'
import { addCertification, updateCertification } from '@/app/(admin)/admin/certifications/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'

export function CertificationForm({ initialData }: { initialData?: any }) {
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
    title: initialData?.title || '',
    issuing_platform: initialData?.issuing_platform || '',
    date_earned: initialData?.date_earned || '',
    description: initialData?.description || '',
    credential_url: initialData?.credential_url || '',
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
        await updateCertification(initialData.id, formData)
        showAlert('Success', 'Certification updated successfully!', 'success')
      } else {
        await addCertification(formData)
        showAlert('Success', 'Certification added successfully!', 'success')
      }
      router.push('/admin/certifications')
      router.refresh()
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to save certification', 'error')
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
          {isEditing ? 'Edit Certification' : 'Add New Certification'}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Add your latest credentials</p>
      </div>
      
      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Certification Title</label>
        <ParticleWrapper>
<input 
          required 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})}
          className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
        />
</ParticleWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Issuing Platform</label>
          <ParticleWrapper>
            <input 
              required 
              value={formData.issuing_platform} 
              onChange={e => setFormData({...formData, issuing_platform: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </ParticleWrapper>
        </div>
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Date Earned</label>
          <ParticleWrapper>
            <input 
              required 
              value={formData.date_earned} 
              onChange={e => setFormData({...formData, date_earned: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
              placeholder="e.g. 2024-01-01"
            />
          </ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Credential URL</label>
        <ParticleWrapper>
<input 
          value={formData.credential_url} 
          onChange={e => setFormData({...formData, credential_url: e.target.value})}
          className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
          placeholder="https://"
        />
</ParticleWrapper>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Description</label>
        <ParticleWrapper>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
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
        {loading ? 'Saving Certification...' : (isEditing ? 'Update Certification' : 'Save Certification')}
      </motion.button>

      <ConfirmModal
        isOpen={showConfirm}
        title={isEditing ? "Apply Changes" : "Save Certification"}
        message={isEditing ? "Are you sure you want to apply these changes?" : "Are you sure you want to save this certification?"}
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
            router.push('/admin/certifications')
          }
        }}
      />
    </motion.form>
  )
}
