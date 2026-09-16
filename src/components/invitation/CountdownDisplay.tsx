import { useEffect, useState } from 'react'
import { getCountdownParts } from '@/utils/format'

export function CountdownDisplay({ weddingDate }: { weddingDate: string }) {
  const [parts, setParts] = useState(() => getCountdownParts(weddingDate))

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(weddingDate)), 60_000)
    return () => clearInterval(interval)
  }, [weddingDate])

  if (parts.isPast) {
    return <p className="text-center font-display text-xl text-ink">We said &ldquo;I do.&rdquo;</p>
  }

  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hours', value: parts.hours },
    { label: 'Minutes', value: parts.minutes },
  ]

  return (
    <div className="flex justify-center gap-6 sm:gap-10">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="font-display text-4xl text-ink sm:text-5xl">{String(u.value).padStart(2, '0')}</span>
          <span className="mt-1 text-xs uppercase tracking-[0.15em] text-ink-soft/70">{u.label}</span>
        </div>
      ))}
    </div>
  )
}
