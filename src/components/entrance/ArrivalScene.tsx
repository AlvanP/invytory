import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { DoorEntrance } from './DoorEntrance'

/**
 * The Transition Engine. The entrance sits as a full-screen overlay
 * above the invitation; tapping it triggers DoorEntrance's opening
 * animation, then this component fades the overlay out and reveals
 * the invitation underneath, which was already mounted (not
 * remounted), so scrolling starts smoothly with no flash or reload.
 */
export function ArrivalScene({
  tone,
  brideName,
  groomName,
  children,
}: {
  tone: CoverTone
  brideName: string
  groomName: string
  children: React.ReactNode
}) {
  const [exiting, setExiting] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  function handleOpen() {
    setExiting(true)
    // Matches the overlay's own fade-out duration below.
    setTimeout(() => setRevealed(true), 500)
  }

  return (
    <div className="relative">
      <div className={cn('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}>
        {children}
      </div>

      {!revealed && (
        <div
          className={cn(
            'fixed inset-0 z-50 animate-[entranceIn_0.6s_ease-out] transition-opacity duration-500',
            exiting && 'pointer-events-none opacity-0'
          )}
        >
          <DoorEntrance tone={tone} brideName={brideName} groomName={groomName} onOpen={handleOpen} />
        </div>
      )}

      <style>{`
        @keyframes entranceIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}