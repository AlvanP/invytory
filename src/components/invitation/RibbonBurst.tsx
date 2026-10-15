import { useEffect, useRef } from 'react'

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  spin: number
  flutter: number
  colour: string
}

/**
 * A short starburst of gold rays followed by ribbons exploding across the screen.
 * Draws on a see-through canvas over the page, ignores taps, and removes itself when done.
 */
export function RibbonBurst({
  x,
  y,
  colours,
  onDone,
}: {
  /** Where it starts, in screen pixels. */
  x: number
  y: number
  colours: string[]
  onDone: () => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) {
      onDone()
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    el.width = w * dpr
    el.height = h * dpr
    ctx.scale(dpr, dpr)

    const pieces: Piece[] = Array.from({ length: 150 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 5 + Math.random() * 13
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        w: 5 + Math.random() * 5,
        h: 16 + Math.random() * 18,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        flutter: Math.random() * Math.PI * 2,
        colour: colours[Math.floor(Math.random() * colours.length)],
      }
    })

    const started = performance.now()
    const TOTAL = 3800
    let frame = 0

    const tick = (now: number) => {
      const t = now - started
      ctx.clearRect(0, 0, w, h)

      // Starburst: gold rays that grow out from the start point and fade.
      if (t < 900) {
        const k = t / 900
        const length = 40 + k * Math.max(w, h) * 0.55
        ctx.save()
        ctx.translate(x, y)
        ctx.globalAlpha = (1 - k) * 0.9
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2 + k * 0.4
          const grad = ctx.createLinearGradient(0, 0, Math.cos(a) * length, Math.sin(a) * length)
          grad.addColorStop(0, 'rgba(255,236,170,0.95)')
          grad.addColorStop(1, 'rgba(255,236,170,0)')
          ctx.strokeStyle = grad
          ctx.lineWidth = i % 2 ? 2 : 4
          ctx.beginPath()
          ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20)
          ctx.lineTo(Math.cos(a) * length, Math.sin(a) * length)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Ribbons: they fly out, then flutter down.
      const fade = t > TOTAL - 900 ? Math.max(0, (TOTAL - t) / 900) : 1
      for (const p of pieces) {
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 0.22
        p.x += p.vx
        p.y += p.vy
        p.rot += p.spin
        p.flutter += 0.2
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.flutter))
        ctx.fillStyle = p.colour
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (t < TOTAL) frame = requestAnimationFrame(tick)
      else onDone()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />
}
