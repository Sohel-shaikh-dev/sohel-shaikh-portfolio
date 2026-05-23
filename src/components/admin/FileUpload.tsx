'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud } from 'lucide-react'
import { motion } from 'motion/react'

export function FileUpload({
  bucket,
  folder = '',
  accept = '*',
  onUploadComplete,
}: {
  bucket: string
  folder?: string
  accept?: string
  onUploadComplete: (path: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null)
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUploadComplete(filePath)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div 
      whileHover={{ scale: 0.98 }}
      className="border border-dashed border-white/10 bg-background neumorphic-inner rounded-2xl p-6 text-center hover:border-primary/50 transition-colors relative overflow-hidden group"
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      
      {/* Glow effect on hover */}
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
          {uploading ? 'Uploading...' : 'Click or drag file to upload'}
        </p>
      </div>
      {error && <p className="text-red-500 text-[12px] uppercase tracking-widest mt-4 font-bold">{error}</p>}
    </motion.div>
  )
}
