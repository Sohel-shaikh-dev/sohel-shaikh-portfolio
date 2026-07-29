'use client'

import { useState, useEffect } from 'react'
import { addProject, updateProject } from '@/app/(admin)/admin/(dashboard)/projects/actions'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { FileUpload } from './FileUpload'
import { MultiFileUpload } from './MultiFileUpload'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'
import { DynamicListBuilder } from './DynamicListBuilder'
import { DynamicKeyValueBuilder } from './DynamicKeyValueBuilder'
import { Lock, Unlock } from 'lucide-react'
import { generateSlug } from '@/lib/slug'

export function ProjectForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })
  const [isSlugLocked, setIsSlugLocked] = useState(true)

  const showAlert = (title: string, message: string, type: 'success'|'error') => {
    setAlertInfo({ isOpen: true, title, message, type })
  }
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || '',
    description: initialData?.description || '', // Used as short overview
    business_problem: initialData?.business_problem || '',
    solution: initialData?.solution || '',
    github_link: initialData?.github_link || '',
    live_url: initialData?.live_url || '',
    status: initialData?.status || 'published',
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    
    // Legacy Files
    thumbnail_path: initialData?.thumbnail_path || '',
    pbix_file_path: initialData?.pbix_file_path || '',
    pdf_export_path: initialData?.pdf_export_path || '',
    
    // Relational Arrays
    project_gallery: initialData?.project_gallery || [],
    project_statistics: initialData?.project_statistics || [],
    project_insights: initialData?.project_insights || [],
    project_technologies: initialData?.project_technologies || [],
  })

  // Auto-generate slug when title changes (only if not editing and unlocked, or if slug is empty)
  useEffect(() => {
    if ((!isEditing && isSlugLocked) || !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, isEditing, isSlugLocked])

  const handlePreview = async () => {
    setLoading(true);
    try {
      const finalData = { ...formData, status: 'draft', is_active: false };
      setFormData(finalData); // update UI
      let savedSlug = finalData.slug;
      
      if (isEditing) {
        const res = await updateProject(initialData.id, finalData);
        if (res?.slug) savedSlug = res.slug;
      } else {
        const res = await addProject(finalData);
        if (res?.slug) savedSlug = res.slug;
      }
      
      // Ensure we navigate to the exact slug returned by the backend with the preview flag
      window.open(`/projects/${savedSlug}?preview=true`, '_blank');
      
      if (!isEditing) {
        window.location.reload();
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to preview', 'error');
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err: any) {
      console.error(err)
      showAlert('Error', err.message || 'Failed to save project', 'error')
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
      className="bg-card p-6 md:p-8 rounded-[2rem] neumorphic flex flex-col gap-8"
    >
      <div className="mb-2 flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Create a new portfolio item</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_active} 
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              className="accent-primary w-4 h-4"
            />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active</span>
          </label>
        </div>
      </div>
      
      {/* Basic Info */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Basic Info</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Project Title *</label>
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
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 ml-2">
              Slug *
              <button type="button" onClick={() => setIsSlugLocked(!isSlugLocked)} className="text-gray-500 hover:text-primary transition-colors">
                {isSlugLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
            </label>
            <ParticleWrapper>
              <input 
                required
                value={formData.slug} 
                onChange={(e: any) => setFormData({...formData, slug: e.target.value})}
                readOnly={isSlugLocked}
                className={`w-full rounded-2xl px-5 py-3 border border-white/5 outline-none transition-all text-sm ${isSlugLocked ? 'bg-background/50 text-gray-500 cursor-not-allowed' : 'bg-background neumorphic-inner focus:border-primary/50'}`}
              />
            </ParticleWrapper>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Category *</label>
            <input 
              required 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
              placeholder="e.g. Power BI"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Status</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm text-white" 
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Content</h4>
        
        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Short Overview *</label>
          <textarea 
            required 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Business Problem</label>
          <textarea 
            value={formData.business_problem} 
            onChange={e => setFormData({...formData, business_problem: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Solution</label>
          <textarea 
            value={formData.solution} 
            onChange={e => setFormData({...formData, solution: e.target.value})}
            className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            rows={3}
          />
        </div>
      </div>

      {/* Relational Data */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Dynamic Data</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Technologies Used</label>
            <DynamicListBuilder 
              items={formData.project_technologies}
              onChange={val => setFormData({...formData, project_technologies: val})}
              itemKey="technology"
              placeholder="e.g. Power BI, DAX, SQL"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Key Insights</label>
            <DynamicListBuilder 
              items={formData.project_insights}
              onChange={val => setFormData({...formData, project_insights: val})}
              itemKey="insight"
              placeholder="e.g. Increased retention by 15%"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2 mt-4">Statistics</label>
          <DynamicKeyValueBuilder 
            items={formData.project_statistics}
            onChange={val => setFormData({...formData, project_statistics: val})}
          />
        </div>
      </div>

      {/* Media & Links */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Media & Links</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">GitHub URL</label>
            <input 
              value={formData.github_link} 
              onChange={e => setFormData({...formData, github_link: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Live Demo URL</label>
            <input 
              value={formData.live_url} 
              onChange={e => setFormData({...formData, live_url: e.target.value})}
              className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Hero Cover Image *</label>
          {formData.thumbnail_path ? (
            <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
              <span className="text-sm text-gray-300 truncate">{formData.thumbnail_path}</span>
              <div className="flex items-center gap-4">
                <span className="text-green-400 font-bold">✓</span>
                <button type="button" onClick={() => setFormData({...formData, thumbnail_path: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline">Remove</button>
              </div>
            </div>
          ) : (
            <FileUpload 
              bucket="portfolio-media" 
              folder={formData.slug ? `project-images/${formData.slug}` : ''} 
              accept="image/*" 
              label="Upload Cover Image"
              fileType="image"
              onUploadComplete={(path) => setFormData({...formData, thumbnail_path: path})} 
            />
          )}
          {!formData.slug && <p className="text-yellow-500 text-xs mt-2 ml-2">Please set a title/slug first before uploading.</p>}
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Screenshot Gallery</label>
          <MultiFileUpload 
            bucket="portfolio-media" 
            folder={formData.slug ? `project-images/${formData.slug}` : ''} 
            accept="image/*" 
            items={formData.project_gallery}
            onChange={(items) => setFormData({...formData, project_gallery: items})} 
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading} 
          type="button" 
          onClick={handlePreview}
          className="w-1/3 bg-background border border-white/5 rounded-2xl px-5 py-4 text-gray-300 font-bold transition-all hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '...' : 'Preview'}
        </motion.button>
        
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading} 
          type="submit" 
          className="w-2/3 bg-primary rounded-2xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,1,79,0.3)] hover:shadow-[0_0_30px_rgba(255,1,79,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Project' : 'Save Project')}
        </motion.button>
      </div>

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
