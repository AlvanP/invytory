import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

/**
 * The "Section Reveal" module from the Animation Engine. Wrap any
 * piece of content in this and it fades + rises into place the first
 * time it scrolls into view. Isolated from page/section components —
 * swap this implementation for a GSAP-based one later without
 * touching InvitationSection, the gallery, or any page.
 */
export function RevealOnScroll({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
      style={{ transitionDelay: inView ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}