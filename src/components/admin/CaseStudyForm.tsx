'use client'

import { useState, useEffect } from 'react'
import { addCaseStudy, updateCaseStudy } from '@/app/(admin)/admin/(dashboard)/case-studies/actions'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ParticleWrapper } from './ParticleWrapper'
import { FileUpload } from './FileUpload'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'
import { Plus, X, Trash2, GripVertical, Lock, Unlock } from 'lucide-react'
import { DynamicListBuilder } from './DynamicListBuilder'
import { DynamicKeyValueBuilder } from './DynamicKeyValueBuilder'
import { MultiFileUpload } from './MultiFileUpload'
import { generateSlug } from '@/lib/slug'

const InputField = ({ label, value, onChange, required = false, type = 'text', placeholder = '' }: any) => (
  <div>
    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">{label} {required && '*'}</label>
    <ParticleWrapper>
      <input 
        type={type}
        required={required}
        value={value} 
        onChange={onChange}
        className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
        placeholder={placeholder}
      />
    </ParticleWrapper>
  </div>
)

const TextAreaField = ({ label, value, onChange, required = false, rows = 3, placeholder = '' }: any) => (
  <div>
    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">{label} {required && '*'}</label>
    <ParticleWrapper>
      <textarea 
        required={required}
        value={value} 
        onChange={onChange}
        className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
        rows={rows}
        placeholder={placeholder}
      />
    </ParticleWrapper>
  </div>
)

