import { useState, type FormEvent } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SuccessState } from '@/components/ui/State'

export function SignInPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  // Already signed in — no need to show this page.
  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      await authService.signInWithMagicLink(email.trim())
      setSent(true)
    } catch {
      setError('Something went wrong sending the link. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl text-ink">Evermore</p>

      {sent ? (
        <SuccessState
          title="Check your email"
          description={`We sent a sign-in link to ${email}. Click it to access your dashboard.`}
        />
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Enter your email and we'll send you a link to sign in — no password needed.
          </p>
          <Input
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={error ?? undefined}
            required
          />
          <Button type="submit" isLoading={submitting} icon={<Mail className="size-4" />}>
            Send Sign-In Link
          </Button>
        </form>
      )}
    </div>
  )
}