import { createContext, useContext } from 'react'
import { getDesign, type TemplateDesign } from './designs'
import { getTemplateArt, type TemplateArt } from '@/utils/templateArt'

interface DesignContextValue {
  templateId: string
  design: TemplateDesign
  art: TemplateArt
}

const fallback: DesignContextValue = { templateId: '', design: getDesign(undefined), art: getTemplateArt(undefined) }

export const DesignContext = createContext<DesignContextValue>(fallback)

export function makeDesignContext(templateId: string): DesignContextValue {
  return { templateId, design: getDesign(templateId), art: getTemplateArt(templateId) }
}

/** The current invitation's design and artwork. Every section reads its look from here. */
export function useDesign(): DesignContextValue {
  return useContext(DesignContext)
}
