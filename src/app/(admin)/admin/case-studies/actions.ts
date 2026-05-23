'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function addCaseStudy(data: any) {
  const supabase = await createClient()

  // tags might be a comma separated string from the form, convert to array
  const formattedData = {
    ...data,
    tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
  }

  const { error } = await supabase.from('case_studies').insert([formattedData])

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag('case_studies', 'max')
}

export async function deleteCaseStudy(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: study } = await supabase.from('case_studies').select('*').eq('id', id).single()
    if (study && study.cover_image_path) {
      await supabase.storage.from('portfolio-media').remove([study.cover_image_path])
    }

    const { error } = await supabase.from('case_studies').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidateTag('case-studies', 'max')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateCaseStudy(id: string, data: any) {
  const supabase = await createClient()
  
  const { data: existing } = await supabase.from('case_studies').select('*').eq('id', id).single()
  if (existing && existing.cover_image_path && data.cover_image_path && existing.cover_image_path !== data.cover_image_path) {
    await supabase.storage.from('portfolio-media').remove([existing.cover_image_path])
  }

  const formattedData = {
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [])
  }
  const { error } = await supabase.from('case_studies').update(formattedData).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('case_studies', 'max')
}
