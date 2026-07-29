'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ExperienceFormData } from '@/types'

export async function addExperience(data: ExperienceFormData) {
  const supabase = await createClient()

  const payload = {
    ...data,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  }

  const { error } = await supabase.from('experiences').insert([payload])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteExperience(id: string) {
  try {
    const supabase = await createClient()
    
    // Fetch existing experience to check for logo
    const { data: existing } = await supabase.from('experiences').select('company_logo_path').eq('id', id).single()
    
    const { error } = await supabase.from('experiences').delete().eq('id', id)
    if (error) {
      console.error(`[deleteExperience] Database deletion failed for experience ID: ${id}`, error);
      throw new Error(error.message)
    }
      
    // Cleanup logo if it exists
    if (existing?.company_logo_path) {
      const { error: storageError } = await supabase.storage.from('portfolio-media').remove([existing.company_logo_path])
      if (storageError) {
        console.error(`[deleteExperience] Storage cleanup failed for file: ${existing.company_logo_path}`, storageError);
      }
    }
    
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateExperience(id: string, data: ExperienceFormData) {
  const supabase = await createClient()

  const payload = {
    ...data,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  }
  
  // Fetch existing experience to check for logo replacement
  const { data: existing } = await supabase.from('experiences').select('company_logo_path').eq('id', id).single()

  const { error } = await supabase.from('experiences').update(payload).eq('id', id)
  if (error) {
    console.error(`[updateExperience] Database update failed for experience ID: ${id}`, error);
    throw new Error(error.message)
  }
    
  // Cleanup old logo if it changed or was removed
  if (existing?.company_logo_path && existing.company_logo_path !== data.company_logo_path) {
    const { error: storageError } = await supabase.storage.from('portfolio-media').remove([existing.company_logo_path])
    if (storageError) {
      console.error(`[updateExperience] Storage cleanup failed for old logo: ${existing.company_logo_path}`, storageError);
    }
  }
  
  revalidatePath('/')
  return { success: true }
}

