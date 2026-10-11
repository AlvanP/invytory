import { useRef, useState } from 'react'
import { Sparkles, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { ceremonyDisplayName } from '@/types'
import { aiService, type AiField, type AiResult } from '@/services/aiService'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

const DETAIL_PROMPTS: Record<AiField, string> = {
  loveStory: 'A few details to include, e.g. where you met, how long you have been together, a favourite memory, the proposal.',
  howWeMet: 'e.g. the place, the year, who introduced you, what you remember about that day.',
  vows: 'e.g. what you admire about your partner, promises that matter to you.',
  hashtag: 'Any words you want in it, e.g. a nickname or a favourite phrase.',
  giftInformation: 'e.g. cash gifts are welcome, or "your presence is the only gift we need".',
  additionalMessage: 'e.g. dress colours, parking, what time guests should arrive, anything guests should know.',
  rsvpMessage: 'e.g. the date guests should reply by.',
}

const LABELS: Record<AiField, string> = {
  loveStory: 'our story',
  howWeMet: 'how we met',
  vows: 'vows',
  hashtag: 'hashtag',
  giftInformation: 'gift information',
  additionalMessage: 'additional message',
  rsvpMessage: 'RSVP message',
}

/**
 * "AI Assist" for one piece of wording. Shows a small button; opening it
 * lets the couple add a few details, get a suggestion, then Use it,
 * Regenerate, or Edit it first. Nothing is written into the field until
 * they press Use.
 */
export function AiAssist({
  field,
  currentValue,
  onUse,
  onlyCeremonyId,
}: {
  field: AiField
  /** What is in the field right now, so we can warn that Use replaces it. */
  currentValue?: string
  onUse: (text: string) => void
  /** For per-ceremony wording (the RSVP message): write for this ceremony only. */
  onlyCeremonyId?: string
}) {
  const { draft } = useWizard()
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiResult | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const variationRef = useRef(0)
  const editRef = useRef<HTMLTextAreaElement>(null)

  const bride = (draft.brideName ?? '').trim()
  const groom = (draft.groomName ?? '').trim()
  const hasNames = !!bride && !!groom
  const isHashtag = field === 'hashtag'

  async function generate(isRetry: boolean) {
    if (!hasNames || loading) return
    setLoading(true)
    setError(null)
    setEditing(false)
    if (isRetry) variationRef.current += 1
    else variationRef.current = 0

    const ceremonies = draft.ceremonies
      .filter((c) => !onlyCeremonyId || c.id === onlyCeremonyId)
      .map((c) => ({
        name: ceremonyDisplayName(c),
        date: c.weddingDate ?? '',
        city: c.city ?? '',
      }))

    const previous = isRetry ? (result?.text ?? result?.suggestions?.join(' ')) : undefined

    try {
      const next = await aiService.suggest({
        field,
        details: details.trim(),
        bride,
        groom,
        ceremonies,
        previous,
        variation: variationRef.current,
      })
      setResult(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function close() {
    setOpen(false)
    setResult(null)
    setError(null)
    setEditing(false)
    variationRef.current = 0
  }

  function applyText(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    onUse(trimmed)
    close()
  }

  function startEditing() {
    setEditing(true)
    // Wait for the box to become editable, then put the cursor in it.
    setTimeout(() => editRef.current?.focus(), 0)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-fit items-center gap-1.5 text-xs text-gold hover:underline"
      >
        <Sparkles className="size-3.5" />
        AI Assist
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-gold/40 bg-gold/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <Sparkles className="size-4 text-gold" />
          AI Assist for {LABELS[field]}
        </p>
        <button type="button" onClick={close} aria-label="Close AI Assist" className="text-ink-soft hover:text-ink">
          <X className="size-4" />
        </button>
      </div>

      {!hasNames ? (
        <p className="text-sm text-ink-soft">Add both names on the &ldquo;couple&rdquo; step first, then AI Assist can write for you.</p>
      ) : (
        <>
          {!result && (
            <Textarea
              label="Details to include"
              optional
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={DETAIL_PROMPTS[field]}
              hint="The more you tell it, the more personal it will sound. It will not invent facts."
            />
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          {!result && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" size="sm" isLoading={loading} onClick={() => generate(false)}>
                {loading ? 'Writing…' : isHashtag ? 'Suggest hashtags' : 'Write it for us'}
              </Button>
              <p className="text-[11px] text-ink-soft/70">
                Your names and what you type here are sent to an AI service to write the suggestion.
              </p>
            </div>
          )}

          {result?.suggestions && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-ink-soft">Tap one to use it.</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyText(tag)}
                    className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink transition-colors hover:border-gold"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div>
                <Button type="button" size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} isLoading={loading} onClick={() => generate(true)}>
                  More ideas
                </Button>
              </div>
            </div>
          )}

          {result?.text !== undefined && (
            <div className="flex flex-col gap-3">
              <textarea
                ref={editRef}
                value={result.text}
                readOnly={!editing}
                onChange={(e) => setResult({ text: e.target.value })}
                rows={Math.min(10, Math.max(4, Math.ceil(result.text.length / 60)))}
                aria-label="Suggested text"
                className="w-full resize-y rounded-xs border border-ink/15 bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
              {currentValue && currentValue.trim() && (
                <p className="text-[11px] text-ink-soft/70">Using this will replace what is already in the box.</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" icon={<Check className="size-3.5" />} onClick={() => applyText(result.text ?? '')}>
                  Use text
                </Button>
                <Button type="button" size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} isLoading={loading} onClick={() => generate(true)}>
                  Regenerate
                </Button>
                {!editing && (
                  <Button type="button" size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={startEditing}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
