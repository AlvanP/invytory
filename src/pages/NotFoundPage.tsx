import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-6xl text-gold">404</p>
      <h1 className="font-display text-2xl text-ink">This invitation could not be found.</h1>
      <Link to="/create">
        <Button size="sm">Create an Invitation</Button>
      </Link>
    </div>
  )
}
