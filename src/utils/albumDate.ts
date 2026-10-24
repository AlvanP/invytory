/** The guest album opens on the day of the event (earliest ceremony), Nigerian time. */
const ZONE = 'Africa/Lagos'

/** Today as YYYY-MM-DD in Nigeria. */
export function todayInLagos(now: Date = new Date()): string {
  try {
    return now.toLocaleDateString('en-CA', { timeZone: ZONE })
  } catch {
    return now.toISOString().slice(0, 10)
  }
}

/** The earliest ceremony date (YYYY-MM-DD), or null if none. */
export function earliestEventDate(dates: Array<string | null | undefined>): string | null {
  const clean = dates.map((d) => (d ?? '').slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  return clean[0] ?? null
}

/** True once the event day has arrived. No date means no restriction. */
export function albumHasOpened(opensOn: string | null | undefined, now: Date = new Date()): boolean {
  if (!opensOn) return true
  return todayInLagos(now) >= opensOn.slice(0, 10)
}

export function prettyOpenDate(opensOn: string): string {
  const d = new Date(`${opensOn.slice(0, 10)}T12:00:00Z`)
  return Number.isNaN(d.getTime())
    ? opensOn
    : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
