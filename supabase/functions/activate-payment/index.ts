// Invytory: activate-payment (Supabase Edge Function)
//
// The ONLY place an invitation becomes "published and paid". The browser sends
// the Paystack reference, the draft wedding's id and the plan name. This function
// then, on the server:
//   1. checks who is asking (their sign-in token),
//   2. checks the wedding is theirs and still a draft,
//   3. asks Paystack whether the payment really succeeded, in naira, for AT LEAST the
//      price of that plan (prices live here, never trusted from the browser),
//   4. makes sure the payment reference was never used for another invitation,
//   5. publishes the wedding and its ceremonies with the plan's limits.
//
// Secrets (set in Supabase > Edge Functions > Secrets): PAYSTACK_SECRET_KEY.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// No libraries are imported on purpose: it only uses fetch.

const PLANS: Record<string, { price: number; maxGuests: number }> = {
  // Keep in step with src/data/pricingPlans.ts (price in naira).
  silver: { price: 25000, maxGuests: 300 },
  gold: { price: 45000, maxGuests: 1000 },
}

const DAY_MS = 24 * 60 * 60 * 1000
// Keep in step with src/utils/hostingDuration.ts.
const GRACE_DAYS = 7
const SILVER_DAYS = 90
const GOLD_BASE_DAYS = 180
const GOLD_MAX_DAYS = 365

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

function hostingDays(planId: string, dates: string[], now: number): number | { error: string } {
  const times = dates.filter(Boolean).map((d) => new Date(`${d}T00:00:00`).getTime()).filter((t) => !Number.isNaN(t))
  const needed = times.length ? Math.max(0, Math.ceil((Math.max(...times) - now) / DAY_MS)) + GRACE_DAYS : 0
  if (planId === 'silver') {
    if (needed > SILVER_DAYS) return { error: 'The Essential plan cannot cover the date of your last ceremony. Please choose Signature.' }
    return SILVER_DAYS
  }
  return Math.min(Math.max(needed, GOLD_BASE_DAYS), GOLD_MAX_DAYS)
}

export async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return reply(405, { ok: false, error: 'Method not allowed.' })

  const supabaseUrl = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''
  if (!supabaseUrl || !serviceKey) return reply(500, { ok: false, error: 'The server is not set up yet (database keys missing).' })
  if (!paystackKey) return reply(500, { ok: false, error: 'The server is not set up yet (PAYSTACK_SECRET_KEY missing).' })

  const db = (path: string, init: RequestInit = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    })

  // 1. Who is asking?
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return reply(401, { ok: false, error: 'Please sign in again.' })
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: `Bearer ${token}` } })
  if (!userRes.ok) return reply(401, { ok: false, error: 'Please sign in again.' })
  const user = (await userRes.json().catch(() => null)) as { id?: string; email?: string } | null
  if (!user?.id) return reply(401, { ok: false, error: 'Please sign in again.' })

  // What are they asking for?
  const body = (await req.json().catch(() => null)) as { reference?: unknown; weddingId?: unknown; planId?: unknown } | null
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : ''
  const weddingId = typeof body?.weddingId === 'string' ? body.weddingId.trim() : ''
  const planId = typeof body?.planId === 'string' ? body.planId : ''
  const plan = PLANS[planId]
  if (!/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) return reply(400, { ok: false, error: 'That payment reference does not look right.' })
  if (!/^[0-9a-fA-F-]{36}$/.test(weddingId)) return reply(400, { ok: false, error: 'Missing invitation.' })
  if (!plan) return reply(400, { ok: false, error: 'Unknown plan.' })

  // 2. The wedding must be theirs.
  const wRes = await db(`weddings?id=eq.${weddingId}&select=id,owner_id,slug,status,payment_reference,expires_at&limit=1`)
  const wRows = wRes.ok ? ((await wRes.json()) as Record<string, string>[]) : []
  const wedding = wRows[0]
  if (!wedding) return reply(404, { ok: false, error: 'We could not find that invitation.' })
  if (wedding.owner_id !== user.id) return reply(403, { ok: false, error: 'That invitation belongs to another account.' })
  if (wedding.status === 'published' && wedding.payment_reference === reference) {
    return reply(200, { ok: true, slug: wedding.slug, expiresAt: wedding.expires_at, already: true })
  }
  if (wedding.status !== 'draft') return reply(409, { ok: false, error: 'This invitation is already published.' })

  const iRes = await db(`invitations?wedding_id=eq.${weddingId}&select=id,wedding_date`)
  const ceremonies = iRes.ok ? ((await iRes.json()) as { id: string; wedding_date: string }[]) : []
  if (ceremonies.length === 0) return reply(400, { ok: false, error: 'This invitation has no ceremonies.' })
  const days = hostingDays(planId, ceremonies.map((c) => c.wedding_date), Date.now())
  if (typeof days !== 'number') return reply(400, { ok: false, error: days.error })

  // 3. Is the payment real?
  const pRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackKey}` },
  })
  const pJson = (await pRes.json().catch(() => null)) as {
    status?: boolean
    message?: string
    data?: { status?: string; amount?: number; currency?: string; customer?: { email?: string } }
  } | null
  if (!pRes.ok || !pJson?.status || !pJson.data) {
    return reply(400, { ok: false, error: pJson?.message || 'Paystack could not find this payment.' })
  }
  const tx = pJson.data
  if (tx.status !== 'success') return reply(400, { ok: false, error: `Paystack reports this payment as "${tx.status}", not successful.` })
  if ((tx.currency ?? 'NGN') !== 'NGN') return reply(400, { ok: false, error: 'This payment was not made in naira.' })
  // Paystack may add its fee on top (a larger charge is fine). A smaller one is not.
  if (typeof tx.amount !== 'number' || tx.amount < plan.price * 100) {
    return reply(400, { ok: false, error: 'The amount paid is lower than the price of this plan.' })
  }
  const payer = (tx.customer?.email ?? '').toLowerCase()
  if (user.email && payer && payer !== user.email.toLowerCase()) {
    return reply(403, { ok: false, error: 'This payment was made with a different email address.' })
  }

  // 4. One payment, one invitation.
  const claim = await db('payments', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ reference, wedding_id: weddingId, user_id: user.id, plan: planId, amount_kobo: tx.amount }),
  })
  if (!claim.ok) {
    const existing = await db(`payments?reference=eq.${encodeURIComponent(reference)}&select=wedding_id&limit=1`)
    const rows = existing.ok ? ((await existing.json()) as { wedding_id: string }[]) : []
    if (!rows[0] || rows[0].wedding_id !== weddingId) {
      return reply(409, { ok: false, error: 'This payment has already been used for another invitation.' })
    }
  }

  // 5. Publish.
  const expiresAt = new Date(Date.now() + days * DAY_MS).toISOString()
  const up = await db(`weddings?id=eq.${weddingId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'published', plan: planId, max_guests: plan.maxGuests, expires_at: expiresAt, payment_reference: reference }),
  })
  if (!up.ok) return reply(500, { ok: false, error: 'Your payment is confirmed, but we could not publish yet. Please try again, or contact support with your reference.' })
  await db(`invitations?wedding_id=eq.${weddingId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'published' }),
  })

  return reply(200, { ok: true, slug: wedding.slug, expiresAt })
}

Deno.serve(handle)
