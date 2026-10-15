import { CalendarPlus, Share2 } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { googleCalendarUrl, icsFileContent, whatsappShareUrl, eventTitle } from '@/utils/calendar'

const button =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform active:scale-95'

/**
 * "Save the date" and "Share on WhatsApp". Sits on a light section, so the
 * main button is a block of the couple's colour and the others are outlined.
 */
export function SaveAndShare({ invitation, onBand = false }: { invitation: WeddingInvitation; onBand?: boolean }) {
  const solid = onBand ? 'bg-[color:var(--iv-paper)] text-[color:var(--iv-ink)]' : 'bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]'
  const outline = onBand
    ? 'border-2 border-[color:var(--iv-on-main)] text-[color:var(--iv-on-main)]'
    : 'border-2 border-[color:var(--iv-main)] text-[color:var(--iv-ink)]'
  const link = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''

  function downloadIcs() {
    const blob = new Blob([icsFileContent(invitation, link)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wedding-invitation.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: eventTitle(invitation), text: `You are invited to ${eventTitle(invitation)}!`, url: link })
        return
      }
    } catch {
      return // the guest closed the share sheet
    }
    window.open(whatsappShareUrl(invitation, link), '_blank', 'noopener')
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        href={googleCalendarUrl(invitation, link)}
        target="_blank"
        rel="noreferrer"
        className={`${button} ${solid}`}
      >
        <CalendarPlus className="size-4" /> Add to Google Calendar
      </a>
      <button
        type="button"
        onClick={downloadIcs}
        className={`${button} ${outline}`}
      >
        <CalendarPlus className="size-4" /> Apple / other calendar
      </button>
      <a
        href={whatsappShareUrl(invitation, link)}
        target="_blank"
        rel="noreferrer"
        className={`${button} ${outline}`}
      >
        <Share2 className="size-4" /> Share on WhatsApp
      </a>
      <button type="button" onClick={share} className={`text-xs underline underline-offset-2 opacity-80 ${onBand ? 'text-[color:var(--iv-on-main)]' : 'text-[color:var(--iv-ink)]'}`}>
        More ways to share
      </button>
    </div>
  )
}
