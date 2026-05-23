'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function addExperience(data: any) {
  const supabase = await createClient()

  const { error } = await supabase.from('experiences').insert([data])

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag('experiences')
}

export async function deleteExperience(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('experiences').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidateTag('experiences')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
export async function updateExperience(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('experiences').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('experiences')
}
