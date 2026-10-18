import { supabase } from './supabaseClient'

export interface AdminOverview {
  users: number
  users_7d: number
  users_30d: number
  events: number
  events_7d: number
  events_30d: number
  published: number
  suspended: number
  expired: number
  plans: Record<string, number>
  event_types: Record<string, number>
  views: number
  rsvps: number
  confirmed: number
  wall_messages: number
  album_photos: number
  signups_by_day: { day: string; count: number }[]
}

export interface AdminEvent {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  plan: string | null
  owner_id: string
  owner_email: string | null
  created_at: string
  expires_at: string | null
  views: number
  payment_reference: string | null
  event_type: string
  title: string
  ceremonies: number
  rsvps: number
  album_photos: number
}

export interface AdminUser {
  id: string
  email: string | null
  created_at: string
  last_sign_in_at: string | null
  events: number
  is_admin: boolean
}

function fail(error: { message?: string }): never {
  const msg = error.message ?? 'Something went wrong.'
  throw new Error(msg.includes('not allowed') ? 'You are not allowed to use the admin area.' : msg)
}

export const adminService = {
  /** True only for people listed in platform_admins. Any failure counts as "no". */
  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_platform_admin')
      return !error && data === true
    } catch {
      return false
    }
  },

  async overview(): Promise<AdminOverview> {
    const { data, error } = await supabase.rpc('admin_overview')
    if (error) fail(error)
    return data as AdminOverview
  },

  async events(): Promise<AdminEvent[]> {
    const { data, error } = await supabase.rpc('admin_events')
    if (error) fail(error)
    return (data ?? []) as AdminEvent[]
  },

  async users(): Promise<AdminUser[]> {
    const { data, error } = await supabase.rpc('admin_users')
    if (error) fail(error)
    return (data ?? []) as AdminUser[]
  },

  async setStatus(id: string, status: AdminEvent['status']): Promise<void> {
    const { error } = await supabase.rpc('admin_set_event_status', { wid: id, new_status: status })
    if (error) fail(error)
  },

  async setExpiry(id: string, expiresAt: string): Promise<void> {
    const { error } = await supabase.rpc('admin_set_event_expiry', { wid: id, new_expiry: expiresAt })
    if (error) fail(error)
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.rpc('admin_delete_event', { wid: id })
    if (error) fail(error)
  },
}
