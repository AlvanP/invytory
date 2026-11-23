import { ensureFonts, fontFamily, type FontId } from '@/templates/fontKits'

/**
 * Thank-you cards, drawn on a canvas so they can be saved as a real JPG for WhatsApp or email.
 * Eight designs, each its own composition (not one layout in eight colours). Every design is drawn
 * at 1080 x 1350 and scaled down for the previews.
 */

export const CARD_W = 1080
export const CARD_H = 1350

export type CardDesignId = 'overlay' | 'pure' | 'arch' | 'polaroid' | 'block' | 'matte' | 'glass' | 'midnight'

export interface CardDesignInfo {
  id: CardDesignId
  name: string
  note: string
}

export const CARD_DESIGNS: CardDesignInfo[] = [
  { id: 'overlay', name: 'Golden Overlay', note: 'Full photo, words on the photo' },
  { id: 'pure', name: 'Pure White', note: 'Photo above, words on white' },
  { id: 'arch', name: 'Arch & Sprigs', note: 'Arched photo on warm paper' },
  { id: 'polaroid', name: 'Polaroid', note: 'A taped instant photo' },
  { id: 'block', name: 'Colour Block', note: 'Photo over a block of colour' },
  { id: 'matte', name: 'Gallery Print', note: 'A framed print with a caption panel' },
  { id: 'glass', name: 'Frosted Glass', note: 'Words on a frosted panel' },
  { id: 'midnight', name: 'Midnight Gold', note: 'Dark and gold, round portrait' },
]

export interface CardContent {
  /** The photo, already loaded. */
  image: CanvasImageSource & { width: number; height: number }
  /** The small line above "Thank you". */
  kicker: string
  message: string
  /** Who it is from, e.g. "Mirabel & Gabriel". */
  from: string
  /** The colour of the day, #RRGGBB. */
  colour: string
}

const SCRIPT: FontId = 'greatVibes'
const SCRIPT2: FontId = 'sacramento'
const SERIF: FontId = 'cormorant'
const DISPLAY: FontId = 'playfair'
const CAPS: FontId = 'cinzel'
const SANS: FontId = 'jost'

/** Loads every font the cards use. Call once before drawing. */
export function loadCardFonts(): Promise<void> {
  return ensureFonts([SCRIPT, SCRIPT2, SERIF, DISPLAY, CAPS, SANS])
}

// ── colour helpers ──────────────────────────────────────────────────────────

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const v = parseInt(n, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const toHex = (c: number[]) => `#${c.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')}`
/** Mixes `a` toward `b` by `t` (0 = a, 1 = b). */
function mix(a: string, b: string, t: number): string {
  const x = rgb(a)
  const y = rgb(b)
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t])
}
const lighten = (c: string, t: number) => mix(c, '#ffffff', t)
const darken = (c: string, t: number) => mix(c, '#000000', t)
function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const alpha = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// ── drawing helpers ─────────────────────────────────────────────────────────

type Ctx = CanvasRenderingContext2D

const font = (id: FontId, px: number, style = '') => `${style ? `${style} ` : ''}${px}px ${fontFamily(id)}, Georgia, serif`

/** Draws the image to fill a box (like CSS object-fit: cover). `focusY` keeps faces in frame. */
function cover(ctx: Ctx, img: CardContent['image'], x: number, y: number, w: number, h: number, focusY = 0.38) {
  const iw = img.width
  const ih = img.height
  const s = Math.max(w / iw, h / ih)
  const dw = iw * s
  const dh = ih * s
  const dx = x - (dw - w) / 2
  const dy = y - (dh - h) * focusY
  ctx.drawImage(img, dx, dy, dw, dh)
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** An arch: round top, straight sides. (x, y) is the top-left of its bounding box. */
function archPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, 0)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

/** Text with letter spacing, drawn letter by letter so it works in every browser. */
function spaced(ctx: Ctx, text: string, cx: number, y: number, spacing: number, align: 'center' | 'left' = 'center') {
  const chars = Array.from(text)
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = align === 'center' ? cx - total / 2 : cx
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y)
    x += widths[i] + spacing
  })
  ctx.textAlign = prev
}

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line)
        line = word
      } else line = test
    }
    lines.push(line)
  }
  return lines
}

