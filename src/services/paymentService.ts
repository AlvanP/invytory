import { supabase } from './supabaseClient'
declare global {
  interface Window {
    PaystackPop?: {
      setup(options: PaystackSetupOptions): { openIframe: () => void }
    }
  }
}

interface PaystackSetupOptions {
  key: string
  email: string
  amount: number // kobo
  currency?: string
  ref?: string
  metadata?: Record<string, unknown>
  callback: (response: { reference: string }) => void
  onClose: () => void
}

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js'

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve()
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')))
      return
    }
    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paystack'))
    document.body.appendChild(script)
  })
}

export const paymentService = {
  /**
   * Opens the Paystack popup. Resolves with the transaction reference
   * once the customer completes payment, or null if they close the
   * popup without paying. This alone does NOT confirm money actually
   * moved: activate() below re-checks with Paystack on the server.
   */
  async checkout({
    email,
    amountNaira,
    metadata,
  }: {
    email: string
    amountNaira: number
    metadata?: Record<string, unknown>
  }): Promise<string | null> {
    await loadPaystackScript()
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!publicKey) throw new Error('Missing Paystack public key (VITE_PAYSTACK_PUBLIC_KEY)')

    return new Promise((resolve) => {
      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email,
        amount: Math.round(amountNaira * 100),
        currency: 'NGN',
        metadata,
        callback: (response) => resolve(response.reference),
        onClose: () => resolve(null),
      })
      handler.openIframe()
    })
  },

  /**
   * Asks the secure server function (Supabase Edge Function "activate-payment") to confirm the
   * payment with Paystack and publish the invitation. All the checks happen on the server:
   * the browser only says which payment, which invitation and which plan.
   * Retries on a dropped connection; the server treats repeats safely.
   */
  async activate(
    reference: string,
    weddingId: string,
    planId: 'silver' | 'gold',
    free = false
  ): Promise<{ ok: boolean; slug?: string; error?: string }> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return { ok: false, error: 'Please sign in again.' }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-payment`

    let lastError = 'Could not reach the payment server.'
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ reference, weddingId, planId, ...(free ? { free: true } : {}) }),
        })
        const result = await response.json().catch(() => null)
        if (result?.ok) return { ok: true, slug: result.slug }
        if (result?.error) lastError = result.error
        // A clear "no" from the server will not change by trying again.
        if (response.status >= 400 && response.status < 500) return { ok: false, error: lastError }
      } catch {
        // dropped connection: try again below
      }
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)))
    }
    return { ok: false, error: lastError }
  },
}
