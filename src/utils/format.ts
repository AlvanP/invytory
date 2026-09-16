export function formatDate(iso: string | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', opts ?? { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function getCountdownParts(targetIso: string) {
  const target = new Date(`${targetIso}T00:00:00`).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)

  return { days, hours, minutes, isPast: target < now }
}