/**
 * Writes a paragraph that shrinks until it fits the box. Returns the y just under the text.
 * `fontOf(px)` gives the font string for a size.
 */
function paragraph(ctx: Ctx, text: string, cx: number, top: number, maxW: number, maxH: number, fontOf: (px: number) => string, startPx: number, lineHeight = 1.32, minPx = 26): number {
  let px = startPx
  let lines: string[] = []
  for (;;) {
    ctx.font = fontOf(px)
    lines = wrap(ctx, text, maxW)
    if (lines.length * px * lineHeight <= maxH || px <= minPx) break
    px -= 2
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  lines.forEach((l, i) => ctx.fillText(l, cx, top + px * (1 + i * lineHeight) * 0.98 - (lineHeight - 1) * px * 0.2))
  return top + lines.length * px * lineHeight
}

function hairline(ctx: Ctx, cx: number, y: number, w: number, colour: string, diamond = true) {
  ctx.save()
  ctx.strokeStyle = colour
  ctx.fillStyle = colour
  ctx.lineWidth = 2
  const gap = diamond ? 18 : 0
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, y)
  ctx.lineTo(cx - gap, y)
  ctx.moveTo(cx + gap, y)
  ctx.lineTo(cx + w / 2, y)
  ctx.stroke()
  if (diamond) {
    ctx.beginPath()
    ctx.moveTo(cx, y - 7)
    ctx.lineTo(cx + 7, y)
    ctx.lineTo(cx, y + 7)
    ctx.lineTo(cx - 7, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

/** A tiny seeded random, so soft textures are the same on every draw. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** A leafy sprig growing from (x, y), curling up and to `dir` (1 = right, -1 = left). */
function sprig(ctx: Ctx, x: number, y: number, dir: 1 | -1, size: number, leaf: string, stem: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(dir, 1)
  ctx.strokeStyle = stem
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(size * 0.15, -size * 0.35, size * 0.1, -size * 0.7, size * 0.38, -size)
  ctx.stroke()
  const leaves: Array<[number, number, number, number]> = [
    [0.08, -0.16, -55, 0.2],
    [0.14, -0.3, 35, 0.19],
    [0.12, -0.46, -60, 0.18],
    [0.17, -0.6, 30, 0.17],
    [0.24, -0.76, -50, 0.15],
    [0.31, -0.88, 28, 0.13],
  ]
  ctx.fillStyle = leaf
  for (const [lx, ly, rot, ls] of leaves) {
    ctx.save()
    ctx.translate(size * lx, size * ly)
    ctx.rotate((rot * Math.PI) / 180)
    const L = size * ls
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(L * 0.3, -L * 0.45, L * 0.85, -L * 0.4, L, 0)
    ctx.bezierCurveTo(L * 0.85, L * 0.4, L * 0.3, L * 0.45, 0, 0)
    ctx.fill()
    ctx.restore()
  }
  // a small bloom at the tip
  ctx.translate(size * 0.38, -size)
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -size * 0.045, size * 0.026, size * 0.045, 0, 0, Math.PI * 2)
    ctx.fillStyle = stem
    ctx.globalAlpha = 0.85
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

/** Paper grain: very light specks, so flat colours look printed rather than digital. */
function grain(ctx: Ctx, w: number, h: number, tone: string, amount = 900, seed = 7) {
  const r = rng(seed)
  ctx.save()
  ctx.fillStyle = tone
  for (let i = 0; i < amount; i++) {
    ctx.globalAlpha = 0.03 + r() * 0.05
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5)
  }
  ctx.restore()
}

// ── the eight designs ───────────────────────────────────────────────────────

function drawOverlay(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  cover(ctx, c.image, 0, 0, W, H, 0.3)
  const g = ctx.createLinearGradient(0, H * 0.32, 0, H)
  g.addColorStop(0, 'rgba(10,6,8,0)')
  g.addColorStop(0.55, 'rgba(10,6,8,0.62)')
  g.addColorStop(1, 'rgba(10,6,8,0.9)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const top = ctx.createLinearGradient(0, 0, 0, 220)
  top.addColorStop(0, 'rgba(10,6,8,0.35)')
  top.addColorStop(1, 'rgba(10,6,8,0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, W, 220)

  const gold = lighten(c.colour, 0.55)
  ctx.strokeStyle = alpha('#ffffff', 0.55)
  ctx.lineWidth = 2
  ctx.strokeRect(34, 34, W - 68, H - 68)
  ctx.strokeStyle = alpha(gold, 0.55)
  ctx.strokeRect(48, 48, W - 96, H - 96)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = gold
  ctx.font = font(CAPS, 26)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, 704, 7)

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 4
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = font(SCRIPT, 200)
  ctx.fillText('Thank You', W / 2, 912)
  ctx.restore()

  hairline(ctx, W / 2, 1010, 300, gold)
  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  const end = paragraph(ctx, c.message, W / 2, 1034, 780, 140, (px) => font(SERIF, px, 'italic'), 38, 1.3, 28)
  ctx.fillStyle = gold
  ctx.font = font(CAPS, 28)
  ctx.textAlign = 'center'
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 56, 1222), H - 70), 6)
}

