import type { WeddingInvitation } from '@/types'
import { getEventCopy } from '@/templates/events'

/**
 * Builds "save the date" links from an invitation. Times are written without a
 * timezone ("floating"), so the event shows at the same clock time wherever the
 * guest's phone is. With no time given it becomes an all-day event.
 */

const pad = (n: number) => String(n).padStart(2, '0')

function ymd(date: string) {
  return date.replace(/-/g, '')
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

/** "16:00" on 2027-04-18 for 4 hours -> start/end as YYYYMMDDTHHMMSS. */
function timedRange(date: string, time: string, hours = 4): { start: string; end: string } | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!m) return null
  const start = new Date(`${date}T${pad(Number(m[1]))}:${m[2]}:00`)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 3_600_000)
  const f = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  return { start: f(start), end: f(end) }
}

export function eventTitle(i: WeddingInvitation): string {
  return getEventCopy(i.eventType).calendarTitle(i.brideName, i.groomName)
}

function eventPlace(i: WeddingInvitation): string {
  return [i.venueName, i.venueAddress, i.city, i.state, i.country].filter(Boolean).join(', ')
}

function range(i: WeddingInvitation) {
  const timed = timedRange(i.weddingDate, i.weddingTime)
  return timed
    ? { start: timed.start, end: timed.end, allDay: false }
    : { start: ymd(i.weddingDate), end: addDays(i.weddingDate, 1), allDay: true }
}

export function googleCalendarUrl(i: WeddingInvitation, link: string): string {
  const r = range(i)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(i),
    dates: `${r.start}/${r.end}`,
    location: eventPlace(i),
    details: `You are invited! ${link}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** A .ics file, which opens in Apple Calendar, Outlook and most phone calendars. */
export function icsFileContent(i: WeddingInvitation, link: string): string {
  const r = range(i)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invytory//Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${i.id}@evermore`,
    `DTSTAMP:${stamp}`,
    r.allDay ? `DTSTART;VALUE=DATE:${r.start}` : `DTSTART:${r.start}`,
    r.allDay ? `DTEND;VALUE=DATE:${r.end}` : `DTEND:${r.end}`,
    `SUMMARY:${esc(eventTitle(i))}`,
    `LOCATION:${esc(eventPlace(i))}`,
    `DESCRIPTION:${esc(`You are invited! ${link}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function whatsappShareUrl(i: WeddingInvitation, link: string): string {
  const text = `You are invited to ${eventTitle(i)}! 💍\n${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
