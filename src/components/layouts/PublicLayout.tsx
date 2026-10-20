import { Outlet, useLocation } from 'react-router-dom'
import { InvitationFooter } from './InvitationFooter'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function PublicLayout() {
  // A guest opening an invitation sees a small Invytory footer, not the whole website's.
  const onInvitation = useLocation().pathname.startsWith('/invitation/')
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {onInvitation ? <InvitationFooter /> : <SiteFooter />}
    </div>
  )
}