function drawPure(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  const x = 64
  const y = 64
  const w = W - 128
  const h = 800
  ctx.save()
  ctx.shadowColor = 'rgba(40,20,30,0.28)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 16
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, w, h)
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  cover(ctx, c.image, x, y, w, h, 0.32)
  ctx.restore()
  ctx.strokeStyle = alpha(c.colour, 0.55)
  ctx.lineWidth = 2
  ctx.strokeRect(x + 18, y + 18, w - 36, h - 36)

  ctx.textAlign = 'center'
  ctx.fillStyle = darken(c.colour, 0.15)
  ctx.font = font(SCRIPT, 158)
  ctx.fillText('Thank You', W / 2, 1068)
  ctx.fillStyle = alpha(darken(c.colour, 0.2), 0.8)
  ctx.font = font(CAPS, 22)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, 912, 7)
  ctx.fillStyle = '#3b3236'
  const end = paragraph(ctx, c.message, W / 2, 1136, 800, 104, (px) => font(SERIF, px, 'italic'), 34, 1.26, 26)
  hairline(ctx, W / 2, Math.max(end + 20, 1258), 220, c.colour)
  ctx.fillStyle = darken(c.colour, 0.1)
  ctx.font = font(CAPS, 25)
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 66, 1302), H - 30), 6)
}

function drawArch(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  const paper = mix('#FBF6EE', c.colour, 0.06)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, darken(c.colour, 0.5), 1400)
  const pw = 640
  const ph = 810
  const px = (W - pw) / 2
  const py = 96
  // soft glow behind the arch
  const glow = ctx.createRadialGradient(W / 2, py + ph / 2, 120, W / 2, py + ph / 2, 620)
  glow.addColorStop(0, alpha(lighten(c.colour, 0.6), 0.45))
  glow.addColorStop(1, alpha(lighten(c.colour, 0.6), 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  // double gold outline
  ctx.strokeStyle = alpha(c.colour, 0.7)
  ctx.lineWidth = 3
  archPath(ctx, px - 26, py - 26, pw + 52, ph + 52)
  ctx.stroke()
  ctx.lineWidth = 1.5
  archPath(ctx, px - 42, py - 42, pw + 84, ph + 84)
  ctx.stroke()
  ctx.save()
  ctx.shadowColor = 'rgba(60,30,40,0.3)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 14
  archPath(ctx, px, py, pw, ph)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()
  ctx.save()
  archPath(ctx, px, py, pw, ph)
  ctx.clip()
  cover(ctx, c.image, px, py, pw, ph, 0.3)
  ctx.restore()
  // sprigs at the foot of the arch
  const leaf = mix('#7E9A72', c.colour, 0.12)
  const stem = c.colour
  sprig(ctx, px - 8, py + ph + 24, -1, 330, leaf, stem)
  sprig(ctx, px + pw + 8, py + ph + 24, 1, 330, leaf, stem)

  ctx.textAlign = 'center'
  ctx.fillStyle = darken(c.colour, 0.2)
  ctx.font = font(CAPS, 22)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, py + ph + 62, 7)
  ctx.font = font(SCRIPT, 138)
  ctx.fillText('Thank You', W / 2, py + ph + 200)
  ctx.fillStyle = '#4a3f43'
  const end = paragraph(ctx, c.message, W / 2, py + ph + 250, 780, 100, (px2) => font(SERIF, px2, 'italic'), 33, 1.25, 25)
  ctx.fillStyle = darken(c.colour, 0.1)
  ctx.font = font(CAPS, 24)
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 44, py + ph + 340), H - 36), 6)
}

