import { createClient } from '@/lib/supabase/server'
import { ClientMessageList } from './ClientMessageList'

export default async function MessagesAdminPage() {
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">Inbox</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Manage your contact form messages</p>
      </div>

      <ClientMessageList messages={messages || []} />
    </div>
  )
}
