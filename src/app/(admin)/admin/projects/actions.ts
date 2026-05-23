'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function addProject(data: any) {
  const supabase = await createClient()

  const { error } = await supabase.from('projects').insert([data])

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag('projects')
}

export async function deleteProject(id: string) {
  try {
    const supabase = await createClient()
    
    // Fetch project to get file paths
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    if (project) {
      const filesToDelete = []
      if (project.thumbnail_path) filesToDelete.push(project.thumbnail_path)
      if (project.pdf_export_path) filesToDelete.push(project.pdf_export_path)
      if (project.pbix_file_path) filesToDelete.push(project.pbix_file_path)
      
      if (filesToDelete.length > 0) {
        await supabase.storage.from('portfolio-media').remove(filesToDelete)
      }
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidateTag('projects')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
export async function updateProject(id: string, data: any) {
  const supabase = await createClient()
  
  // Fetch existing project to compare file paths
  const { data: existing } = await supabase.from('projects').select('*').eq('id', id).single()
  if (existing) {
    const filesToDelete = []
    if (existing.thumbnail_path && data.thumbnail_path && existing.thumbnail_path !== data.thumbnail_path) {
      filesToDelete.push(existing.thumbnail_path)
    }
    if (existing.pdf_export_path && data.pdf_export_path && existing.pdf_export_path !== data.pdf_export_path) {
      filesToDelete.push(existing.pdf_export_path)
    }
    if (existing.pbix_file_path && data.pbix_file_path && existing.pbix_file_path !== data.pbix_file_path) {
      filesToDelete.push(existing.pbix_file_path)
    }
    if (filesToDelete.length > 0) {
      await supabase.storage.from('portfolio-media').remove(filesToDelete)
    }
  }

  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('projects')
}
