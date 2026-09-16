import { useParams } from 'react-router-dom'
import { Lock, CreditCard, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function DashboardSettingsPage() {
  const { eventId } = useParams<{ eventId: string }>()

  return (
    <div className="max-w-2xl">
      <p className="text-xs tracking-[0.2em] text-gold">Settings</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Event Settings</h1>

      <Card className="mt-8 p-6">
        <h2 className="font-display text-xl text-ink">Invitation link</h2>
        <p className="mt-1 text-sm text-ink-soft">Choose the web address guests will use to view this invitation.</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-ink-soft">/invitation/</span>
          <Input defaultValue={eventId === 'inv_001' ? 'ada-and-michael' : eventId} className="flex-1" />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-gold" strokeWidth={1.5} />
          <h2 className="font-display text-xl text-ink">Account &amp; Authentication</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Sign-in is not yet connected. This is a placeholder for the account system that will protect your dashboard.
        </p>
        <Button variant="outline" size="sm" className="mt-4" disabled>Sign in (coming soon)</Button>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-gold" strokeWidth={1.5} />
          <h2 className="font-display text-xl text-ink">Plan &amp; Billing</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Payment processing is not yet connected. Your invitation was published using a simulated payment.
        </p>
      </Card>

      <Card className="mt-6 border-danger/30 p-6">
        <div className="flex items-center gap-2">
          <Trash2 className="size-4 text-danger" strokeWidth={1.5} />
          <h2 className="font-display text-xl text-ink">Danger Zone</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Archiving and deleting invitations will be available in a future version.</p>
        <Button variant="danger" size="sm" className="mt-4" disabled>Archive Invitation</Button>
      </Card>
    </div>
  )
}
