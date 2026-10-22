import { createContext, useContext } from 'react'
import { getDesign, type TemplateDesign } from './designs'
import { getTemplateArt, type TemplateArt } from '@/utils/templateArt'
import { getEventCopy, withChildCount, EVENT_KINDS, type EventCopy, type EventKind } from './events'

interface DesignContextValue {
  templateId: string
  design: TemplateDesign
  art: TemplateArt
  /** The wording for this kind of event (wedding, birthday and so on). */
  event: EventCopy
  /** Which kind of event: wedding, child-dedication and so on. */
  kind: EventKind
}

const fallback: DesignContextValue = { templateId: '', design: getDesign(undefined), art: getTemplateArt(undefined), event: getEventCopy(undefined), kind: 'wedding' }

export const DesignContext = createContext<DesignContextValue>(fallback)

export function makeDesignContext(templateId: string, eventType?: string, names?: string): DesignContextValue {
  return { templateId, design: getDesign(templateId), art: getTemplateArt(templateId), event: withChildCount(getEventCopy(eventType), eventType, names), kind: EVENT_KINDS.includes(eventType as EventKind) ? (eventType as EventKind) : 'wedding' }
}

/** The current invitation's design and artwork. Every section reads its look from here. */
export function useDesign(): DesignContextValue {
  return useContext(DesignContext)
}
