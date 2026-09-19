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
      console.error('Paystack verify call failed:', data)
      res.status(400).json({ verified: false, error: data.message || 'Paystack could not find this transaction.' })
      return
    }

    const tx = data.data
    const isSuccessful = tx.status === 'success'
    const amountMatches = typeof expectedAmount === 'number' ? tx.amount === expectedAmount : true

    if (!isSuccessful) {
      res.status(400).json({ verified: false, error: `Paystack reports this payment's status as "${tx.status}", not "success".` })
      return
    }

    if (!amountMatches) {
      console.error('Amount mismatch:', { expected: expectedAmount, actual: tx.amount, reference })
      res.status(400).json({
        verified: false,
        error: `Amount mismatch: expected ₦${(expectedAmount / 100).toLocaleString()} but Paystack charged ₦${(tx.amount / 100).toLocaleString()}.`,
      })
      return
    }

    res.status(200).json({ verified: true, amount: tx.amount, reference: tx.reference, paidAt: tx.paid_at })
  } catch (err) {
    console.error('Verify-payment function error:', err)
    res.status(500).json({ verified: false, error: 'Verification request failed unexpectedly.' })
  }
}