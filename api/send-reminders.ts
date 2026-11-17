// Vercel cron job (runs every morning): sends two kinds of reminder emails with Resend.
//   1. "Finish your invitation" to people who started one and did not publish.
//   2. "Your event is coming up" to guests who said yes and left an email on their RSVP.
// Needs these environment variables in Vercel (Project > Settings > Environment Variables):
//   RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET (any long random text you make up).
// Optional: REMINDER_FROM (default "Invytory <no-reply@invytory.com>"), SITE_URL (default https://www.invytory.com).
// Open /api/send-reminders?dry=1 with the header "Authorization: Bearer <CRON_SECRET>" to count without sending.

const SITE = (process.env.SITE_URL || 'https://www.invytory.com').replace(/\/$/, '')
const FROM = process.env.REMINDER_FROM || 'Invytory <no-reply@invytory.com>'
const GOLD = '#B0587A'

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function rpc(name: string, args: Record<string, unknown> = {}): Promise<any> {
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !key) throw new Error('Supabase is not configured')
  const r = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${name} failed: ${r.status} ${(await r.text()).slice(0, 200)}`)
  const text = await r.text()
  return text ? JSON.parse(text) : null
}

async function send(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
  })
  if (!r.ok) console.error('[reminders] Resend refused', r.status, (await r.text()).slice(0, 200))
  return r.ok
}

function shell(inner: string): string {
  return `<div style="background:#FBF6F4;padding:24px 12px;font-family:Georgia,serif"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px 28px;border:1px solid #F0DDE3;color:#2A2023">${inner}<p style="margin-top:28px;font:12px Arial,sans-serif;color:#8a7a80">Invytory · Tell a story, with your invites<br>Reply to this email if you would like us to stop sending these.</p></div></div>`
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:${GOLD};color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font:600 14px Arial,sans-serif;display:inline-block">${esc(label)}</a></p>`

function leadEmail(l: any) {
  const who = l.names ? ` for ${l.names}` : ''
  const second = Number(l.stage) >= 1
  const subject = second ? `Still want that invitation${who}? We saved your place` : `Your invitation${who} is almost ready`
  const url = `${SITE}/create`
  const html = shell(
    `<h2 style="margin:0 0 12px;font-weight:400;font-size:26px">${second ? 'Your invitation is still waiting' : 'You are almost there'}</h2>
     <p style="font:15px/1.6 Arial,sans-serif">You started creating an invitation${esc(who)} on Invytory${second ? ' and have not finished yet' : ''}. It only takes a few more minutes to add your photos, music and details and share it with your guests.</p>
     ${button(url, 'Finish my invitation')}
     <p style="font:14px/1.6 Arial,sans-serif;color:#6b5b61">Need a hand, or want us to set it up with you? Just reply to this email.</p>`
  )
  return { subject, html, text: `You started an invitation${who} on Invytory. Finish it here: ${url}\nNeed help? Just reply to this email.` }
}

function guestEmail(g: any) {
  const title = g.event_type === 'wedding' || !g.event_type ? [g.brides, g.grooms].filter(Boolean).join(' & ') : g.brides
  const when = [g.event_date, g.event_time].filter(Boolean).join(' at ')
  const where = [g.venue_name, g.venue_address, g.city].filter(Boolean).join(', ')
  const day = g.stage === 'day'
  const url = `${SITE}/invitation/${g.slug}`
  const subject = day ? `Tomorrow: ${title}` : `Save the date: ${title}`
  const lead = day ? 'This is a friendly reminder that the day is almost here.' : 'This is a friendly reminder that the day is coming up.'
  const html = shell(
    `<h2 style="margin:0 0 12px;font-weight:400;font-size:26px">${esc(title)}</h2>
     <p style="font:15px/1.6 Arial,sans-serif">Hello ${esc(g.guest_name)}, ${lead}</p>
     <p style="font:15px/1.8 Arial,sans-serif;background:#FBF6F4;border-radius:12px;padding:14px 16px">${when ? `<b>When:</b> ${esc(when)}<br>` : ''}${where ? `<b>Where:</b> ${esc(where)}` : ''}</p>
     ${button(url, 'Open the invitation')}
     <p style="font:14px/1.6 Arial,sans-serif;color:#6b5b61">On the invitation you can add the date to your calendar and open the venue in Maps.</p>`
  )
  return { subject, html, text: `${title}\n${lead}\n${when}\n${where}\nOpen the invitation: ${url}` }
}

export default async function handler(req: any, res: any) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    res.status(503).json({ error: 'CRON_SECRET is not set' })
    return
  }
  if (req.headers?.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Not allowed' })
    return
  }
  if (!process.env.RESEND_API_KEY) {
    res.status(503).json({ error: 'RESEND_API_KEY is not set' })
    return
  }
  const dry = String(req.query?.dry ?? '') === '1'
  const out = { leads: 0, guestsWeek: 0, guestsDay: 0, failed: 0, dry }
  try {
    const leads: any[] = (await rpc('leads_due_for_reminder')) ?? []
    const sentLeads: string[] = []
    for (const l of leads.slice(0, 100)) {
      if (dry) {
        out.leads++
        continue
      }
      const m = leadEmail(l)
      if (await send(l.email, m.subject, m.html, m.text)) {
        sentLeads.push(l.email)
        out.leads++
      } else out.failed++
    }
    if (sentLeads.length) await rpc('mark_lead_reminded', { addresses: sentLeads })

    const guests: any[] = (await rpc('guest_reminders_due')) ?? []
    for (const stage of ['week', 'day'] as const) {
      const done: string[] = []
      for (const g of guests.filter((x) => x.stage === stage).slice(0, 200)) {
        if (dry) {
          stage === 'day' ? out.guestsDay++ : out.guestsWeek++
          continue
        }
        const m = guestEmail(g)
        if (await send(g.email, m.subject, m.html, m.text)) {
          done.push(g.guest_id)
          stage === 'day' ? out.guestsDay++ : out.guestsWeek++
        } else out.failed++
      }
      if (done.length) await rpc('mark_guest_reminded', { ids: done, which: stage })
    }
    res.status(200).json(out)
  } catch (err) {
    console.error('[reminders] failed:', err)
    res.status(500).json({ error: 'failed', detail: err instanceof Error ? err.message : String(err) })
  }
}
