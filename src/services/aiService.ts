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
  /** Weddings by default. Child dedications are written differently. */
  eventType?: 'wedding' | 'child-dedication'
  /** Child dedication only: e.g. "Daughter of Pastor and Mrs Okoye". */
  parents?: string
  /** Anything the couple typed to guide the writing. */
  details: string
  /** The bride, or the child's name for a dedication. */
  bride: string
  /** Weddings only. */
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
  /** Plain reasons from the server (key rejected, model not found, ...). Never a key. */
  diagnostic: string
  constructor(message: string, code: string, diagnostic = '') {
    super(message)
    this.code = code
    this.diagnostic = diagnostic
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

    let data: { text?: string; suggestions?: string[]; error?: string; code?: string; diagnostic?: string } | null = null
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
      throw new AiAssistError(
        data.error || 'AI Assist is busy right now. Please try again in a moment.',
        data.code || 'busy',
        data.diagnostic || ''
      )
    }

    return { text: data.text, suggestions: data.suggestions }
  },
}