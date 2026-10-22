import { createContext, useContext } from 'react'

/** Where guests add their photos for this event. null when the event has no open guest album. */
export const AlbumContext = createContext<{ path: string } | null>(null)

export function useAlbum() {
  return useContext(AlbumContext)
}
