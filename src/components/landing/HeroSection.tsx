import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HeroInvitationPlaceholder } from '@/components/ui/Placeholder'

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 md:grid-cols-2 md:items-center md:py-32">
      <div className="flex flex-col items-start gap-6">
        <p className="text-xs tracking-[0.25em] text-gold">Digital Wedding Invitations</p>
        <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
          Create a Wedding Invitation They&rsquo;ll Remember
        </h1>
        <p className="max-w-md text-base text-ink-soft">
          Create a beautiful digital wedding invitation, share it instantly, and know exactly who will be there.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/create">
            <Button size="lg" icon={<ArrowRight className="size-4" />}>Create Your Invitation</Button>
          </Link>
          <Link to="/templates">
            <Button size="lg" variant="outline">Explore Templates</Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm md:mx-0 md:ml-auto">
        <HeroInvitationPlaceholder />
      </div>
    </section>
  )
}
