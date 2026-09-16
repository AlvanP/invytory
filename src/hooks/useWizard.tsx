import { createContext, useContext, useState, type ReactNode } from 'react'
import type { InvitationDraft } from '@/types'

interface WizardContextValue {
  draft: InvitationDraft
  updateDraft: (patch: Partial<InvitationDraft>) => void
  reset: () => void
}

const emptyDraft: InvitationDraft = {
  templateId: '',
  galleryImages: [
    { id: 'g1', url: null },
    { id: 'g2', url: null },
    { id: 'g3', url: null },
    { id: 'g4', url: null },
  ],
}

const WizardContext = createContext<WizardContextValue | null>(null)

/**
 * Holds the in-progress invitation as the user moves through
 * /create/couple, /create/event, /create/story, etc. State lives in
 * memory for this v0.1 — swap for persisted local storage or a
 * server-side draft later without changing how steps read/write it.
 */
export function CreateWizardProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<InvitationDraft>(emptyDraft)

  function updateDraft(patch: Partial<InvitationDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function reset() {
    setDraft(emptyDraft)
  }

  return (
    <WizardContext.Provider value={{ draft, updateDraft, reset }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within CreateWizardProvider')
  return ctx
}
