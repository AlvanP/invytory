import type { InvitationTemplate } from '@/types'
import { templates, getTemplateById } from '@/data/templates'

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockTemplateService = {
  /** Wedding templates only. This is what the creation wizard offers. */
  async list(): Promise<InvitationTemplate[]> {
    return delay(templates.filter((t) => t.category === 'wedding'))
  },

  /** Every template, for every kind of event. */
  async listAll(): Promise<InvitationTemplate[]> {
    return delay([...templates])
  },

  async getById(id: string): Promise<InvitationTemplate | undefined> {
    return delay(getTemplateById(id))
  },
}

export const templateService = mockTemplateService
export type TemplateService = typeof mockTemplateService
