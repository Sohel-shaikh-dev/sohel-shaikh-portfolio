'use client'

import { useState, useEffect } from 'react'
import { markAsRead, deleteMessage } from './actions'
import { AnimatedCard } from '@/components/admin/AnimatedCard'
import { Check, Trash2, Mail, MailOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ClientMessageList({ messages }: { messages: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, (payload) => {
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  async function handleMarkRead(id: string) {
    setLoading(id)
    try {
      await markAsRead(id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this message?')) return
    setLoading(id)
    try {
      await deleteMessage(id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="bg-card rounded-[2rem] neumorphic p-12 text-center flex flex-col items-center justify-center">
        <span className="text-gray-500 font-bold uppercase tracking-widest mb-2">No messages</span>
        <span className="text-sm text-gray-400">Your inbox is empty.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((msg, index) => (
        <AnimatedCard key={msg.id} index={index} className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border border-white/5 ${msg.status === 'UNREAD' ? 'bg-primary/20 text-primary neumorphic-inner' : 'bg-background text-gray-400 neumorphic'}`}>
                {msg.status === 'UNREAD' ? <Mail size={20} /> : <MailOpen size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{msg.sender_name} <span className="text-sm font-normal text-gray-400 ml-2">{msg.sender_email}</span></h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{msg.subject}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-bold">
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-background rounded-2xl p-5 text-sm text-gray-300 neumorphic-inner border border-white/5 whitespace-pre-wrap">
            {msg.message}
          </div>

          <div className="flex gap-3 justify-end mt-2">
            {msg.status === 'UNREAD' && (
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading === msg.id}
                onClick={() => handleMarkRead(msg.id)} 
                className="flex items-center gap-2 px-4 py-2 bg-background border border-white/5 rounded-xl neumorphic text-xs font-bold text-gray-300 hover:text-white transition-all disabled:opacity-50"
              >
                <Check size={14} /> Mark Read
              </motion.button>
            )}
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading === msg.id}
              onClick={() => handleDelete(msg.id)} 
              className="flex items-center gap-2 px-4 py-2 bg-background border border-white/5 rounded-xl neumorphic text-xs font-bold text-red-400 hover:text-red-500 transition-all disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </motion.button>
          </div>
        </AnimatedCard>
      ))}
    </div>
  )
}
