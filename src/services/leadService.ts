import { supabase } from './supabaseClient'

export interface Lead {
  email: string
  event_type: string | null
  names: string | null
  template_id: string | null
  plan: string | null
  last_seen: string
  tries: number
  has_published: boolean
}

export const leadService = {
  /** Remembers who started an invitation, so the team can follow up if it was never published. Never blocks the guest. */
  async capture(lead: { email: string; eventType?: string; names?: string; templateId?: string; plan?: string }): Promise<void> {
    try {
      await supabase.from('leads').insert({
        email: lead.email.trim().toLowerCase(),
        event_type: lead.eventType ?? null,
        names: lead.names ?? null,
        template_id: lead.templateId ?? null,
        plan: lead.plan ?? null,
      })
    } catch {
      // a failed note must never stop someone publishing
    }
  },

  async list(): Promise<Lead[]> {
    const { data, error } = await supabase.rpc('admin_leads')
    if (error) throw new Error(error.message)
    return (data ?? []) as Lead[]
  },

  async remove(email: string): Promise<void> {
    const { error } = await supabase.from('leads').delete().eq('email', email)
    if (error) throw new Error(error.message)
  },
}
