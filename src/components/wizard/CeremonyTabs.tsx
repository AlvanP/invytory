import type { CeremonyDraft } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { cn } from '@/utils/cn'

/**
 * Tab row for switching between ceremonies inside a wizard step.
 * Renders nothing for a single-ceremony wedding, so simple weddings
 * never see it.
 */
export function CeremonyTabs({
  ceremonies,
  activeId,
  onChange,
}: {
  ceremonies: CeremonyDraft[]
  activeId: string
  onChange: (id: string) => void
}) {
  if (ceremonies.length < 2) return null

  // Two ceremonies of the same type would read identically, so number repeats.
  const seen: Record<string, number> = {}
  const labels = ceremonies.map((c) => {
    const name = ceremonyDisplayName(c)
    seen[name] = (seen[name] ?? 0) + 1
    return seen[name] > 1 ? `${name} (${seen[name]})` : name
  })

  return (
    <div role="tablist" aria-label="Ceremonies" className="flex flex-wrap gap-2">
      {ceremonies.map((c, i) => {
        const active = c.id === activeId
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              active
                ? 'bg-ink text-white'
                : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
            )}
          >
            {labels[i]}
          </button>
        )
      })}
    </div>
  )
}
