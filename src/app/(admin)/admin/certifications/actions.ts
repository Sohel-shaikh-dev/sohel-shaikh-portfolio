'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function addCertification(data: any) {
  const supabase = await createClient()

  const { error } = await supabase.from('certifications').insert([data])

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag('certifications')
}

export async function deleteCertification(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('certifications').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidateTag('certifications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
export async function updateCertification(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('certifications')
}
