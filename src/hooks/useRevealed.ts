import { createContext, useContext } from 'react'

/**
 * Tells the invitation whether the entrance has finished opening. The invitation is
 * already on the page underneath the entrance, so its opening animations (names
 * rising into place, and so on) wait for this to turn true. Outside an entrance
 * (previews) it is simply true.
 */
export const RevealedContext = createContext(true)

export function useRevealed(): boolean {
  return useContext(RevealedContext)
}