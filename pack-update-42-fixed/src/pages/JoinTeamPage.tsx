import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { teamService } from '@/services/teamService'
import { PENDING_JOIN_KEY } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'

/** Where a manager lands from the host's private link. */
export function JoinTeamPage() {
  const { token } = useParams<{ token: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [info, setInfo] = useState<{ names: string; usable: boolean; emailLocked: boolean } | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) teamService.preview(token).then(setInfo)
  }, [token])

  async function join() {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      await teamService.accept(token)
      try { localStorage.removeItem(PENDING_JOIN_KEY) } catch { /* ignore */ }
      navigate('/dashboard/events', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join.')
    } finally {
      setBusy(false)
    }
  }

  function signIn() {
    try { if (token) localStorage.setItem(PENDING_JOIN_KEY, token) } catch { /* ignore */ }
    navigate('/sign-in', { state: { from: `/join/${token}` } })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Users className="size-10 text-gold" strokeWidth={1.4} />
      {info === undefined || loading ? (
        <p className="text-sm text-ink-soft">Checking your invite…</p>
      ) : info === null || !info.usable ? (
        <>
          <h1 className="font-display text-2xl text-ink">This invite can&rsquo;t be used</h1>
          <p className="text-sm text-ink-soft">It may have expired or already been used. Ask the host to send you a new link.</p>
          <Link to="/"><Button size="sm" variant="outline">Go to Invytory</Button></Link>
        </>
      ) : (
        <>
          <p className="text-xs tracking-[0.2em] text-gold">YOU&rsquo;RE INVITED TO HELP</p>
          <h1 className="font-display text-3xl text-ink">{info.names}</h1>
          <p className="text-sm text-ink-soft">
            Join this team to see and manage the guests, RSVPs, messages and photo album for this invitation.
            {info.emailLocked && ' Use the email address the host invited.'}
          </p>
          {error && <p className="text-sm text-danger">{error}</p>}
          {user ? (
            <Button onClick={join} disabled={busy}>{busy ? 'Joining…' : 'Join this team'}</Button>
          ) : (
            <Button onClick={signIn}>Sign in to join</Button>
          )}
        </>
      )}
    </div>
  )
}
