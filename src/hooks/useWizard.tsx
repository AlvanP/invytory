import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CeremonyDraft } from '@/types'
import type { EventKind } from '@/templates/events'

/**
 * Wedding-wide details live here. Anything that differs per ceremony
 * (type, date, venue, template, photos, RSVP message) lives on the
 * ceremony itself — see CeremonyDraft.
 */
export interface WeddingDraft {
  /** What the invitation is for. Weddings by default. */
  eventType: EventKind
  /** The starting template picked on step 1; new ceremonies default to it. */
  templateId: string
  brideName?: string
  groomName?: string
  tagline?: string
  loveStory?: string
  howWeMet?: string
  vows?: string
  giftInformation?: string
  weddingHashtag?: string
  additionalMessage?: string
  ceremonies: CeremonyDraft[]
}

interface WizardContextValue {
  draft: WeddingDraft
  updateDraft: (patch: Partial<WeddingDraft>) => void
  addCeremony: (ceremony: CeremonyDraft) => void
  updateCeremony: (id: string, patch: Partial<CeremonyDraft>) => void
  removeCeremony: (id: string) => void
  reset: () => void
  /** True while any photo or music upload is still running. */
  uploading: boolean
  /** Call with true when an upload starts and false when it ends. */
  reportUploading: (id: string, busy: boolean) => void
}

function makeCeremonyId(): string {
  return `c_${Math.random().toString(36).slice(2, 9)}`
}

function emptyDraft(): WeddingDraft {
  return {
    eventType: 'wedding',
    templateId: '',
    ceremonies: [{ id: makeCeremonyId(), ceremonyType: 'white' }],
  }
}

const STORAGE_KEY = 'invytory:wizard-draft:v1'

/** Reads the saved draft, if any. Never throws: storage can be blocked. */
function loadDraft(): WeddingDraft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as Partial<WeddingDraft> | null
    if (!parsed || !Array.isArray(parsed.ceremonies) || parsed.ceremonies.length === 0) return emptyDraft()
    return { ...emptyDraft(), ...parsed, ceremonies: parsed.ceremonies } as WeddingDraft
  } catch {
    return emptyDraft()
  }
}

function saveDraft(draft: WeddingDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Storage full or blocked: the wizard still works, it just won't be remembered.
  }
}

function clearSavedDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function CreateWizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<WeddingDraft>(loadDraft)
  const [busyIds, setBusyIds] = useState<string[]>([])

  // Save on every change, and again the moment the tab is hidden (phones
  // may close a background tab without warning).
  useEffect(() => {
    saveDraft(draft)
  }, [draft])
  useEffect(() => {
    function onHide() {
      if (document.visibilityState === 'hidden') saveDraft(draftRef.current)
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])
  const draftRef = useRef(draft)
  draftRef.current = draft

  const reportUploading = useCallback((id: string, busy: boolean) => {
    setBusyIds((cur) => (busy ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id)))
  }, [])

  function updateDraft(patch: Partial<WeddingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function addCeremony(ceremony: CeremonyDraft) {
    setDraft((prev) => ({ ...prev, ceremonies: [...prev.ceremonies, ceremony] }))
  }

  function updateCeremony(id: string, patch: Partial<CeremonyDraft>) {
    setDraft((prev) => ({
      ...prev,
      ceremonies: prev.ceremonies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }

  function removeCeremony(id: string) {
    setDraft((prev) => ({
      ...prev,
      ceremonies: prev.ceremonies.length > 1 ? prev.ceremonies.filter((c) => c.id !== id) : prev.ceremonies,
    }))
  }

  function reset() {
    clearSavedDraft()
    setDraft(emptyDraft())
  }

  return (
    <WizardContext.Provider value={{ draft, updateDraft, addCeremony, updateCeremony, removeCeremony, reset, uploading: busyIds.length > 0, reportUploading }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within CreateWizardProvider')
  return ctx
}

/** Tells the wizard an upload is running while `busy` is true. */
export function useReportUploading(id: string, busy: boolean) {
  const { reportUploading } = useWizard()
  useEffect(() => {
    reportUploading(id, busy)
    return () => reportUploading(id, false)
  }, [id, busy, reportUploading])
}
