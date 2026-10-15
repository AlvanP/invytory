import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { RibbonBurst } from '@/components/invitation/RibbonBurst'
import { cn } from '@/utils/cn'

const BRUSH = 54 // a big brush, so scratching is easy
const DONE_AT = 0.4 // reveal automatically once this much is scratched off

/**
 * Hides `children` (the date) under a layer of gold. The guest scratches it away with a
 * finger or mouse. Once enough is gone the rest fades, a burst of ribbons plays, and
 * `onRevealed` is called. A "Reveal" button is also there for anyone who prefers not to scratch.
 */
export function ScratchReveal({
  children,
  prompt = 'Scratch to reveal the date',
  onRevealed,
}: {
  children: ReactNode
  prompt?: string
  onRevealed: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState<{ x: number; y: number; colours: string[] } | null>(null)

  // Paint the gold once, at the size the box actually is.
  useEffect(() => {
    const el = canvas.current
    const holder = box.current
    const ctx = el?.getContext('2d')
    if (!el || !holder || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { width: w, height: h } = holder.getBoundingClientRect()
    el.width = Math.round(w * dpr)
    el.height = Math.round(h * dpr)
    ctx.scale(dpr, dpr)

    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#8C6A2C')
    g.addColorStop(0.22, '#E9D08A')
    g.addColorStop(0.45, '#B89245')
    g.addColorStop(0.7, '#F4E1A4')
    g.addColorStop(1, '#9A7634')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // A little sparkle in the gold.
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.35})`
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8 + 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(70,45,10,0.78)'
    ctx.font = '600 13px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦  ' + prompt.toUpperCase() + '  ✦', w / 2, h / 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = useCallback(() => {
    if (done) return
    setDone(true)
    const rect = box.current?.getBoundingClientRect()
    const styles = box.current ? getComputedStyle(box.current) : null
    const main = styles?.getPropertyValue('--iv-main').trim() || '#B08D57'
    const accent = styles?.getPropertyValue('--iv-accent').trim() || '#9A7B4A'
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && rect) {
      setBurst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        colours: [main, accent, '#E9D08A', '#F4E1A4', '#FFFFFF', '#B89245'],
      })
    }
    onRevealed()
  }, [done, onRevealed])

  function cleared(): number {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return 0
    const data = ctx.getImageData(0, 0, el.width, el.height).data
    let total = 0
    let gone = 0
    const step = 6
    for (let y = 0; y < el.height; y += step) {
      for (let x = 0; x < el.width; x += step) {
        total++
        if (data[(y * el.width + x) * 4 + 3] < 40) gone++
      }
    }
    return total ? gone / total : 0
  }

  function point(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function scratch(e: React.PointerEvent) {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const p = point(e)
    const from = last.current ?? p
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = BRUSH
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    moves.current++
    if (moves.current % 10 === 0 && cleared() >= DONE_AT) finish()
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div ref={box} className="relative overflow-hidden rounded-md shadow-[0_12px_30px_-14px_rgba(60,40,10,0.55)]">
        <div className="flex min-h-[150px] flex-col items-center justify-center bg-[color:var(--iv-paper)] px-4 py-6 text-[color:var(--iv-ink)]">{children}</div>
        <canvas
          ref={canvas}
          aria-hidden
          onPointerDown={(e) => {
            drawing.current = true
            last.current = null
            e.currentTarget.setPointerCapture(e.pointerId)
            scratch(e)
          }}
          onPointerMove={(e) => drawing.current && scratch(e)}
          onPointerUp={() => {
            drawing.current = false
            last.current = null
            if (!done && cleared() >= DONE_AT) finish()
          }}
          onPointerCancel={() => {
            drawing.current = false
            last.current = null
          }}
          className={cn(
            'absolute inset-0 h-full w-full cursor-pointer touch-none transition-opacity duration-700',
            done ? 'pointer-events-none opacity-0' : 'opacity-100'
          )}
        />
      </div>
      {!done && (
        <button
          type="button"
          onClick={finish}
          className="mt-3 text-xs text-[color:var(--iv-ink)] underline underline-offset-2 opacity-60"
        >
          Or tap here to reveal
        </button>
      )}
      {burst && <RibbonBurst {...burst} onDone={() => setBurst(null)} />}
    </div>
  )
}
