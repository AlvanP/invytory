import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { wallService, type WallMessage } from '@/services/wallService'

interface WallValue {
  messages: WallMessage[]
  /** Puts a message the guest just posted at the top, without waiting for a reload. */
  add: (m: WallMessage) => void
}

const WallContext = createContext<WallValue>({ messages: [], add: () => {} })

/**
 * Loads the couple's wall for a published invitation and shares it between the RSVP form (which
 * adds to it) and the wall section (which shows it). Drafts and previews have no wall to load.
 */
export function WallProvider({ invitationId, published, children }: { invitationId: string; published: boolean; children: ReactNode }) {
  const [messages, setMessages] = useState<WallMessage[]>([])

  useEffect(() => {
    if (!published || !invitationId) return
    let cancelled = false
    wallService
      .list(invitationId)
      .then((list) => !cancelled && setMessages(list))
      .catch((err) => console.error('[wall] could not load:', err))
    return () => {
      cancelled = true
    }
  }, [invitationId, published])

  const add = useCallback((m: WallMessage) => setMessages((cur) => [m, ...cur]), [])
  const value = useMemo(() => ({ messages, add }), [messages, add])
  return <WallContext.Provider value={value}>{children}</WallContext.Provider>
}

export function useWall(): WallValue {
  return useContext(WallContext)
}
