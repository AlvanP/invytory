import { useEffect, useState } from 'react'

/**
 * WhatsApp (and Facebook and others) remember the preview of every web address they have seen.
 * After an invitation is edited, the same address would keep showing the old preview. So the links
 * we hand out end in `?v=<code>`, where the code changes whenever anything shown in the preview
 * changes. Old links keep working; the new link simply looks new to WhatsApp and gets a fresh preview.
 * The code comes from the server, which also builds the preview, so the two always agree.
 */
export async function fetchShareVersion(slug: string): Promise<string> {
  try {
    const res = await fetch(`/api/invite-share?slug=${encodeURIComponent(slug)}&fp=1`, { cache: 'no-store' })
    if (!res.ok) return ''
    const data = (await res.json()) as { v?: string }
    return typeof data.v === 'string' ? data.v.replace(/[^a-z0-9]/gi, '') : ''
  } catch {
    return '' // offline, or running locally: the plain link still works
  }
}

/** The current share code for an invitation ('' until it arrives). Fetched fresh each time `active` turns on. */
export function useShareVersion(slug: string | null | undefined, active = true): string {
  const [v, setV] = useState('')
  useEffect(() => {
    if (!slug || !active) return
    let cancelled = false
    fetchShareVersion(slug).then((value) => {
      if (!cancelled) setV(value)
    })
    return () => {
      cancelled = true
    }
  }, [slug, active])
  return v
}

/** Adds the share code to a link, keeping any other parts of it (such as a guest's personal code). */
export function withShareVersion(url: string, v: string): string {
  if (!v) return url
  return url + (url.includes('?') ? '&' : '?') + `v=${v}`
}
