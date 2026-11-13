// Vercel serverless function: the "Contact us" form.
// Sends the message to the Invytory inbox using Resend (the same service that sends sign-in emails).
// Needs one environment variable in Vercel: RESEND_API_KEY.
// Optional: CONTACT_FROM (default "Invytory <no-reply@invytory.com>") and CONTACT_TO (default invytory1@gmail.com).

const hits = new Map<string, number[]>()

function limited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > 5
}

function clean(v: unknown, max: number): string {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  // A hidden field that real people never fill in; bots do.
  if (clean(body?.website, 200)) {
    res.status(200).json({ ok: true })
    return
  }
  const name = clean(body?.name, 80)
  const email = clean(body?.email, 120)
  const topic = clean(body?.topic, 60) || 'General'
  const message = clean(body?.message, 4000)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
    res.status(400).json({ error: 'Please fill in your name, a valid email and your message.' })
    return
  }
  const ip = String(req.headers?.['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown'
  if (limited(ip)) {
    res.status(429).json({ error: 'Too many messages. Please try again a little later.' })
    return
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('[contact] RESEND_API_KEY is not set')
    res.status(503).json({ error: 'not_configured' })
    return
  }
  const to = process.env.CONTACT_TO || 'invytory1@gmail.com'
  const from = process.env.CONTACT_FROM || 'Invytory <no-reply@invytory.com>'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Invytory contact] ${topic} from ${name}`,
        text: `Topic: ${topic}\nName: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><b>Topic:</b> ${escapeHtml(topic)}<br><b>Name:</b> ${escapeHtml(name)}<br><b>Email:</b> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    })
    if (!r.ok) {
      console.error('[contact] Resend refused:', r.status, (await r.text()).slice(0, 300))
      res.status(502).json({ error: 'send_failed' })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[contact] failed:', err)
    res.status(502).json({ error: 'send_failed' })
  }
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
