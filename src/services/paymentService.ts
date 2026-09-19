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
   * moved — a browser can be tricked, so verifyPayment() below always
   * re-checks with Paystack's server using the secret key.
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
   * Asks our own server (the /api/verify-payment function) to confirm
   * with Paystack that this payment really happened and for the right
   * amount, using the secret key — which never reaches the browser.
   * Returns the server's actual error message on failure so problems
   * are diagnosable instead of a generic "something went wrong."
   */
  async verifyPayment(
    reference: string,
    expectedAmountNaira: number
  ): Promise<{ verified: boolean; error?: string }> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, expectedAmount: Math.round(expectedAmountNaira * 100) }),
      })
      const data = await response.json().catch(() => null)
      if (!data) {
        return { verified: false, error: 'The verification server did not return a valid response.' }
      }
      return { verified: !!data.verified, error: data.error }
    } catch {
      return { verified: false, error: 'Could not reach the payment verification server.' }
    }
  },
}