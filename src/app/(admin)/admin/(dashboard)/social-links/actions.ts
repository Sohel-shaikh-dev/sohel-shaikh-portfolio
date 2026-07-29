'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSocialLinks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching social links:', error)
    return []
  }
  return data
}

export async function addSocialLink(data: any) {
  const supabase = await createClient()
  
  // Validate URL (basic)
  if (data.url) {
    data.url = data.url.trim()
  }

  const { error } = await supabase
    .from('social_links')
    .insert([data])

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/', 'layout')
}

export async function updateSocialLink(id: string, data: any) {
  const supabase = await createClient()
  
  if (data.url) {
    data.url = data.url.trim()
  }

  const { error } = await supabase
    .from('social_links')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/', 'layout')
}

export async function deleteSocialLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/', 'layout')
}

export async function reorderSocialLinks(orderedIds: string[]) {
  const supabase = await createClient()
  
  // Update each item's display_order
  const updates = orderedIds.map((id, index) => 
    supabase.from('social_links').update({ display_order: index }).eq('id', id)
  )
  
  await Promise.all(updates)
  
  revalidatePath('/admin/social-links')
  revalidatePath('/', 'layout')
}