function drawPolaroid(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  const base = lighten(c.colour, 0.82)
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, lighten(c.colour, 0.9))
  g.addColorStop(1, lighten(c.colour, 0.7))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // soft round highlights, like out-of-focus lights
  const r = rng(11)
  for (let i = 0; i < 16; i++) {
    const x = r() * W
    const y = r() * H
    const rad = 30 + r() * 90
    const rg = ctx.createRadialGradient(x, y, 0, x, y, rad)
    rg.addColorStop(0, alpha('#ffffff', 0.55))
    rg.addColorStop(1, alpha('#ffffff', 0))
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  void base

  ctx.save()
  ctx.translate(W / 2, 560)
  ctx.rotate((-3.2 * Math.PI) / 180)
  const fw = 800
  const fh = 940
  ctx.shadowColor = 'rgba(40,20,30,0.38)'
  ctx.shadowBlur = 50
  ctx.shadowOffsetY = 26
  ctx.fillStyle = '#fffdfa'
  ctx.fillRect(-fw / 2, -fh / 2, fw, fh)
  ctx.shadowColor = 'transparent'
  const m = 44
  ctx.save()
  ctx.beginPath()
  ctx.rect(-fw / 2 + m, -fh / 2 + m, fw - m * 2, fw - m * 2)
  ctx.clip()
  cover(ctx, c.image, -fw / 2 + m, -fh / 2 + m, fw - m * 2, fw - m * 2, 0.3)
  // a faint matte film look
  ctx.fillStyle = alpha(c.colour, 0.06)
  ctx.fillRect(-fw / 2 + m, -fh / 2 + m, fw - m * 2, fw - m * 2)
  ctx.restore()
  ctx.textAlign = 'center'
  ctx.fillStyle = darken(c.colour, 0.35)
  ctx.font = font(SCRIPT2, 118)
  ctx.fillText('Thank you!', 0, fh / 2 - 66)
  // tape
  ctx.fillStyle = alpha('#f4ead2', 0.82)
  ctx.save()
  ctx.translate(0, -fh / 2 + 6)
  ctx.rotate((2.5 * Math.PI) / 180)
  ctx.fillRect(-110, -26, 220, 52)
  ctx.strokeStyle = alpha('#c8b68a', 0.5)
  ctx.lineWidth = 1
  ctx.strokeRect(-110, -26, 220, 52)
  ctx.restore()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.fillStyle = darken(c.colour, 0.4)
  const end = paragraph(ctx, c.message, W / 2, 1066, 800, 150, (px) => font(SANS, px), 31, 1.42, 24)
  ctx.fillStyle = darken(c.colour, 0.25)
  ctx.font = font(CAPS, 24)
  spaced(ctx, `—  ${c.from.toUpperCase()}  —`, W / 2, Math.min(Math.max(end + 56, 1250), H - 40), 5)
}

