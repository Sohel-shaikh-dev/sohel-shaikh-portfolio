'use client'

import { useState } from 'react'
import { addCertification, updateCertification } from '@/app/(admin)/admin/(dashboard)/certifications/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'
import { FileUpload } from './FileUpload'
import { DynamicListBuilder } from './DynamicListBuilder'

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

  // Helper to format date for the native input
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    issuing_platform: initialData?.issuing_platform || '',
    date_earned: formatDateForInput(initialData?.date_earned) || '',
    description: initialData?.description || '',
    credential_url: initialData?.credential_url || '',
    credential_id: initialData?.credential_id || '',
    thumbnail_path: initialData?.thumbnail_path || '',
    organization_logo_path: initialData?.organization_logo_path || '',
    pdf_file_path: initialData?.pdf_file_path || '',
    skills_learned: initialData?.skills_learned || [],
  })

  console.log('[RENDER CertificationForm] isEditing:', isEditing, 'initialData id:', initialData?.id);
  console.log('[STATE formData.date_earned]:', formData.date_earned);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Quick validation before confirming
    if (formData.credential_url && !formData.credential_url.startsWith('http')) {
      showAlert('Validation Error', 'Credential URL must be a valid HTTP link.', 'error')
      return
    }

    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    // 1. User clicks save. Close confirmation modal immediately.
    setShowConfirm(false)
    setLoading(true)
    
    // 2. Wait for its exit animation to completely finish (300-400ms) 
    // so there are never two modals in the DOM at the same time.
    await new Promise(resolve => setTimeout(resolve, 400))

    try {
      if (isEditing) {
        await updateCertification(initialData.id, formData)
        showAlert('Success', 'Certification updated successfully!', 'success')
      } else {
        await addCertification(formData)
        showAlert('Success', 'Certification added successfully!', 'success')
      }
      
      // We don't automatically push in finally because we want the user to see the success toast first.
      // The toast onClose handler will execute the router push.
    } catch (err: any) {
      console.error(err)
      showAlert('Error', err.message || 'Failed to save certification', 'error')
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
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-2">Certification Title *</label>
        <ParticleWrapper>
          <input 
            required 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
            placeholder="e.g. AWS Certified Solutions Architect"
          />
        </ParticleWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-2">Issuing Platform *</label>
          <ParticleWrapper>
            <input 
              required 
              value={formData.issuing_platform} 
              onChange={e => setFormData({...formData, issuing_platform: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
              placeholder="e.g. Amazon Web Services"
            />
          </ParticleWrapper>
        </div>
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-2">Date Earned *</label>
          <input 
            required 
            type="date"
            defaultValue={formData.date_earned} 
            onChange={e => {
              setFormData({...formData, date_earned: e.target.value});
            }}
            className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Credential URL</label>
          <ParticleWrapper>
            <input 
              type="url"
              value={formData.credential_url} 
              onChange={e => setFormData({...formData, credential_url: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
              placeholder="https://"
            />
          </ParticleWrapper>
        </div>
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Credential ID</label>
          <ParticleWrapper>
            <input 
              value={formData.credential_id} 
              onChange={e => setFormData({...formData, credential_id: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
              placeholder="e.g. ABC123XYZ"
            />
          </ParticleWrapper>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Description</label>
        <ParticleWrapper>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
            rows={3}
          />
        </ParticleWrapper>
      </div>

      <div>
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Skills Learned</label>
        <DynamicListBuilder 
          items={formData.skills_learned.map((s: string) => ({ skill: s }))}
          onChange={val => setFormData({...formData, skills_learned: val.map((v: any) => v.skill)})}
          itemKey="skill"
          placeholder="e.g. Cloud Computing, Python, Data Analysis"
        />
      </div>

      {/* Media Uploads */}
      <div className="space-y-6 mt-4 border-t border-white/5 pt-6">
        <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Media Files</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Logo */}
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Organization Logo</label>
            {formData.organization_logo_path ? (
              <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2" title={formData.organization_logo_path}>{formData.organization_logo_path}</span>
                <button type="button" onClick={() => setFormData({...formData, organization_logo_path: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline whitespace-nowrap">Remove</button>
              </div>
            ) : (
              <FileUpload 
                bucket="portfolio-media" 
                folder="certificates/logos" 
                accept="image/*" 
                label="Upload Organization Logo"
                fileType="image"
                maxSizeMB={1}
                onUploadComplete={(path) => setFormData({...formData, organization_logo_path: path})} 
              />
            )}
          </div>
          
          {/* Certificate Thumbnail */}
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Certificate Thumbnail</label>
            {formData.thumbnail_path ? (
              <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2" title={formData.thumbnail_path}>{formData.thumbnail_path}</span>
                <button type="button" onClick={() => setFormData({...formData, thumbnail_path: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline whitespace-nowrap">Remove</button>
              </div>
            ) : (
              <FileUpload 
                bucket="portfolio-media" 
                folder="certificates/thumbnails" 
                accept="image/*" 
                label="Upload Certificate Thumbnail"
                fileType="image"
                maxSizeMB={2}
                onUploadComplete={(path) => setFormData({...formData, thumbnail_path: path})} 
              />
            )}
          </div>
        </div>

        {/* Certificate PDF */}
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Downloadable PDF</label>
          {formData.pdf_file_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate mr-2" title={formData.pdf_file_path}>{formData.pdf_file_path}</span>
              <button type="button" onClick={() => setFormData({...formData, pdf_file_path: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline whitespace-nowrap">Remove</button>
            </div>
          ) : (
            <FileUpload 
              bucket="portfolio-media" 
              folder="certificates/pdfs" 
              accept="application/pdf" 
              label="Upload Downloadable PDF"
              fileType="document"
              maxSizeMB={5}
              onUploadComplete={(path) => setFormData({...formData, pdf_file_path: path})} 
            />
          )}
        </div>
      </div>

      <motion.button 
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading} 
        type="submit" 
        className="mt-6 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
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
        autoCloseDelay={2000}
        onClose={() => {
          setAlertInfo({ ...alertInfo, isOpen: false })
          if (alertInfo.type === 'success') {
            router.push('/admin/certifications')
            router.refresh()
          }
        }}
      />
    </motion.form>
  )
}
