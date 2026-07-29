import { Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClientSidebar } from './ClientSidebar'

const inter = Inter({ subsets: ['latin'] })

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className={`${inter.className} min-h-screen bg-background text-white flex flex-col lg:flex-row relative overflow-hidden`}>
      {/* Background glow effects matching portfolio */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10 -translate-x-1/2"></div>
      
      {user && <ClientSidebar signOutAction={signOut} />}
      
      <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12">
        {children}
      </main>
    </div>
  )
}
