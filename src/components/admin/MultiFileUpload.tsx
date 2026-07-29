'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud, X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { motion, Reorder } from 'motion/react'

export function MultiFileUpload({
  bucket,
  folder = '',
  accept = 'image/*',
  items,
  onChange,
}: {
  bucket: string
  folder?: string
  accept?: string
  items: any[]
  onChange: (items: any[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      setUploading(true)
      const newItems = [...items]

      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        newItems.push({ image_url: filePath })
      }

      onChange(newItems)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(index: number) {
    const itemToRemove = items[index]
    // Optionally delete from storage immediately to prevent orphans
    const pathToRemove = itemToRemove.image_url || itemToRemove.image_path
    if (pathToRemove) {
      await supabase.storage.from(bucket).remove([pathToRemove])
    }
    
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div 
        whileHover={{ scale: 0.98 }}
        className="border border-dashed border-white/10 bg-background neumorphic-inner rounded-2xl p-6 text-center hover:border-primary/50 transition-colors relative overflow-hidden group"
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading || !folder}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xl"></div>

        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none relative z-0">
          {uploading ? (
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-card border border-white/5 flex items-center justify-center neumorphic text-gray-400 group-hover:text-primary transition-colors">
              <UploadCloud size={20} />
            </div>
          )}
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-2 group-hover:text-white transition-colors">
            {!folder ? 'Save project slug first to upload gallery' : uploading ? 'Uploading...' : 'Click or drag files to upload'}
          </p>
        </div>
        {error && <p className="text-red-500 text-[12px] uppercase tracking-widest mt-4 font-bold">{error}</p>}
      </motion.div>

      {items.length > 0 && (
        <div className="bg-background/50 rounded-2xl p-4 border border-white/5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gallery Order</h4>
          <Reorder.Group axis="y" values={items} onReorder={onChange} className="flex flex-col gap-2">
            {items.map((item, index) => (
              <Reorder.Item
                key={item.id || item.image_url || item.image_path || index}
                value={item}
                className="flex items-center gap-3 bg-card p-3 rounded-xl border border-white/5 neumorphic-inner cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={16} className="text-gray-500" />
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                  <ImageIcon size={16} className="text-gray-500" />
                  {/* Note: We could load the actual image here using supabase publicUrl if desired */}
                </div>
                <span className="flex-1 text-xs text-gray-300 truncate">{(item.image_url || item.image_path || '').split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                >
                  <X size={16} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  )
}
