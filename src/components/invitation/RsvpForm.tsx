import { useState, type FormEvent } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { SuccessState } from '@/components/ui/State'
import { guestService } from '@/services/guestService'
import { cn } from '@/utils/cn'

export function RsvpForm({ invitationId, customMessage }: { invitationId: string; customMessage?: string }) {
  const [attending, setAttending] = useState<boolean | null>(null)
  const [fullName, setFullName] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (attending === null) return
    if (!fullName.trim()) {
      setNameError('Please tell us your name.')
      return
    }
    setNameError(null)
    setFormError(null)
    setSubmitting(true)
    try {
      await guestService.submitRsvp(invitationId, {
        fullName: fullName.trim(),
        attending,
        numberOfGuests,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      // The database enforces guest-capacity and hosting-expiry rules
      // (see the Postgres trigger) — its message is safe to show as-is.
      const dbMessage = err instanceof Error ? err.message : ''
      setFormError(dbMessage || 'Something went wrong submitting your RSVP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <SuccessState
        title="Thank you!"
        description="Your RSVP has been received."
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h3 className="font-display text-2xl text-ink">Will you be joining us?</h3>
        {customMessage && <p className="mt-2 text-sm text-ink-soft">{customMessage}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAttending(true)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-sm border px-4 py-5 text-sm transition-colors',
            attending === true ? 'border-success bg-success/10 text-success' : 'border-ink/15 text-ink-soft hover:border-ink/30'
          )}
          aria-pressed={attending === true}
        >
          <Check className="size-5" />
          Yes, I&rsquo;ll be there
        </button>
        <button
          type="button"
          onClick={() => setAttending(false)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-sm border px-4 py-5 text-sm transition-colors',
            attending === false ? 'border-danger bg-danger/10 text-danger' : 'border-ink/15 text-ink-soft hover:border-ink/30'
          )}
          aria-pressed={attending === false}
        >
          <X className="size-5" />
          Sorry, I can&rsquo;t make it
        </button>
      </div>

      {attending !== null && (
        <div className="flex flex-col gap-4 border-t border-ink/10 pt-6">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Chinelo Okafor"
            error={nameError ?? undefined}
            required
          />
          {attending && (
            <Input
              label="Number of guests"
              type="number"
              min={1}
              max={10}
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
            />
          )}
          <Input
            label="Phone number"
            optional
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +234 800 000 0000"
          />
          <Textarea
            label="Message"
            optional
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a note for the couple"
            rows={3}
          />

          {formError && (
            <div className="flex items-start gap-2 rounded-xs border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Button type="submit" isLoading={submitting} className="w-full">
            Confirm Attendance
          </Button>
        </div>
      )}
    </form>
  )
}