// Vercel serverless function — lives outside src/, runs only on
// Vercel's servers, never shipped to the browser. This is the only
// place PAYSTACK_SECRET_KEY is ever read.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { reference, expectedAmount } = req.body || {}
  if (!reference) {
    res.status(400).json({ verified: false, error: 'Missing payment reference' })
    return
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    res.status(500).json({ verified: false, error: 'Server is missing PAYSTACK_SECRET_KEY' })
    return
  }

  try {
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    )
    const data = await paystackResponse.json()

    if (!paystackResponse.ok || !data.status) {
      res.status(400).json({ verified: false, error: data.message || 'Verification failed' })
      return
    }

    const tx = data.data
    const isSuccessful = tx.status === 'success'
    const amountMatches = typeof expectedAmount === 'number' ? tx.amount === expectedAmount : true

    if (!isSuccessful || !amountMatches) {
      res.status(400).json({ verified: false, error: 'Payment could not be verified' })
      return
    }

    res.status(200).json({ verified: true, amount: tx.amount, reference: tx.reference, paidAt: tx.paid_at })
  } catch {
    res.status(500).json({ verified: false, error: 'Verification request failed' })
  }
}