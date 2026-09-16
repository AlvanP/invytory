import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/utils/format'

export function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink-soft/70">{label}</p>
        <Icon className="size-4 text-gold" strokeWidth={1.5} />
      </div>
      <p className="font-display text-3xl text-ink">{formatNumber(value)}</p>
    </div>
  )
}
