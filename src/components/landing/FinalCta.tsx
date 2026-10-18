import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-wine px-6 py-20 text-center text-ivory lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="drift-a absolute -left-20 top-0 size-80 rounded-full bg-rose/35 blur-3xl" />
        <div className="drift-b absolute -right-16 bottom-0 size-96 rounded-full bg-amber/25 blur-3xl" />
        <div className="drift-a absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/20 blur-3xl" />
      </div>
      <div className="relative">
        <h2 className="mx-auto max-w-2xl font-brand text-5xl leading-[1.02] sm:text-6xl">Tell a story, with your invites.</h2>
        <p className="mx-auto mt-5 max-w-sm text-base text-ivory/80">Design it first. You only pay when you publish.</p>
        <Link to="/create" className="mt-8 inline-block">
          <Button size="lg" variant="light">Create your invitation</Button>
        </Link>
      </div>
    </section>
  )
}
