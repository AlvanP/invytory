import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getTemplateById } from '@/data/templates'
import { getSampleInvitation } from '@/data/sampleInvitations'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { ArrivalScene } from '@/components/entrance/ArrivalScene'

/**
 * A bare invitation with sample content, meant to sit inside a phone mockup (an iframe).
 *   ?entrance=1 starts with the design's own entrance
 *   ?auto=1     plays by itself: the entrance opens, the invitation scrolls to the end, then it all starts again
 *   ?scratch=1  keeps the scratch-to-reveal date (otherwise the date is shown)
 */
export function SamplePage() {
  const { templateId = '' } = useParams<{ templateId: string }>()
  const [params] = useSearchParams()
  const auto = params.get('auto') === '1'
  const scratch = params.get('scratch') === '1'
  const entrance = params.get('entrance') === '1'
  const template = getTemplateById(templateId)
  const invitation = useMemo(() => getSampleInvitation(templateId), [templateId])
  // Bumped each time the sample starts over, so the entrance plays from the beginning.
  const [run, setRun] = useState(0)
  const revealedRef = useRef(!entrance)
  const onRevealed = useCallback(() => {
    revealedRef.current = true
  }, [])

  useEffect(() => {
    if (!auto) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // The site scrolls smoothly by default; scrolling by hand every frame would fight that and stutter.
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    const SPEED = 0.06 * (Number(params.get('speed')) || 1) // pixels per millisecond going down (?speed= is for testing)
    const BACK = 1.1 // pixels per millisecond going back up (only when there is no entrance)
    let frame = 0
    let last = performance.now()
    let y = 0
    let mode: 'wait' | 'down' | 'up' = 'wait'
    let waitUntil = last + 1800
    let paused = false
    let wasRevealed = revealedRef.current

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
      // While the entrance is showing there is nothing to scroll.
      if (!revealedRef.current) {
        wasRevealed = false
        return
      }
      if (!wasRevealed) {
        // The entrance has just opened: give the invitation a moment, then start scrolling.
        wasRevealed = true
        y = 0
        window.scrollTo({ top: 0, behavior: 'instant' })
        mode = 'wait'
        waitUntil = now + 1500
        return
      }
      const max = root.scrollHeight - window.innerHeight
      if (max <= 0) return
      if (mode === 'wait') {
        if (now < waitUntil) return
        if (y >= max && entrance) {
          // Reached the end: start over from the entrance.
          revealedRef.current = false
          wasRevealed = false
          y = 0
          window.scrollTo({ top: 0, behavior: 'instant' })
          setRun((n) => n + 1)
          return
        }
        mode = y > 0 ? 'up' : 'down'
        return
      }
      if (mode === 'down') {
        y = Math.min(max, y + dt * SPEED)
        if (y >= max) {
          mode = 'wait'
          waitUntil = now + 2400
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, entrance, templateId])

  if (!invitation) return <p className="p-6 text-sm text-ink-soft">Sample not found.</p>
  const body = <InvitationRenderer invitation={invitation} template={template} noScratch={!scratch} />
  return (
    <div className={auto ? '[&_*]:!cursor-default [&::-webkit-scrollbar]:hidden' : undefined}>
      {auto && (
        <style>{`html{scrollbar-width:none;scroll-behavior:auto!important} html::-webkit-scrollbar{display:none}
          /* the shine on each letter is costly to repaint, so the moving samples go without it */
          .iv-letter{animation:none!important;background:none!important;color:var(--iv-on-main)!important}`}</style>
      )}
      {entrance ? (
        <ArrivalScene
          key={run}
          tone={template?.previewTone ?? 'classic'}
          templateId={template?.id}
          brideName={invitation.brideName ?? ''}
          groomName={invitation.groomName ?? ''}
          autoOpenMs={auto ? 1900 : undefined}
          onRevealed={onRevealed}
        >
          {body}
        </ArrivalScene>
      ) : (
        body
      )}
    </div>
  )
}
