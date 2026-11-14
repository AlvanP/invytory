import { useSyncExternalStore } from 'react'

/**
 * Which event the dashboard is focused on. '' means "all my events". A manager who just joined
 * an invitation is focused on that one, so they see only what they were invited to.
 */
const KEY = 'invytory:workspace'
const listeners = new Set<() => void>()

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function setWorkspace(weddingId: string) {
  try {
    if (weddingId) localStorage.setItem(KEY, weddingId)
    else localStorage.removeItem(KEY)
  } catch {
    // storage blocked: the dashboard just shows everything
  }
  listeners.forEach((l) => l())
}

export function useWorkspace(): [string, (id: string) => void] {
  const id = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => ''
  )
  return [id, setWorkspace]
}
