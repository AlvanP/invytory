import { useEffect, useState } from 'react'
import { DEFAULT_SETTING, cachedSettings, entranceService, type EntranceSetting } from '@/services/entranceService'

/** The admin's entrance settings for one template. `loading` is true for the first instant only. */
export function useEntranceSetting(templateId?: string): { loading: boolean; setting: EntranceSetting } {
  const [all, setAll] = useState<Record<string, EntranceSetting> | null>(() => cachedSettings())
  useEffect(() => {
    let cancelled = false
    entranceService.all().then((a) => {
      if (!cancelled) setAll(a)
    })
    return () => {
      cancelled = true
    }
  }, [])
  const id = templateId ?? ''
  return { loading: all === null, setting: all?.[id] ?? DEFAULT_SETTING(id) }
}
