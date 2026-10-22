// Retired. Payments are now confirmed and activated by the Supabase Edge Function
// "activate-payment" (supabase/functions/activate-payment), which keeps the Paystack
// secret key inside Supabase. This file stays only so old links do not break.

export default function handler(_req: any, res: any) {
  res.status(410).json({ verified: false, error: 'This endpoint has moved.' })
}
