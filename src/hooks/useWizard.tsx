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
  /** Throws away the unfinished invitation for the current kind of event and starts fresh. */
  reset: () => void
  /**
   * Moves to another kind of event. Each kind keeps its own unfinished invitation, so nothing
   * (names, dates, photos) leaks between them. Returns the draft now in use.
   */
  switchKind: (kind: EventKind) => WeddingDraft
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

// Each kind of event has its own unfinished invitation: v2 keys are per kind.
const LEGACY_KEY = 'invytory:wizard-draft:v1'
const ACTIVE_KEY = 'invytory:wizard-active:v2'
const draftKey = (kind: EventKind) => `invytory:wizard-draft:v2:${kind}`
const KINDS: EventKind[] = ['wedding', 'child-dedication', 'birthday', 'corporate', 'funeral']

function readJson(key: string): Partial<WeddingDraft> | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Partial<WeddingDraft> | null) : null
  } catch {
    return null
  }
}

function freshDraft(kind: EventKind): WeddingDraft {
  const base = emptyDraft()
  return kind === 'wedding'
    ? base
    : { ...base, eventType: kind, ceremonies: [{ id: base.ceremonies[0].id, ceremonyType: 'custom' }] }
}

function validDraft(parsed: Partial<WeddingDraft> | null, kind: EventKind): WeddingDraft | null {
  if (!parsed || !Array.isArray(parsed.ceremonies) || parsed.ceremonies.length === 0) return null
  return { ...freshDraft(kind), ...parsed, eventType: kind, ceremonies: parsed.ceremonies } as WeddingDraft
}

/** The saved, unfinished invitation for this kind of event, or null. Never throws: storage can be blocked. */
export function peekDraft(kind: EventKind): WeddingDraft | null {
  const own = validDraft(readJson(draftKey(kind)), kind)
  if (own) return own
  // An invitation saved before drafts were kept per kind.
  const legacy = readJson(LEGACY_KEY)
  if (legacy && (legacy.eventType ?? 'wedding') === kind) return validDraft(legacy, kind)
  return null
}

/** True when the saved draft has something in it worth continuing. */
export function hasProgress(d: WeddingDraft | null): boolean {
  return !!d && !!(d.brideName?.trim() || d.groomName?.trim() || d.ceremonies.some((c) => c.venueName || c.weddingDate))
}

function loadDraftFor(kind: EventKind): WeddingDraft {
  return peekDraft(kind) ?? freshDraft(kind)
}

function activeKind(): EventKind {
  try {
    const k = window.localStorage.getItem(ACTIVE_KEY) as EventKind | null
    if (k && KINDS.includes(k)) return k
    const legacy = readJson(LEGACY_KEY)
    if (legacy?.eventType && KINDS.includes(legacy.eventType)) return legacy.eventType
  } catch {
    // ignore
  }
  return 'wedding'
}

/** The invitation being worked on right now (the last kind of event the person touched). */
export function peekActiveDraft(): WeddingDraft {
  return loadDraftFor(activeKind())
}

function saveDraft(draft: WeddingDraft) {
  try {
    window.localStorage.setItem(draftKey(draft.eventType), JSON.stringify(draft))
    window.localStorage.setItem(ACTIVE_KEY, draft.eventType)
  } catch {
    // Storage full or blocked: the wizard still works, it just won't be remembered.
  }
}

function clearSavedDraft(kind: EventKind) {
  try {
    window.localStorage.removeItem(draftKey(kind))
    const legacy = readJson(LEGACY_KEY)
    if (legacy && (legacy.eventType ?? 'wedding') === kind) window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function CreateWizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<WeddingDraft>(() => loadDraftFor(activeKind()))
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

  function switchKind(kind: EventKind): WeddingDraft {
    const current = draftRef.current
    if (current.eventType === kind) return current
    saveDraft(current)
    const next = loadDraftFor(kind)
    draftRef.current = next
    setDraft(next)
    return next
  }

  function updateDraft(patch: Partial<WeddingDraft>) {
    // Changing the kind of event swaps to that kind's own draft first, so nothing carries over.
    if (patch.eventType && patch.eventType !== draftRef.current.eventType) {
      const { eventType, ...rest } = patch
      switchKind(eventType)
      patch = rest
    }
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
    const kind = draftRef.current.eventType
    clearSavedDraft(kind)
    const next = freshDraft(kind)
    draftRef.current = next
    setDraft(next)
  }

  return (
    <WizardContext.Provider value={{ draft, updateDraft, addCeremony, updateCeremony, removeCeremony, reset, switchKind, uploading: busyIds.length > 0, reportUploading }}>
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
  // Optional: outside the create wizard (for example the Edit page) there is nothing to tell.
  const report = useContext(WizardContext)?.reportUploading
  useEffect(() => {
    report?.(id, busy)
    return () => report?.(id, false)
  }, [id, busy, report])
}
