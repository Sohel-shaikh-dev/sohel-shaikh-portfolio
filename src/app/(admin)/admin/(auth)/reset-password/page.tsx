import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientResetPasswordForm } from './ClientResetPasswordForm'
import { updatePassword } from './actions'

export const metadata = {
  title: 'Set New Password | Admin Panel',
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  // If no session exists, the user either didn't come from a valid reset link 
  // or the session expired. Redirect to login.
  if (!session) {
    redirect('/admin/login?message=Reset link expired or invalid.')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-4 justify-center items-center mx-auto h-screen bg-background relative overflow-hidden">
      {/* Background glow effects matching portfolio */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>
      
      <ClientResetPasswordForm updatePasswordAction={updatePassword} />
    </div>
  )
}
