'use server'

import { createClient } from '@/lib/supabase/server'

export async function updatePassword(password: string) {
  if (!password || password.length < 8) {
    return { success: false, message: 'Password does not meet minimum requirements.' }
  }

  const supabase = await createClient()

  // Update the user's password
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Password update error:', error.message)
    return { success: false, message: error.message }
  }

  // Sign out the user to force them to log in with the new password
  // This is a common security best practice after a password reset
  await supabase.auth.signOut()

  return { success: true, message: 'Password updated successfully!' }
}