export function CaseStudyForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })
  const [activeTab, setActiveTab] = useState<'basic'|'content'|'lists'|'media'|'seo'>('basic')
  const [isSlugLocked, setIsSlugLocked] = useState(true)

  const showAlert = (title: string, message: string, type: 'success'|'error') => {
    setAlertInfo({ isOpen: true, title, message, type })
  }
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    short_description: initialData?.short_description || '',
    overview: initialData?.overview || '',
    client_or_company_name: initialData?.client_or_company_name || '',
    problem_statement: initialData?.problem_statement || '',
    process: initialData?.process || '',
    objectives: initialData?.objectives || '',
    data_source: initialData?.data_source || '',
    data_cleaning: initialData?.data_cleaning || '',
    results_or_outcomes: initialData?.results_or_outcomes || '',
    business_impact: initialData?.business_impact || '',
    recommendations: initialData?.case_study_recommendations || [],
    challenges: initialData?.case_study_challenges || [],
    learnings: initialData?.case_study_learnings || [],
    featured: initialData?.featured || false,
    status: initialData?.status || 'published',
    is_active: initialData?.is_active ?? true,
    display_order: initialData?.display_order || 0,
    github_link: initialData?.github_link || '',
    tags: initialData?.tags || [],
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    og_image: initialData?.og_image || '',
    cover_image_path: initialData?.cover_image_path || '',
    gallery: initialData?.case_study_gallery || [],
    metrics: initialData?.case_study_metrics || [],
    insights: initialData?.case_study_insights || [],
  })

  // Auto-generate slug when title changes (only if not editing and unlocked, or if slug is empty)
  useEffect(() => {
    if ((!isEditing && isSlugLocked) || !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, isEditing, isSlugLocked])

  const currentSlug = formData.slug || generateSlug(formData.title || 'new-case-study');

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    setShowConfirm(false)
    setLoading(true)
    try {
      const finalData = { ...formData, is_active: formData.status === 'published' };
      if (isEditing) {
        await updateCaseStudy(initialData.id, finalData)
        showAlert('Success', 'Case Study updated successfully!', 'success')
      } else {
        await addCaseStudy(finalData)
        showAlert('Success', 'Case Study added successfully!', 'success')
      }
      router.refresh()
      if (!isEditing) {
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err)
      showAlert('Error', err.message || 'Failed to save case study', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    setLoading(true);
    try {
      const finalData = { ...formData, status: 'draft', is_active: false };
      setFormData(finalData); // update UI
      let savedSlug = finalData.slug;
      
      if (isEditing) {
        const res = await updateCaseStudy(initialData.id, finalData);
        if (res?.slug) savedSlug = res.slug;
      } else {
        const res = await addCaseStudy(finalData);
        if (res?.slug) savedSlug = res.slug;
      }
      
      // Ensure we navigate to the exact slug returned by the backend with the preview flag
      window.open(`/case-studies/${savedSlug}?preview=true`, '_blank');
      
      if (!isEditing) {
        // If it was a new post, we might want to redirect the admin page to the edit view,
        // but for now we reload so it doesn't submit duplicates on next save
        window.location.reload();
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to preview', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] neumorphic flex flex-col gap-6">
      <div className="mb-2">
        <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="w-4 h-[2px] bg-primary"></span>
          {isEditing ? 'Edit Case Study' : 'Add New Case Study'}
        </h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Create a detailed analytics walkthrough</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
        {['basic', 'content', 'media', 'lists', 'seo'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary text-white' : 'bg-background text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        
        {activeTab === 'basic' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Title" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} required />
              
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
              <InputField label="Client / Company Name" value={formData.client_or_company_name} onChange={(e: any) => setFormData({...formData, client_or_company_name: e.target.value})} />
              <InputField label="Short Description" value={formData.short_description} onChange={(e: any) => setFormData({...formData, short_description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Display Order</label>
                <ParticleWrapper>
                  <input 
                    type="number"
                    value={formData.display_order} 
                    onChange={(e: any) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                    className="w-full rounded-2xl px-5 py-3 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm" 
                  />
                </ParticleWrapper>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-background p-4 rounded-2xl border border-white/5">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-300 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 accent-primary" />
                Featured Case Study
              </label>
              
              <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status:</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="bg-card rounded-xl px-4 py-2 text-sm text-gray-300 border border-white/5 outline-none focus:border-primary/50"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Narrative</h4>
              <TextAreaField label="Overview" value={formData.overview} onChange={(e: any) => setFormData({...formData, overview: e.target.value})} rows={4} />
              <TextAreaField label="Problem Statement" value={formData.problem_statement} onChange={(e: any) => setFormData({...formData, problem_statement: e.target.value})} />
              <TextAreaField label="Objectives" value={formData.objectives} onChange={(e: any) => setFormData({...formData, objectives: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField label="Data Source" value={formData.data_source} onChange={(e: any) => setFormData({...formData, data_source: e.target.value})} rows={2} />
                <TextAreaField label="Data Cleaning" value={formData.data_cleaning} onChange={(e: any) => setFormData({...formData, data_cleaning: e.target.value})} rows={2} />
              </div>
              <TextAreaField label="Process / Modeling" value={formData.process} onChange={(e: any) => setFormData({...formData, process: e.target.value})} rows={4} />
              <TextAreaField label="Results / Outcomes" value={formData.results_or_outcomes} onChange={(e: any) => setFormData({...formData, results_or_outcomes: e.target.value})} />
              <TextAreaField label="Business Impact" value={formData.business_impact} onChange={(e: any) => setFormData({...formData, business_impact: e.target.value})} />
            </div>
          </motion.div>
        )}

        {activeTab === 'lists' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">Dynamic Data</h4>
              
              <div>
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">KPI Cards</label>
                <DynamicKeyValueBuilder 
                  items={formData.metrics}
                  onChange={(val: any) => setFormData({...formData, metrics: val})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Key Insights</label>
                  <DynamicListBuilder 
                    items={formData.insights}
                    onChange={(val: any) => setFormData({...formData, insights: val})}
                    itemKey="description"
                    placeholder="e.g. Discovered 15% drop-off..."
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Recommendations</label>
                  <DynamicListBuilder 
                    items={formData.recommendations}
                    onChange={(val: any) => setFormData({...formData, recommendations: val})}
                    itemKey="description"
                    placeholder="e.g. Optimize server locations..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Challenges</label>
                  <DynamicListBuilder 
                    items={formData.challenges}
                    onChange={(val: any) => setFormData({...formData, challenges: val})}
                    itemKey="description"
                    placeholder="e.g. Messy API data..."
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Learnings</label>
                  <DynamicListBuilder 
                    items={formData.learnings}
                    onChange={(val: any) => setFormData({...formData, learnings: val})}
                    itemKey="description"
                    placeholder="e.g. Mastered new DAX patterns..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block ml-2">Tags</label>
                <DynamicListBuilder 
                  items={formData.tags.map(t => ({ name: t }))}
                  onChange={(val: any) => setFormData({...formData, tags: val.map((v: any) => v.name)})}
                  itemKey="name"
                  placeholder="e.g. Power BI, Analytics"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'media' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Cover Image *</label>
              {formData.cover_image_path ? (
                <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate">{formData.cover_image_path}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold">✓</span>
                    <button type="button" onClick={() => setFormData({...formData, cover_image_path: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline">Remove</button>
                  </div>
                </div>
              ) : (
                <FileUpload 
                  bucket="portfolio-media" 
                  folder={formData.slug ? `case-studies/${formData.slug}/cover` : ''} 
                  accept="image/*" 
                  label="Upload Cover Image"
                  fileType="image"
                  onUploadComplete={(path) => setFormData({...formData, cover_image_path: path})} 
                />
              )}
              {!formData.slug && <p className="text-yellow-500 text-xs mt-2 ml-2">Please set a title/slug first before uploading.</p>}
            </div>

            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">GitHub Repository URL</label>
              <InputField value={formData.github_link} onChange={(e: any) => setFormData({...formData, github_link: e.target.value})} type="url" placeholder="https://github.com/..." />
            </div>

            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Screenshot Gallery</label>
              <MultiFileUpload 
                bucket="portfolio-media" 
                folder={formData.slug ? `case-studies/${formData.slug}/gallery` : ''} 
                accept="image/*" 
                items={formData.gallery}
                onChange={(items) => setFormData({...formData, gallery: items})} 
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'seo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <InputField label="Meta Title" value={formData.meta_title} onChange={(e: any) => setFormData({...formData, meta_title: e.target.value})} />
            <TextAreaField label="Meta Description" value={formData.meta_description} onChange={(e: any) => setFormData({...formData, meta_description: e.target.value})} rows={2} />
            <div>
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">OG Image (For Social Sharing)</label>
              {formData.og_image ? (
                <div className="w-full rounded-2xl px-5 py-4 bg-background border border-white/5 neumorphic-inner flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate">{formData.og_image}</span>
                  <button type="button" onClick={() => setFormData({...formData, og_image: ''})} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                </div>
              ) : (
                <FileUpload 
                  bucket="portfolio-media" 
                  folder={`case-studies/${currentSlug}/seo`} 
                  accept="image/*" 
                  label="Upload OG Image"
                  fileType="image"
                  onUploadComplete={(path) => setFormData({...formData, og_image: path})} 
                />
              )}
            </div>
          </motion.div>
        )}

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
            {loading ? 'Saving...' : (isEditing ? 'Update Case Study' : 'Save Case Study')}
          </motion.button>
        </div>
      </form>

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
            router.refresh()
          }
        }}
      />
    </div>
  )
}
