'use server'

import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(email: string, origin: string) {
  if (!email) {
    return { success: false, message: 'Email address is required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin/reset-password`,
  })

  if (error) {
    console.error('Password reset request error:', error.message)
    // Avoid leaking whether the email exists or not for security reasons.
    return { success: false, message: 'If an account exists, a reset link has been sent.' }
  }

  return { success: true, message: 'We have sent a password reset link to your email address.' }
}
