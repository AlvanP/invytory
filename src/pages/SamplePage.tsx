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
    let frame = 0
    let last = 0
    let pausedUntil = performance.now() + 1800
    let y = 0
    const step = (now: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (now >= pausedUntil && max > 0) {
        const dt = Math.min(now - last, 64)
        y += dt * 0.045
        if (y >= max) {
          y = max
          pausedUntil = now + 2200
          window.scrollTo(0, y)
          // go back to the top gently, then pause on the cover
          frame = requestAnimationFrame(function back(t) {
            const d = Math.min(t - last, 64)
            last = t
            y = Math.max(0, y - d * 1.4)
            window.scrollTo(0, y)
            if (y > 0) frame = requestAnimationFrame(back)
            else {
              pausedUntil = performance.now() + 2200
              frame = requestAnimationFrame(step)
            }
          })
          last = now
          return
        }
        window.scrollTo(0, y)
      }
      last = now
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [auto, templateId])

  if (!invitation) return <p className="p-6 text-sm text-ink-soft">Sample not found.</p>
  return (
    <div className={auto ? '[&_*]:!cursor-default [&::-webkit-scrollbar]:hidden' : undefined}>
      {auto && <style>{`html{scrollbar-width:none} html::-webkit-scrollbar{display:none}`}</style>}
      <InvitationRenderer invitation={invitation} template={template} noScratch={!scratch} />
    </div>
  )
}
