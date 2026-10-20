import type { ReactNode } from 'react'
import { useDesign } from '@/templates/DesignContext'
import { cn } from '@/utils/cn'

/**
 * An icon badge, a small label and the information. Used across sections.
 * Card on a centred design, outlined inside a frame, and a plain ruled row on editorial and ledger designs.
 */
export function DetailCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  const body = useDesign().design.body ?? 'centered'
  const flat = body === 'editorial' || body === 'ledger'
  return (
    <div
      className={cn(
        'flex items-start gap-4 text-left',
        flat
          ? 'border-b border-[color:var(--iv-ink)]/15 py-4 first:border-t'
          : body === 'framed'
            ? 'rounded-sm border border-[color:var(--iv-main)]/30 bg-[color:var(--iv-paper)] p-5'
            : 'rounded-md bg-[color:var(--iv-paper)] p-5 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]'
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center',
          flat ? 'size-6 text-[color:var(--iv-accent)]' : 'size-11 rounded-full bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]'
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">{label}</p>
        <div className="mt-1 break-words text-base text-[color:var(--iv-ink)]">{children}</div>
      </div>
    </div>
  )
}
