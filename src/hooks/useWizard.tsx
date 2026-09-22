import { createContext, useContext, useState, type ReactNode } from 'react'
import type { GalleryImageSlot, CeremonyDraft } from '@/types'

export interface WeddingDraft {
  templateId: string
  brideName?: string
  groomName?: string
  tagline?: string
  loveStory?: string
  howWeMet?: string
  vows?: string
  heroImage?: string | null
  galleryImages: GalleryImageSlot[]
  giftInformation?: string
  weddingHashtag?: string
  additionalMessage?: string
  customRsvpMessage?: string
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
    galleryImages: [
      { id: 'g1', url: null },
      { id: 'g2', url: null },
      { id: 'g3', url: null },
      { id: 'g4', url: null },
    ],
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