function drawBlock(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  const deep = luminance(c.colour) > 0.5 ? darken(c.colour, 0.45) : c.colour
  const split = 800
  cover(ctx, c.image, 0, 0, W, split, 0.32)
  // colour block with a soft curved top edge
  ctx.fillStyle = deep
  ctx.beginPath()
  ctx.moveTo(0, split + 40)
  ctx.quadraticCurveTo(W / 2, split - 60, W, split + 40)
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.closePath()
  ctx.fill()
  grain(ctx, W, H, '#ffffff', 700, 21)
  // inner border on the block
  ctx.strokeStyle = alpha('#ffffff', 0.28)
  ctx.lineWidth = 2
  ctx.strokeRect(46, split + 110, W - 92, H - split - 156)
  const ink = '#ffffff'
  const soft = lighten(deep, 0.7)
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.font = font(DISPLAY, 96)
  spaced(ctx, 'THANK YOU', W / 2, split + 212, 14)
  ctx.fillStyle = soft
  ctx.font = font(CAPS, 22)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, split + 262, 7)
  ctx.fillStyle = 'rgba(255,255,255,0.93)'
  const end = paragraph(ctx, c.message, W / 2, split + 292, 800, 140, (px) => font(SERIF, px, 'italic'), 36, 1.28, 27)
  ctx.fillStyle = soft
  ctx.font = font(CAPS, 24)
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 54, split + 440), H - 70), 6)
  // a round seal where the photo meets the colour
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(W / 2, split - 12, 64, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = deep
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W / 2, split - 12, 54, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = deep
  ctx.font = font(SCRIPT, 78)
  ctx.textAlign = 'center'
  ctx.fillText('♥', W / 2, split + 8)
}

function drawMatte(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  ctx.fillStyle = '#f7f4ef'
  ctx.fillRect(0, 0, W, H)
  const m = 54
  ctx.save()
  ctx.beginPath()
  ctx.rect(m, m, W - m * 2, H - m * 2)
  ctx.clip()
  cover(ctx, c.image, m, m, W - m * 2, H - m * 2, 0.3)
  ctx.restore()
  ctx.strokeStyle = alpha(c.colour, 0.9)
  ctx.lineWidth = 2
  ctx.strokeRect(m - 14, m - 14, W - (m - 14) * 2, H - (m - 14) * 2)
  // caption panel
  const ph = 470
  const py = H - m - ph
  ctx.fillStyle = '#fffdfb'
  ctx.fillRect(m, py, W - m * 2, ph)
  ctx.strokeStyle = alpha(c.colour, 0.5)
  ctx.lineWidth = 1.5
  ctx.strokeRect(m + 22, py + 22, W - (m + 22) * 2, ph - 44)
  ctx.textAlign = 'center'
  ctx.fillStyle = darken(c.colour, 0.2)
  ctx.font = font(CAPS, 21)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, py + 82, 7)
  ctx.fillStyle = '#2f2629'
  ctx.font = font(SERIF, 150, 'italic')
  ctx.fillText('Thank you', W / 2, py + 214)
  ctx.fillStyle = '#4a3f43'
  const end = paragraph(ctx, c.message, W / 2, py + 262, 760, 92, (px) => font(SERIF, px, 'italic'), 32, 1.24, 25)
  hairline(ctx, W / 2, Math.min(end + 16, py + ph - 70), 180, c.colour)
  ctx.fillStyle = darken(c.colour, 0.1)
  ctx.font = font(CAPS, 22)
  spaced(ctx, c.from.toUpperCase(), W / 2, py + ph - 38, 6)
}

