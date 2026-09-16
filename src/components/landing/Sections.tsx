import { Link } from 'react-router-dom'
import { Palette, PenLine, Share2, CheckCircle2, BarChart3, Users, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HowItWorksSection() {
  const steps = [
    { icon: Palette, title: 'Choose a template', body: 'Start from a design built for your celebration, then make it yours.' },
    { icon: PenLine, title: 'Add your details', body: 'Your names, your date, your story — filled in through a simple guided flow.' },
    { icon: Share2, title: 'Share the link', body: 'Send one link. Every guest sees the same beautiful invitation, on any device.' },
  ]

  return (
    <section className="border-y border-ink/10 bg-ivory-deep">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs tracking-[0.2em] text-gold">How It Works</p>
        <h2 className="mt-2 max-w-md font-display text-3xl text-ink">From blank page to sent invitation, in minutes</h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full border border-gold/50 text-sm text-gold">
                  {i + 1}
                </span>
                <Icon className="size-5 text-ink-soft" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-ink">{title}</h3>
              <p className="text-sm text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const features = [
    { icon: CheckCircle2, title: 'Live RSVPs', body: 'Guests respond directly on the invitation — no spreadsheets required.' },
    { icon: BarChart3, title: 'Real-time overview', body: 'Track views, confirmations, and declines from one dashboard.' },
    { icon: Users, title: 'Guest management', body: 'Search, filter, and sort your list as responses come in.' },
    { icon: MapPin, title: 'All the details', body: 'Venue, dress code, timing, and directions, all in one place.' },
  ]

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-xs tracking-[0.2em] text-gold">Features</p>
      <h2 className="mt-2 max-w-md font-display text-3xl text-ink">Everything your invitation needs to do the work</h2>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <Icon className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.5} />
            <div>
              <h3 className="font-display text-lg text-ink">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RsvpExplanationSection() {
  return (
    <section className="border-y border-ink/10 bg-ink text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">RSVP, Simplified</p>
          <h2 className="mt-2 font-display text-3xl">Know exactly who&rsquo;s coming, without the back and forth</h2>
          <p className="mt-4 max-w-md text-sm text-ivory/70">
            Guests tap &ldquo;Yes&rdquo; or &ldquo;No&rdquo; right on the invitation. Their name, party size, and any message
            land in your dashboard automatically.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-md border border-ivory/15 p-6">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="size-4 text-gold" />
            <span>Responses appear as guests submit them</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="size-4 text-gold" />
            <span>Party size tracked automatically</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="size-4 text-gold" />
            <span>Confirmed, declined, and pending, at a glance</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CtaSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl text-ink sm:text-4xl">Your celebration deserves an invitation as considered as the day itself</h2>
      <div className="mt-8">
        <Link to="/create">
          <Button size="lg">Create Your Invitation</Button>
        </Link>
      </div>
    </section>
  )
}
