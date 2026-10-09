import type { TemplateCollection } from '@/types'
import { COLLECTION_LABELS, COLLECTION_TABS } from '@/utils/templateCollections'
import { cn } from '@/utils/cn'

/** null = the "All" tab. */
export type CollectionFilter = TemplateCollection | null

export function CollectionTabs({
  value,
  onChange,
}: {
  value: CollectionFilter
  onChange: (next: CollectionFilter) => void
}) {
  const tabs: { key: CollectionFilter; label: string }[] = [
    { key: null, label: 'All' },
    ...COLLECTION_TABS.map((c) => ({ key: c as CollectionFilter, label: COLLECTION_LABELS[c] })),
  ]

  return (
    <div role="tablist" aria-label="Design collections" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = value === tab.key
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              active
                ? 'bg-ink text-white'
                : 'bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