function drawGlass(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  cover(ctx, c.image, 0, 0, W, H, 0.3)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(0, 0, W, H)
  const px = 80
  const py = 740
  const pw = W - 160
  const ph = 510
  // blur the photo behind the panel: shrink it, then draw it back up
  const small = document.createElement('canvas')
  small.width = Math.round(W / 24)
  small.height = Math.round(H / 24)
  const sctx = small.getContext('2d')
  if (sctx) {
    cover(sctx, c.image, 0, 0, small.width, small.height, 0.3)
    ctx.save()
    roundRect(ctx, px, py, pw, ph, 44)
    ctx.clip()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(small, 0, 0, W, H)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(px, py, pw, ph)
    const sheen = ctx.createLinearGradient(px, py, px + pw, py + ph)
    sheen.addColorStop(0, 'rgba(255,255,255,0.28)')
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.04)')
    sheen.addColorStop(1, 'rgba(255,255,255,0.14)')
    ctx.fillStyle = sheen
    ctx.fillRect(px, py, pw, ph)
    ctx.restore()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 2
  roundRect(ctx, px, py, pw, ph, 44)
  ctx.stroke()
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 3
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = font(CAPS, 21)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, py + 66, 7)
  ctx.font = font(SCRIPT, 150)
  ctx.fillText('Thank You', W / 2, py + 212)
  ctx.font = font(SERIF, 36, 'italic')
  const end = paragraph(ctx, c.message, W / 2, py + 262, pw - 120, 112, (p) => font(SERIF, p, 'italic'), 34, 1.26, 26)
  ctx.font = font(CAPS, 24)
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 46, py + 408), py + ph - 32), 6)
  ctx.restore()
}

function drawMidnight(ctx: Ctx, c: CardContent) {
  const W = CARD_W
  const H = CARD_H
  const night = mix('#120E10', c.colour, 0.16)
  const g = ctx.createRadialGradient(W / 2, 520, 80, W / 2, 620, 900)
  g.addColorStop(0, lighten(night, 0.1))
  g.addColorStop(1, night)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const gold = mix('#D9B66A', c.colour, 0.15)
  const goldLight = lighten(gold, 0.4)
  // fine rays behind the portrait
  ctx.save()
  ctx.translate(W / 2, 520)
  ctx.strokeStyle = alpha(gold, 0.13)
  ctx.lineWidth = 1.5
  for (let a = 0; a < 360; a += 6) {
    ctx.beginPath()
    ctx.moveTo(Math.cos((a * Math.PI) / 180) * 340, Math.sin((a * Math.PI) / 180) * 340)
    ctx.lineTo(Math.cos((a * Math.PI) / 180) * 520, Math.sin((a * Math.PI) / 180) * 520)
    ctx.stroke()
  }
  ctx.restore()
  // corner ornaments
  ctx.strokeStyle = alpha(gold, 0.75)
  ctx.lineWidth = 2
  const o = 54
  const L = 120
  for (const [x, y, sx, sy] of [
    [o, o, 1, 1],
    [W - o, o, -1, 1],
    [o, H - o, 1, -1],
    [W - o, H - o, -1, -1],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(x, y + sy * L)
    ctx.lineTo(x, y)
    ctx.lineTo(x + sx * L, y)
    ctx.stroke()
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.moveTo(x + sx * 20, y + sy * 20)
    ctx.lineTo(x + sx * 28, y + sy * 12)
    ctx.lineTo(x + sx * 36, y + sy * 20)
    ctx.lineTo(x + sx * 28, y + sy * 28)
    ctx.closePath()
    ctx.fill()
  }
  // round portrait with a double gold ring
  const cx = W / 2
  const cy = 520
  const rad = 300
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 16
  ctx.beginPath()
  ctx.arc(cx, cy, rad, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, rad, 0, Math.PI * 2)
  ctx.clip()
  cover(ctx, c.image, cx - rad, cy - rad, rad * 2, rad * 2, 0.3)
  ctx.restore()
  const ring = ctx.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad)
  ring.addColorStop(0, goldLight)
  ring.addColorStop(0.5, gold)
  ring.addColorStop(1, goldLight)
  ctx.strokeStyle = ring
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, rad + 14, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, rad + 34, 0, Math.PI * 2)
  ctx.stroke()

  ctx.textAlign = 'center'
  const tg = ctx.createLinearGradient(0, 890, 0, 1010)
  tg.addColorStop(0, goldLight)
  tg.addColorStop(1, gold)
  ctx.fillStyle = tg
  ctx.font = font(SCRIPT, 150)
  ctx.fillText('Thank You', W / 2, 1008)
  ctx.fillStyle = gold
  ctx.font = font(CAPS, 22)
  spaced(ctx, c.kicker.toUpperCase(), W / 2, 876, 7)
  ctx.fillStyle = '#efe6d6'
  const end = paragraph(ctx, c.message, W / 2, 1074, 780, 116, (px) => font(SERIF, px, 'italic'), 34, 1.26, 26)
  ctx.fillStyle = gold
  ctx.font = font(CAPS, 25)
  spaced(ctx, c.from.toUpperCase(), W / 2, Math.min(Math.max(end + 50, 1240), H - 96), 6)
}

