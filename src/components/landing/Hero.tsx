import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PhoneMockup } from '@/components/brand/PhoneMockup'
import { Check, Camera } from 'lucide-react'
import { eventCopy, EVENT_KINDS } from '@/templates/events'
import { ACCENTS } from '@/utils/accents'

/**
 * The first thing a visitor sees: the headline, and three real invitations scrolling by
 * themselves inside slim phones. The phones are the memorable part; the rest stays quiet.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="drift-a absolute -left-24 top-10 size-[26rem] rounded-full bg-rose/20 blur-3xl" />
        <div className="drift-b absolute right-[-6rem] top-0 size-[30rem] rounded-full bg-amber/25 blur-3xl" />
        <div className="drift-a absolute bottom-[-8rem] left-[35%] size-[24rem] rounded-full bg-teal/15 blur-3xl" />
      </div>
      <style>{`
        @keyframes phoneRise { from { opacity: 0; transform: translateY(48px) } to { opacity: 1; transform: translateY(0) } }
        .phone-rise { animation: phoneRise 1.1s cubic-bezier(0.22,1,0.36,1) both }
      `}</style>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:pb-24 lg:pt-16">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-brand text-[3.4rem] leading-[0.98] tracking-tight text-wine sm:text-7xl lg:text-[5.4rem]">
            Tell a story, with your invites.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Animated invitations for weddings, dedications, birthdays, corporate events and memorials. Guests reply in a tap, and
            share their photos in one album.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/create">
              <Button size="lg">Create your invitation</Button>
            </Link>
            <Link to="/templates" className="text-sm font-medium text-wine underline decoration-wine/30 underline-offset-4 hover:decoration-wine">
              Browse templates
            </Link>
          </div>
          <nav aria-label="Event types" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {EVENT_KINDS.map((k) => (
              <Link key={k} to={`/templates?category=${k}`} className="flex items-center gap-2 hover:text-wine">
                <i className="size-2 rounded-full" style={{ backgroundColor: ACCENTS[k] }} />
                {eventCopy[k].plural}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          {/* The arch behind the phones echoes the arched photo frame used in the invitations. */}
          <div aria-hidden className="absolute inset-x-[8%] bottom-0 top-[6%] rounded-t-full bg-gradient-to-t from-amber/30 via-rose/15 to-ivory-deep" />
          <div className="relative flex items-end justify-center gap-3 px-3 pb-6 pt-10 sm:gap-5">
            <div className="phone-rise hidden w-[27%] translate-y-10 sm:block" style={{ animationDelay: '250ms' }}>
              <PhoneMockup templateId="dedication-blush-blessing" />
            </div>
            <div className="phone-rise w-[62%] sm:w-[38%]" style={{ animationDelay: '60ms' }}>
              <PhoneMockup templateId="classic-elegance" />
            </div>
            <div className="phone-rise hidden w-[27%] translate-y-16 sm:block" style={{ animationDelay: '420ms' }}>
              <PhoneMockup templateId="birthday-midnight-party" />
            </div>
          </div>
          <div aria-hidden className="bob absolute left-0 top-[18%] z-10 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft ring-1 ring-ink/5 sm:flex">
            <span className="flex size-6 items-center justify-center rounded-full bg-mint text-white"><Check className="size-3.5" /></span>
            142 guests coming
          </div>
          <div aria-hidden className="bob absolute bottom-[14%] right-0 z-10 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft ring-1 ring-ink/5 sm:flex" style={{ animationDelay: '1.6s' }}>
            <span className="flex size-6 items-center justify-center rounded-full bg-amber text-white"><Camera className="size-3.5" /></span>
            86 photos added
          </div>
        </div>
      </div>
    </section>
  )
}
