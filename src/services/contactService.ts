import { supabase } from './supabaseClient'

export interface ContactMessage {
  id: string
  name: string
  email: string
  topic: string | null
  message: string
  isRead: boolean
  createdAt: string
}

interface Row {
  id: string
  name: string
  email: string
  topic: string | null
  message: string
  is_read: boolean
  created_at: string
}

const toMessage = (r: Row): ContactMessage => ({
  id: r.id,
  name: r.name,
  email: r.email,
  topic: r.topic,
  message: r.message,
  isRead: r.is_read,
  createdAt: r.created_at,
})

export const contactService = {
  /** Keeps a copy of the message in the database. Returns true if it was saved. */
  async save(m: { name: string; email: string; topic: string; message: string }): Promise<boolean> {
    const { error } = await supabase.from('contact_messages').insert({
      name: m.name.slice(0, 80),
      email: m.email.slice(0, 120),
      topic: m.topic.slice(0, 60),
      message: m.message.slice(0, 4000),
    })
    if (error) console.error('[contact] could not save:', error.message)
    return !error
  },

  /** Admin only. */
  async list(): Promise<ContactMessage[]> {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200)
    if (error) throw new Error(error.message)
    return (data as Row[]).map(toMessage)
  },

  async setRead(id: string, isRead: boolean): Promise<void> {
    const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
