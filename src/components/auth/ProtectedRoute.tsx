import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'

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

  return <Outlet />
}