const DRAW: Record<CardDesignId, (ctx: Ctx, c: CardContent) => void> = {
  overlay: drawOverlay,
  pure: drawPure,
  arch: drawArch,
  polaroid: drawPolaroid,
  block: drawBlock,
  matte: drawMatte,
  glass: drawGlass,
  midnight: drawMidnight,
}

/** Draws one card onto a canvas. `scale` shrinks it for previews (1 = full 1080 x 1350). */
export function drawCard(canvas: HTMLCanvasElement, design: CardDesignId, content: CardContent, scale = 1): void {
  canvas.width = Math.round(CARD_W * scale)
  canvas.height = Math.round(CARD_H * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.save()
  ctx.scale(scale, scale)
  ctx.imageSmoothingQuality = 'high'
  DRAW[design](ctx, content)
  ctx.restore()
}

/** The finished card as a JPG file, ready to share or save. */
export async function cardToFile(design: CardDesignId, content: CardContent, fileName: string): Promise<File> {
  const canvas = document.createElement('canvas')
  drawCard(canvas, design, content, 1)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Could not make the picture.')
  return new File([blob], fileName, { type: 'image/jpeg' })
}

/** Loads a picture for the canvas. Goes through a blob so the canvas stays exportable. */
export async function loadCardImage(url: string): Promise<HTMLImageElement> {
  let src = url
  let revoke: string | null = null
  if (!url.startsWith('blob:') && !url.startsWith('data:')) {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error('That photo could not be loaded.')
    revoke = URL.createObjectURL(await res.blob())
    src = revoke
  }
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('That photo could not be opened.'))
      img.src = src
    })
  } finally {
    if (revoke) window.setTimeout(() => URL.revokeObjectURL(revoke as string), 5000)
  }
}

// ── wording ────────────────────────────────────────────────────────────────

type Kind = 'wedding' | 'child-dedication' | 'birthday' | 'corporate' | 'funeral'

export const KICKERS: Record<Kind, string> = {
  wedding: 'With grateful hearts',
  'child-dedication': 'With grateful hearts',
  birthday: 'From my heart to yours',
  corporate: 'With sincere appreciation',
  funeral: 'With deep gratitude',
}

const MESSAGES: Record<Kind, string[]> = {
  wedding: [
    'Thank you for celebrating our special day with us. Your love, your presence and your kind wishes made it unforgettable.',
    'Our hearts are full. Thank you for being part of the happiest day of our lives.',
    'Thank you for the love, the laughter and the memories. We could not have asked for a better crowd.',
  ],
  'child-dedication': [
    'Thank you for joining us as we dedicated our precious child to God. Your prayers and your love mean the world to our family.',
    'We are so grateful for every prayer, gift and kind word. Thank you for standing with us on this special day.',
  ],
  birthday: [
    'Thank you for making my day so special! Your love, your gifts and your good wishes made it a birthday to remember.',
    'I am grateful for every call, message and hug. Thank you for celebrating with me!',
  ],
  corporate: [
    'Thank you for being part of our event. Your presence and contributions made it a success, and we look forward to seeing you again.',
    'We appreciate you taking the time to join us. Thank you for making the day a memorable one.',
  ],
  funeral: [
    'Thank you for standing with our family in our time of loss. Your prayers, your presence and your support have comforted us deeply.',
    'The family is grateful for every kind word, visit and act of love shown during this difficult time. God bless you.',
  ],
}

export function messageFor(kind: Kind, index: number): string {
  const list = MESSAGES[kind] ?? MESSAGES.wedding
  return list[((index % list.length) + list.length) % list.length]
}

export const messageCount = (kind: Kind) => (MESSAGES[kind] ?? MESSAGES.wedding).length
