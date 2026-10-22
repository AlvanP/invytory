// Vercel serverless function. Gives every invitation link a proper preview when it is shared
// (WhatsApp, Facebook, iMessage, Telegram, X ...):
//
//   /invitation/<slug>          -> the normal page, with a title, description and picture added to <head>
//   /api/invite-share?slug=..&image=1 -> that picture: the first photo, darkened, with the invite title over it
//
// The picture is made on the server because the apps that read a shared link never run the website's
// JavaScript. Kept in ONE file with no local imports so it deploys without any extra setup.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// sharp and satori are loaded only when a picture is asked for, so the page itself never depends on them.
type Sharp = typeof import('sharp')

const W = 1200
const H = 630

interface Invite {
  names: string
  label: string
  heroImage: string | null
  when: string
  where: string
}

const LABELS: Record<string, string> = {
  wedding: 'Wedding Invitation',
  'child-dedication': 'Child Dedication',
  birthday: 'Birthday Invitation',
  corporate: 'You’re Invited',
  funeral: 'Celebration of Life',
}

function supabaseConfig() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  return url && key ? { url, key } : null
}

async function rest(path: string): Promise<any[]> {
  const cfg = supabaseConfig()
  if (!cfg) return []
  const res = await fetch(`${cfg.url}/rest/v1/${path}`, { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function cleanSlug(raw: unknown): string {
  return String(raw ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120)
}

function prettyDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

async function loadInvite(slug: string): Promise<Invite | null> {
  if (!slug) return null
  const weddings = await rest(`weddings?slug=eq.${slug}&select=id,status&limit=1`)
  let rows: any[] = []
  if (weddings[0]) {
    if (weddings[0].status !== 'published') return null
    rows = await rest(`invitations?wedding_id=eq.${weddings[0].id}&select=bride_name,groom_name,event_type,hero_image,wedding_date,venue_name,city&order=wedding_date.asc&limit=1`)
  } else {
    rows = await rest(`invitations?slug=eq.${slug}&select=bride_name,groom_name,event_type,hero_image,wedding_date,venue_name,city&limit=1`)
  }
  const r = rows[0]
  if (!r) return null
  const first = String(r.bride_name ?? '').trim()
  const second = String(r.groom_name ?? '').trim()
  return {
    names: second ? `${first} & ${second}` : first,
    label: LABELS[r.event_type] ?? LABELS.wedding,
    heroImage: typeof r.hero_image === 'string' && /^https?:\/\//.test(r.hero_image) ? r.hero_image : null,
    when: prettyDate(r.wedding_date),
    where: [r.venue_name, r.city].filter(Boolean).join(', '),
  }
}

/** The name on a personal link (?to=code), so the preview can say who it is for. */
async function loadGuestName(code: string): Promise<string> {
  const cfg = supabaseConfig()
  if (!cfg || !/^[a-z0-9]{6,20}$/.test(code)) return ''
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/get_invite_link`, {
      method: 'POST',
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_code: code }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return Array.isArray(data) && data[0]?.guest_name ? String(data[0].guest_name).slice(0, 80) : ''
  } catch {
    return ''
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* ───────────────────────── The picture ───────────────────────── */

let fontCache: Buffer | null = null
async function loadFont(origin: string): Promise<Buffer | null> {
  if (fontCache) return fontCache
  const candidates = [
    () => readFileSync(new URL('./_assets/fraunces-500.woff', import.meta.url)),
    () => readFileSync(join(process.cwd(), 'api/_assets/fraunces-500.woff')),
  ]
  for (const read of candidates) {
    try {
      fontCache = read()
      return fontCache
    } catch {
      // try the next place
    }
  }
  try {
    const res = await fetch(`${origin}/fonts/og-fraunces-500.woff`)
    if (res.ok) {
      fontCache = Buffer.from(await res.arrayBuffer())
      return fontCache
    }
  } catch {
    // no font: the picture is made without text styling below
  }
  return null
}

async function loadPhoto(url: string): Promise<Buffer | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 12 * 1024 * 1024 ? null : buf
  } catch {
    return null
  }
}

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } }
const h = (style: Record<string, unknown>, children?: unknown, type = 'div'): Node => ({ type, props: { style, children } })

async function renderImage(invite: Invite, guest: string, origin: string): Promise<Buffer> {
  const sharp = ((await import('sharp')) as unknown as { default: Sharp }).default
  const satori = (await import('satori')).default
  // 1. The background: the first photo, or a deep wine colour when there is none.
  const photo = invite.heroImage ? await loadPhoto(invite.heroImage) : null
  let base: ReturnType<Sharp>
  try {
    base = photo
      ? sharp(photo).rotate().resize(W, H, { fit: 'cover', position: 'attention' })
      : sharp({ create: { width: W, height: H, channels: 3, background: '#59262F' } })
    await base.clone().toBuffer()
  } catch {
    base = sharp({ create: { width: W, height: H, channels: 3, background: '#59262F' } })
  }

  // 2. A dark overlay so the writing can always be read.
  const shade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#000" stop-opacity="${photo ? 0.55 : 0.1}"/><stop offset="0.5" stop-color="#000" stop-opacity="${photo ? 0.5 : 0.2}"/>` +
      `<stop offset="1" stop-color="#000" stop-opacity="${photo ? 0.72 : 0.45}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
  )

  // 3. The writing, drawn separately with a see-through background.
  const font = await loadFont(origin)
  const longNames = invite.names.length > 22
  const lines: Node[] = []
  if (guest) {
    lines.push(h({ fontSize: 34, color: '#F3E6CF', marginBottom: 26, textAlign: 'center' }, `${guest} is specially invited to`))
  }
  lines.push(h({ fontSize: 24, letterSpacing: 8, textTransform: 'uppercase', color: '#E9D3A7', marginBottom: 26 }, invite.label))
  lines.push(h({ fontSize: longNames ? 78 : 104, lineHeight: 1.08, color: '#FFFFFF', textAlign: 'center', maxWidth: 1000 }, invite.names))
  const meta = [invite.when, invite.where].filter(Boolean).join('  ·  ')
  if (meta) lines.push(h({ fontSize: 28, color: '#F1E8DA', marginTop: 34, textAlign: 'center', maxWidth: 1000 }, meta))

  const tree = h(
    { width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: font ? 'Fraunces' : 'serif' },
    [
      ...lines,
      h({ position: 'absolute', bottom: 36, right: 52, fontSize: 24, letterSpacing: 2, color: '#E9D3A7', opacity: 0.9 }, 'Invytory'),
    ]
  )
  const svg = await satori(tree as never, {
    width: W,
    height: H,
    fonts: font ? [{ name: 'Fraunces', data: font, weight: 500, style: 'normal' }] : [],
  })
  const textPng = await sharp(Buffer.from(svg)).png().toBuffer()

  return base
    .composite([{ input: shade }, { input: textPng }])
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer()
}

/* ───────────────────────── The page ───────────────────────── */

function injectHead(html: string, tags: string, title: string): string {
  const stripped = html.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta[^>]+(property="og:|name="twitter:|name="description")[^>]*>\s*/gi, '')
  const block = `<title>${esc(title)}</title>\n${tags}\n`
  // As early in <head> as possible (right after the charset line): some crawlers read only the first part of the page.
  const charset = stripped.match(/<meta[^>]+charset[^>]*>/i)
  if (charset) return stripped.replace(charset[0], `${charset[0]}\n${block}`)
  return stripped.replace('<head>', `<head>\n${block}`)
}

async function handle(req: any, res: any) {
  const slug = cleanSlug(req.query?.slug)
  const code = String(req.query?.to ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.invytory.com')
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0]
  const origin = `${proto}://${host}`

  // Start loading the page's own HTML at the same time as the database lookup: WhatsApp gives up quickly.
  const pagePromise = req.query?.image ? null : fetch(`${origin}/index.html`).then((r) => r.text())
  pagePromise?.catch(() => undefined)
  const invite = await loadInvite(slug)
  const guest = invite && code ? await loadGuestName(code) : ''

  if (req.query?.image) {
    try {
      const jpeg = await renderImage(invite ?? { names: 'You are invited', label: 'Invitation', heroImage: null, when: '', where: '' }, guest, origin)
      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800')
      res.status(200).send(jpeg)
    } catch (err) {
      console.error('[invite-share] image failed:', err)
      res.status(500).send('Could not make the picture.')
    }
    return
  }

  // The normal page: fetch the built index.html and add the sharing tags to it.
  let html = ''
  try {
    html = await pagePromise!
  } catch {
    res.status(500).send('Could not load the page.')
    return
  }

  if (invite) {
    const title = guest ? `${guest}, you are specially invited` : `${invite.label}: ${invite.names}`
    const description = guest
      ? `${invite.label}: ${invite.names}${invite.when ? `. ${invite.when}` : ''}. Tap to open your personal invitation.`
      : `${invite.when ? `${invite.when}${invite.where ? ` · ${invite.where}` : ''}. ` : ''}Tap to open the invitation, see the details and RSVP.`
    const image = `${origin}/api/invite-share?slug=${slug}&image=1${code ? `&to=${code}` : ''}`
    const url = `${origin}/invitation/${slug}`
    const tags = [
      `<meta name="description" content="${esc(description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Invytory" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(description)}" />`,
      `<meta property="og:url" content="${esc(url)}" />`,
      `<meta property="og:image" content="${esc(image)}" />`,
      `<meta property="og:image:secure_url" content="${esc(image)}" />`,
      `<meta property="og:image:type" content="image/jpeg" />`,
      `<meta property="og:image:alt" content="${esc(title)}" />`,
      `<meta property="og:image:width" content="${W}" />`,
      `<meta property="og:image:height" content="${H}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(title)}" />`,
      `<meta name="twitter:description" content="${esc(description)}" />`,
      `<meta name="twitter:image" content="${esc(image)}" />`,
    ].join('\n')
    html = injectHead(html, tags, title)
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(html)
}

/** Open /api/invite-share?debug=1 to see whether everything this needs is in place. */
async function debug(req: any, res: any) {
  const out: Record<string, unknown> = { supabaseConfigured: !!supabaseConfig() }
  const slug = cleanSlug(req.query?.slug)
  if (slug) {
    try { out.lookup = (await loadInvite(slug)) ?? 'not found (check the slug, and that the invitation is published)' } catch (e) { out.lookup = String(e).slice(0, 200) }
  }
  if (slug) {
    // Say exactly why a lookup fails: what the database answered for this slug.
    const cfg = supabaseConfig()
    if (cfg) {
      try {
        const r = await fetch(`${cfg.url}/rest/v1/weddings?slug=eq.${slug}&select=id,status,plan&limit=1`, { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } })
        const body = await r.text()
        out.weddingsQuery = { httpStatus: r.status, answer: body.slice(0, 300) }
        const r2 = await fetch(`${cfg.url}/rest/v1/invitations?slug=eq.${slug}&select=id,status&limit=1`, { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } })
        out.invitationsQuery = { httpStatus: r2.status, answer: (await r2.text()).slice(0, 300) }
      } catch (e) { out.queryError = String(e).slice(0, 200) }
    }
  }
  try { await import('sharp'); out.sharp = 'ok' } catch (e) { out.sharp = String(e).slice(0, 200) }
  try { await import('satori'); out.satori = 'ok' } catch (e) { out.satori = String(e).slice(0, 200) }
  out.font = (await loadFont('https://www.invytory.com')) ? 'ok' : 'missing'
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify(out, null, 2))
}

export default async function handler(req: any, res: any) {
  if (req.query?.debug) return debug(req, res)
  try {
    await handle(req, res)
  } catch (err) {
    console.error('[invite-share] failed:', err)
    if (res.headersSent) return
    if (req.query?.image) {
      res.status(500).send('Could not make the picture.')
      return
    }
    // Whatever goes wrong, the invitation itself must still open.
    try {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.invytory.com')
      const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0]
      const page = await fetch(`${proto}://${host}/index.html`)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).send(await page.text())
    } catch {
      res.status(500).send('Could not load the page.')
    }
  }
}
