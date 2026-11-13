import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'

export const PENDING_JOIN_KEY = 'invytory:pending-join'

/** Wraps the dashboard routes in App.tsx. Sends signed-out visitors to
 * /sign-in, remembering where they were headed so we can send them
 * back after they sign in. */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <InvitationPreviewSkeleton />

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  }

  // They signed in from a manager's invite link: finish joining.
  let pending: string | null = null
  try {
    pending = localStorage.getItem(PENDING_JOIN_KEY)
  } catch {
    // storage blocked
  }
  if (pending && !location.pathname.startsWith('/join/')) return <Navigate to={`/join/${pending}`} replace />

  return <Outlet />
}