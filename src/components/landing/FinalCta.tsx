import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function FinalCta() {
  return (
    <section className="bg-wine px-6 py-20 text-center text-ivory lg:py-28">
      <h2 className="mx-auto max-w-2xl font-brand text-5xl leading-[1.02] sm:text-6xl">Tell a story, with your invites.</h2>
      <p className="mx-auto mt-5 max-w-sm text-base text-ivory/75">Design it first. You only pay when you publish.</p>
      <Link to="/create" className="mt-8 inline-block">
        <Button size="lg" variant="light">Create your invitation</Button>
      </Link>
    </section>
  )
}
