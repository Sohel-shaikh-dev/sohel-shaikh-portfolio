'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDeveloperSocialLinks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('developer_social_links')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching social links:', error)
    return []
  }
  return data
}

export async function addDeveloperSocialLink(data: any) {
  const supabase = await createClient()
  
  // Validate URL (basic)
  if (data.url) {
    data.url = data.url.trim()
  }

  const { error } = await supabase
    .from('developer_social_links')
    .insert([data])

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/')
}

export async function updateDeveloperSocialLink(id: string, data: any) {
  const supabase = await createClient()
  
  if (data.url) {
    data.url = data.url.trim()
  }

  const { error } = await supabase
    .from('developer_social_links')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/')
}

export async function deleteDeveloperSocialLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('developer_social_links')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/social-links')
  revalidatePath('/')
}

export async function reorderDeveloperSocialLinks(orderedIds: string[]) {
  const supabase = await createClient()
  
  // Update each item's display_order
  const updates = orderedIds.map((id, index) => 
    supabase.from('developer_social_links').update({ display_order: index }).eq('id', id)
  )
  
  await Promise.all(updates)
  
  revalidatePath('/admin/social-links')
  revalidatePath('/')
}
