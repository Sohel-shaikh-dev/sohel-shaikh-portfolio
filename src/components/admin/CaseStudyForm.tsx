'use client'

import { useState } from 'react'
import { addCaseStudy, updateCaseStudy } from '@/app/(admin)/admin/case-studies/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { FileUpload } from './FileUpload'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'

export function CaseStudyForm({ initialData }: { initialData?: any }) {
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
    subtitle: initialData?.subtitle || '',
    challenge: initialData?.challenge || '',
    solution: initialData?.solution || '',
    key_result: initialData?.key_result || '',
    tags: initialData?.tags ? (Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags) : '',
    cover_image_path: initialData?.cover_image_path || '',
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
        await updateCaseStudy(initialData.id, formData)
        showAlert('Success', 'Case Study updated successfully!', 'success')
      } else {
        await addCaseStudy(formData)
        showAlert('Success', 'Case Study added successfully!', 'success')
      }
      router.refresh()
      if (!isEditing) {
        setFormData({ title: '', subtitle: '', challenge: '', solution: '', key_result: '', tags: '', cover_image_path: '' })
      }
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to save case study', 'error')
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
          {isEditing ? 'Edit Case Study' : 'Add New Case Study'}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Create a detailed analytics walkthrough</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Title</label>
          <ParticleWrapper>
<input 
            required 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
          />
</ParticleWrapper>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Subtitle</label>
          <ParticleWrapper>
<input 
            required 
            value={formData.subtitle} 
            onChange={e => setFormData({...formData, subtitle: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
          />
</ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">The Challenge</label>
        <ParticleWrapper>
          <textarea 
            required 
            value={formData.challenge} 
            onChange={e => setFormData({...formData, challenge: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
          />
        </ParticleWrapper>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">The Solution</label>
        <ParticleWrapper>
          <textarea 
            required 
            value={formData.solution} 
            onChange={e => setFormData({...formData, solution: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
          />
        </ParticleWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Key Result</label>
        <ParticleWrapper>
<input 
          required 
          value={formData.key_result} 
          onChange={e => setFormData({...formData, key_result: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            placeholder="e.g. Increased ROI by 25%"
          />
</ParticleWrapper>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Tags (Comma Separated)</label>
        <ParticleWrapper>
<input 
          required 
          value={formData.tags} 
          onChange={e => setFormData({...formData, tags: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            placeholder="e.g. Power BI, DAX, SQL"
          />
</ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Cover Image</label>
        {formData.cover_image_path ? (
          <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
            <span className="text-sm text-gray-300 truncate">Uploaded</span>
            <span className="text-green-400 font-bold">✓</span>
          </div>
        ) : (
          <FileUpload bucket="portfolio-media" accept="image/*" onUploadComplete={(path) => setFormData({...formData, cover_image_path: path})} />
        )}
      </div>

      <motion.button 
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading} 
        type="submit" 
        className="mt-4 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving Case Study...' : (isEditing ? 'Update Case Study' : 'Save Case Study')}
      </motion.button>

      <ConfirmModal
        isOpen={showConfirm}
        title={isEditing ? "Apply Changes" : "Save Case Study"}
        message={isEditing ? "Are you sure you want to apply these changes?" : "Are you sure you want to save this case study?"}
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
            router.push('/admin/case-studies')
          }
        }}
      />
    </motion.form>
  )
}
