import { createContext, useContext } from 'react'
import { getDesign, type TemplateDesign } from './designs'
import { getTemplateArt, type TemplateArt } from '@/utils/templateArt'
import { getEventCopy, type EventCopy } from './events'

interface DesignContextValue {
  templateId: string
  design: TemplateDesign
  art: TemplateArt
  /** The wording for this kind of event (wedding, birthday and so on). */
  event: EventCopy
}

const fallback: DesignContextValue = { templateId: '', design: getDesign(undefined), art: getTemplateArt(undefined), event: getEventCopy(undefined) }

export const DesignContext = createContext<DesignContextValue>(fallback)

export function makeDesignContext(templateId: string, eventType?: string): DesignContextValue {
  return { templateId, design: getDesign(templateId), art: getTemplateArt(templateId), event: getEventCopy(eventType) }
}

/** The current invitation's design and artwork. Every section reads its look from here. */
export function useDesign(): DesignContextValue {
  return useContext(DesignContext)
}
