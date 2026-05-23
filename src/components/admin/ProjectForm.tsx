'use client'

import { useState } from 'react'
import { addProject, updateProject } from '@/app/(admin)/admin/projects/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { FileUpload } from './FileUpload'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'

export function ProjectForm({ initialData }: { initialData?: any }) {
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
    category: initialData?.category || '',
    description: initialData?.description || '',
    thumbnail_path: initialData?.thumbnail_path || '',
    pbix_file_path: initialData?.pbix_file_path || '',
    pdf_export_path: initialData?.pdf_export_path || '',
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
        await updateProject(initialData.id, formData)
        showAlert('Success', 'Project updated successfully!', 'success')
      } else {
        await addProject(formData)
        showAlert('Success', 'Project added successfully!', 'success')
      }
      router.push('/admin/projects')
      router.refresh()
    } catch (err) {
      console.error(err)
      showAlert('Error', 'Failed to save project', 'error')
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
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Create a new portfolio item</p>
      </div>
      
      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Project Title</label>
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
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Category</label>
        <ParticleWrapper>
<input 
          required 
          value={formData.category} 
          onChange={e => setFormData({...formData, category: e.target.value})}
          className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
          placeholder="e.g. Power BI"
        />
</ParticleWrapper>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Description</label>
        <ParticleWrapper>
          <textarea 
            required 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={4}
          />
        </ParticleWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Thumbnail Image</label>
          {formData.thumbnail_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">Uploaded</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          ) : (
            <FileUpload bucket="portfolio-media" accept="image/*" onUploadComplete={(path) => setFormData({...formData, thumbnail_path: path})} />
          )}
        </div>
        
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Power BI (.pbix)</label>
          {formData.pbix_file_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">Uploaded</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          ) : (
             <FileUpload bucket="powerbi-files" accept=".pbix" onUploadComplete={(path) => setFormData({...formData, pbix_file_path: path})} />
          )}
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">PDF Report (.pdf)</label>
          {formData.pdf_export_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">Uploaded</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          ) : (
             <FileUpload bucket="documents" accept="application/pdf" onUploadComplete={(path) => setFormData({...formData, pdf_export_path: path})} />
          )}
        </div>
      </div>

      <motion.button 
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading} 
        type="submit" 
        className="mt-4 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving Project...' : (isEditing ? 'Update Project' : 'Save Project')}
      </motion.button>

      <ConfirmModal
        isOpen={showConfirm}
        title={isEditing ? "Apply Changes" : "Save Project"}
        message={isEditing ? "Are you sure you want to apply these changes to the project?" : "Are you sure you want to save this new project?"}
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
            router.push('/admin/projects')
          }
        }}
      />
    </motion.form>
  )
}
