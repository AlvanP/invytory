/** Which piece of wording the couple wants help with. */
export type AiField =
  | 'loveStory'
  | 'howWeMet'
  | 'vows'
  | 'hashtag'
  | 'giftInformation'
  | 'additionalMessage'
  | 'rsvpMessage'

export interface AiCeremonyInfo {
  name: string
  date: string
  city: string
}

export interface AiRequest {
  field: AiField
  /** Anything the couple typed to guide the writing. */
  details: string
  bride: string
  groom: string
  ceremonies: AiCeremonyInfo[]
  /** The version they just saw, so a retry says something different. */
  previous?: string
  /** 0 for the first try, +1 for every "Regenerate". */
  variation: number
}

export interface AiResult {
  /** Set for every field except hashtags. */
  text?: string
  /** Set for hashtags: a handful of options to pick from. */
  suggestions?: string[]
}

/** An error whose message is already fit to show the couple. */
export class AiAssistError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

export const aiService = {
  async suggest(request: AiRequest): Promise<AiResult> {
    let response: Response
    try {
      response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    } catch {
      throw new AiAssistError('Could not reach the writer. Check your internet and try again.', 'network')
    }

    let data: { text?: string; suggestions?: string[]; error?: string; code?: string } | null = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok || !data) {
      // On a developer's own computer (npm run dev) there is no /api, so the
      // answer is not JSON. Same story as payments: it works on the live site.
      if (!data) {
        throw new AiAssistError('AI Assist only works on the live website, not on a local test copy.', 'unavailable')
      }
      throw new AiAssistError(data.error || 'AI Assist is busy right now. Please try again in a moment.', data.code || 'busy')
    }

    return { text: data.text, suggestions: data.suggestions }
  },
}