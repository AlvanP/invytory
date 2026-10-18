import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { adminService } from '@/services/adminService'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'

/** Only people listed in the platform_admins table get past this. Everyone else is sent home. */
export function AdminRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    adminService.isAdmin().then((ok) => !cancelled && setAllowed(ok))
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) return <InvitationPreviewSkeleton />
  if (!user) return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  if (allowed === null) return <InvitationPreviewSkeleton />
  if (!allowed) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
