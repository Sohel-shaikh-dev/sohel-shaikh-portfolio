'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function deleteMessage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw error
  revalidateTag('messages')
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ status: 'READ' }).eq('id', id)
  if (error) throw error
  revalidateTag('messages')
}
