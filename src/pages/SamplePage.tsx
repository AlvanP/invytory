import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getTemplateById } from '@/data/templates'
import { getSampleInvitation } from '@/data/sampleInvitations'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'

/**
 * A bare invitation with sample content, meant to sit inside a phone mockup (an iframe).
 *   ?auto=1     scrolls by itself, pauses at the bottom, then starts again
 *   ?scratch=1  keeps the scratch-to-reveal date (otherwise the date is shown)
 */
export function SamplePage() {
  const { templateId = '' } = useParams<{ templateId: string }>()
  const [params] = useSearchParams()
  const auto = params.get('auto') === '1'
  const scratch = params.get('scratch') === '1'
  const template = getTemplateById(templateId)
  const invitation = useMemo(() => getSampleInvitation(templateId), [templateId])

  useEffect(() => {
    if (!auto) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // The site scrolls smoothly by default; scrolling by hand every frame would fight that and stutter.
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    const SPEED = 0.06 // pixels per millisecond going down
    const BACK = 1.1 // pixels per millisecond going back up
    let frame = 0
    let last = performance.now()
    let y = 0
    let mode: 'wait' | 'down' | 'up' = 'wait'
    let waitUntil = last + 1800
    let paused = false

    const onMessage = (e: MessageEvent) => {
      if (e.data === 'invytory:pause') paused = true
      if (e.data === 'invytory:play') {
        paused = false
        last = performance.now()
      }
    }
    window.addEventListener('message', onMessage)

    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      const dt = Math.min(now - last, 50)
      last = now
      if (paused) return
      const max = root.scrollHeight - window.innerHeight
      if (max <= 0) return
      if (mode === 'wait') {
        if (now >= waitUntil) mode = y > 0 ? 'up' : 'down'
        return
      }
      if (mode === 'down') {
        y = Math.min(max, y + dt * SPEED)
        if (y >= max) {
          mode = 'wait'
          waitUntil = now + 2200
        }
      } else {
        // ease out as it reaches the top
        const remaining = y
        y = Math.max(0, y - dt * Math.max(0.25, Math.min(BACK, remaining / 700)))
        if (y <= 0) {
          mode = 'wait'
          waitUntil = now + 2200
        }
      }
      window.scrollTo({ top: Math.round(y), behavior: 'instant' })
    }
    frame = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('message', onMessage)
      root.style.scrollBehavior = previous
    }
  }, [auto, templateId])

  if (!invitation) return <p className="p-6 text-sm text-ink-soft">Sample not found.</p>
  return (
    <div className={auto ? '[&_*]:!cursor-default [&::-webkit-scrollbar]:hidden' : undefined}>
      {auto && (
        <style>{`html{scrollbar-width:none;scroll-behavior:auto!important} html::-webkit-scrollbar{display:none}
          /* the shine on each letter is costly to repaint, so the moving samples go without it */
          .iv-letter{animation:none!important;background:none!important;color:var(--iv-on-main)!important}`}</style>
      )}
      <InvitationRenderer invitation={invitation} template={template} noScratch={!scratch} />
    </div>
  )
}
