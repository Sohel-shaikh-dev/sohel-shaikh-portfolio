'use client'

import { useState } from 'react'
import { addExperience, updateExperience } from '@/app/(admin)/admin/(dashboard)/experiences/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'
import { FileUpload } from './FileUpload'
import { DynamicListBuilder } from './DynamicListBuilder'
import { ExperienceFormData } from '@/types'

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
  
  const [formData, setFormData] = useState<ExperienceFormData>({
    job_title: initialData?.job_title || '',
    company_name: initialData?.company_name || '',
    company_logo_path: initialData?.company_logo_path || null,
    experience_type: initialData?.experience_type || 'Personal Project',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    is_current: initialData?.is_current || false,
    bullet_points: initialData?.bullet_points || [],
    display_order: initialData?.display_order || 0,
    is_active: initialData?.is_active ?? true
  })

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Strict Validation
    if (!formData.company_name.trim()) return showAlert('Validation Error', 'Company Name is required', 'error')
    if (!formData.job_title.trim()) return showAlert('Validation Error', 'Job Title (Role) is required', 'error')
    if (!formData.experience_type) return showAlert('Validation Error', 'Experience Type is required', 'error')
    if (!formData.start_date) return showAlert('Validation Error', 'Start Date is required', 'error')
    if (!formData.is_current && !formData.end_date) return showAlert('Validation Error', 'End Date is required if not currently working here', 'error')
    if (formData.bullet_points.length === 0) return showAlert('Validation Error', 'At least one bullet point is required', 'error')
    
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
      router.push('/admin/experiences')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      showAlert('Error', err.message || 'Failed to save experience', 'error')
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
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            {isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
          </h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Update your professional timeline</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-400 uppercase">Active Status</label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            className={`w-12 h-6 rounded-full transition-colors relative neumorphic-inner ${formData.is_active ? 'bg-primary/20' : 'bg-background'}`}
          >
            <motion.div 
              className={`w-4 h-4 rounded-full absolute top-1 transition-colors ${formData.is_active ? 'bg-primary left-7 shadow-[0_0_10px_#ff014f]' : 'bg-gray-500 left-1'}`}
              layout
            />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Job Title (Role)</label>
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
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Company Name</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Experience Type</label>
          <ParticleWrapper>
            <select
              value={formData.experience_type}
              onChange={e => setFormData({...formData, experience_type: e.target.value as any})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-gray-300 appearance-none"
            >
              <option value="Personal Project">Personal Project</option>
              <option value="Virtual Experience">Virtual Experience</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Full-Time">Full-Time</option>
            </select>
          </ParticleWrapper>
        </div>
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Display Order</label>
          <ParticleWrapper>
            <input 
              type="number"
              required 
              value={formData.display_order} 
              onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </ParticleWrapper>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Start Date</label>
          <ParticleWrapper>
            <input 
              type="date"
              required 
              value={formData.start_date} 
              onChange={e => setFormData({...formData, start_date: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm color-scheme-dark" 
            />
          </ParticleWrapper>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 ml-2">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">End Date</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_current}
                onChange={e => setFormData({...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date})}
                className="accent-primary"
              />
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Current</span>
            </label>
          </div>
          <ParticleWrapper>
            <input 
              type="date"
              disabled={formData.is_current}
              required={!formData.is_current}
              value={formData.end_date || ''} 
              onChange={e => setFormData({...formData, end_date: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm disabled:opacity-30 color-scheme-dark" 
            />
          </ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Company Logo</label>
        
        {formData.company_logo_path && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 ml-2">Current Logo:</p>
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative p-2">
              <img 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${formData.company_logo_path}`} 
                alt="Current Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        <FileUpload
          bucket="portfolio-media"
          folder="experiences/logos"
          label="Upload Company Logo"
          onUploadComplete={(path) => setFormData({ ...formData, company_logo_path: path })}
        />
      </div>

      <div className="bg-background/50 p-6 rounded-2xl border border-white/5">
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Experience Highlights (Bullet Points)</label>
        <DynamicListBuilder 
          itemKey="point"
          items={formData.bullet_points.map(b => ({ point: b }))} 
          onChange={(newItems) => setFormData({ ...formData, bullet_points: newItems.map(item => item.point) })} 
          placeholder="Add a concise bullet point describing your experience"
        />
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
            router.push('/admin/experiences')
          }
        }}
      />
    </motion.form>
  )
}
