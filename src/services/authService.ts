import { supabase } from './supabaseClient'

/**
 * Thin wrapper around Supabase Auth's magic-link (passwordless) flow.
 * The redirect URL must be added to Supabase's Auth > URL Configuration
 * (see the setup instructions) or the link in the email won't work.
 */
export const authService = {
  async signInWithMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    })
    if (error) throw error
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}