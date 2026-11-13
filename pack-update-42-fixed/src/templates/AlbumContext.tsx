import { createContext, useContext } from 'react'

/**
 * Where guests add their photos for this event. null when the event has no guest album.
 * opensOn: the event day (YYYY-MM-DD). Before it, the section shows but tells guests to come back then.
 */
export const AlbumContext = createContext<{ path: string; opensOn?: string | null } | null>(null)

export function useAlbum() {
  return useContext(AlbumContext)
}
