import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CeremonyDraft } from '@/types'

/**
 * Wedding-wide details live here. Anything that differs per ceremony
 * (type, date, venue, template, photos, RSVP message) lives on the
 * ceremony itself — see CeremonyDraft.
 */
export interface WeddingDraft {
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
}

function makeCeremonyId(): string {
  return `c_${Math.random().toString(36).slice(2, 9)}`
}

function emptyDraft(): WeddingDraft {
  return {
    templateId: '',
    ceremonies: [{ id: makeCeremonyId(), ceremonyType: 'white' }],
  }
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function CreateWizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<WeddingDraft>(emptyDraft)

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
    setDraft(emptyDraft())
  }

  return (
    <WizardContext.Provider value={{ draft, updateDraft, addCeremony, updateCeremony, removeCeremony, reset }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within CreateWizardProvider')
  return ctx
}
