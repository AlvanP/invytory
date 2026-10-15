import type { ReactNode } from 'react'

/** A round colour badge with an icon, a small label and the information. Used across sections. */
export function DetailCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-md bg-[color:var(--iv-paper)] p-5 text-left shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">{label}</p>
        <div className="mt-1 break-words text-base text-[color:var(--iv-ink)]">{children}</div>
      </div>
    </div>
  )
}
