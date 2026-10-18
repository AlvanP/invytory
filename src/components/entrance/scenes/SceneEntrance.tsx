import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { getTemplateById } from '@/data/templates'
import type { EntranceDesign } from './types'
import { SCENES } from './registry'
import './scenes.css'

const KICKERS: Record<string, string> = {
  wedding: 'You are invited',
  dedication: 'A blessing to share',
  birthday: 'Let’s celebrate',
  corporate: 'You are invited',
  funeral: 'In loving memory',
}

/** Shows a design's own opening scene, the words over it, and handles the tap. */
export function SceneEntrance({
  design,
  templateId,
  brideName,
  groomName,
  onOpen,
  onTap,
  autoOpenMs,
}: {
  design: EntranceDesign
  templateId?: string
  brideName: string
  groomName: string
  onOpen: () => void
  onTap?: () => void
  autoOpenMs?: number
}) {
  const [open, setOpen] = useState(false)
  const Scene = SCENES[design.scene]
  const category = getTemplateById(templateId)?.category ?? 'wedding'
  const names = groomName.trim() ? `${brideName.trim()} & ${groomName.trim()}` : brideName.trim()
  const initials = (groomName.trim() ? `${brideName.trim().charAt(0)}&${groomName.trim().charAt(0)}` : brideName.trim().charAt(0)).toUpperCase()
  const light = design.ink === 'light'

  function go() {
    if (open) return
    setOpen(true)
    onTap?.()
    try {
      navigator.vibrate?.(18)
    } catch {
      // not supported
    }
    window.setTimeout(onOpen, design.ms)
  }

  useEffect(() => {
    if (!autoOpenMs) return
    const t = window.setTimeout(go, autoOpenMs)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenMs])

  const shadow = light ? '0 2px 14px rgba(0,0,0,.55)' : '0 1px 10px rgba(255,255,255,.7)'
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <Scene open={open} go={go} d={design} initials={initials || 'I'} names={names} />

      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 transition-opacity duration-500', open && 'opacity-0')}
        style={{ background: light ? 'linear-gradient(rgba(0,0,0,.5), transparent)' : 'linear-gradient(rgba(255,255,255,.75), transparent)' }}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-40 flex flex-col items-center px-6 text-center transition-opacity duration-500',
          design.layout === 'center' ? 'justify-center gap-6' : 'justify-between py-[9vh]',
          light ? 'text-white' : 'text-ink',
          open && 'opacity-0'
        )}
        style={{ textShadow: shadow }}
      >
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.32em] opacity-90">{KICKERS[category] ?? KICKERS.wedding}</p>
          {design.layout !== 'hintonly' && (
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">{names}</h1>
          )}
        </div>
        <button
          type="button"
          onClick={go}
          className={cn(
            'pointer-events-auto rounded-full border px-6 py-3 text-xs uppercase tracking-[0.2em] backdrop-blur-sm transition-colors',
            light ? 'border-white/60 bg-black/15 hover:bg-white/15' : 'border-ink/50 bg-white/30 hover:bg-white/50'
          )}
        >
          {design.hint}
        </button>
      </div>
    </div>
  )
}
