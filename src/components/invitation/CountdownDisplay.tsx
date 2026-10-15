import { useEffect, useState } from 'react'

function remaining(weddingDate: string) {
  const target = new Date(`${weddingDate}T00:00:00`).getTime()
  const diff = Math.max(0, target - Date.now())
  return {
    isPast: target <= Date.now(),
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

/**
 * Days, hours, minutes and seconds in tiles. Meant to sit on a band of the
 * couple's colour, so the tiles and numbers use the readable text colour.
 */
export function CountdownDisplay({ weddingDate }: { weddingDate: string }) {
  const [parts, setParts] = useState(() => remaining(weddingDate))

  useEffect(() => {
    const interval = setInterval(() => setParts(remaining(weddingDate)), 1000)
    return () => clearInterval(interval)
  }, [weddingDate])

  if (parts.isPast) {
    return <p className="text-center font-display text-2xl">We said &ldquo;I do.&rdquo;</p>
  }

  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hours', value: parts.hours },
    { label: 'Minutes', value: parts.minutes },
    { label: 'Seconds', value: parts.seconds },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-label="Time until the wedding">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center rounded-md border px-1 py-4 sm:py-5"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--iv-on-main) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--iv-on-main) 30%, transparent)',
          }}
        >
          <span className="font-display text-3xl tabular-nums sm:text-5xl">{String(u.value).padStart(2, '0')}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.15em] opacity-85 sm:text-xs">{u.label}</span>
        </div>
      ))}
    </div>
  )
}