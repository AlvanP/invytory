import { useState, type FormEvent } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { SuccessState } from '@/components/ui/State'
import { guestService } from '@/services/guestService'
import { cn } from '@/utils/cn'
import { wallService } from '@/services/wallService'
import { useWall } from '@/templates/WallContext'
import { useDesign } from '@/templates/DesignContext'
import { guestCopy } from '@/templates/events'
import { useInvitee } from '@/templates/InviteeContext'

/**
 * What this device last submitted for an invitation. Remembering it lets
 * the form show "you've already responded" on a return visit instead of
 * offering the same options again. It is a per-device safeguard against
 * accidental double responses, not a security check: it lives in the
 * browser, and the guest can deliberately respond again for someone else.
 */
interface StoredRsvp {
  name: string
  attending: boolean
  guests: number
}

const storageKey = (invitationId: string) => `invytory:rsvp:${invitationId}`

function readStoredRsvp(invitationId: string): StoredRsvp | null {
  try {
    const raw = localStorage.getItem(storageKey(invitationId))
    return raw ? (JSON.parse(raw) as StoredRsvp) : null
  } catch {
    return null
  }
}

function writeStoredRsvp(invitationId: string, value: StoredRsvp) {
  try {
    localStorage.setItem(storageKey(invitationId), JSON.stringify(value))
  } catch {
    // Storage blocked (private mode etc.): the form simply won't remember.
  }
}

function clearStoredRsvp(invitationId: string) {
  try {
    localStorage.removeItem(storageKey(invitationId))
  } catch {
    // Nothing to clear.
  }
}

export function RsvpForm({ invitationId, customMessage }: { invitationId: string; customMessage?: string }) {
  const [attending, setAttending] = useState<boolean | null>(null)
  const invitee = useInvitee()
  const [fullName, setFullName] = useState(invitee?.name ?? '')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [shareOnWall, setShareOnWall] = useState(false)
  const [onWall, setOnWall] = useState(false)
  const wall = useWall()
  const { kind } = useDesign()
  const guest = guestCopy[kind]
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [previous, setPrevious] = useState<StoredRsvp | null>(() => readStoredRsvp(invitationId))
  const [nameError, setNameError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || attending === null) return
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
        inviteCode: invitee?.code,
      })
      // The RSVP is saved. If the guest ticked the box, also leave the message on the couple's wall.
      // A problem here must not undo or hide the RSVP, so it is only logged.
      if (guest.wallOptIn && shareOnWall && message.trim()) {
        try {
          await wallService.post(invitationId, fullName, message)
          wall.add({
            id: `local-${Date.now()}`,
            invitationId,
            guestName: fullName.trim().slice(0, 80),
            message: message.trim().slice(0, 500),
            createdAt: new Date().toISOString(),
          })
          setOnWall(true)
        } catch (wallErr) {
          console.error('[rsvp] wall message failed:', wallErr)
        }
      }
      writeStoredRsvp(invitationId, {
        name: fullName.trim(),
        attending,
        guests: attending ? numberOfGuests : 0,
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

  function respondAgain() {
    clearStoredRsvp(invitationId)
    setPrevious(null)
    setAttending(null)
    setFullName(invitee?.name ?? '')
    setNumberOfGuests(1)
    setPhone('')
    setMessage('')
    setShareOnWall(false)
    setFormError(null)
  }

  if (submitted) {
    return (
      <SuccessState
        title="Thank you!"
        description={onWall ? `Your RSVP has been received, and ${guest.wallDone}` : 'Your RSVP has been received.'}
      />
    )
  }

  if (previous) {
    const people = previous.guests === 1 ? '1 person' : `${previous.guests} people`
    return (
      <SuccessState
        title="You've already responded"
        description={
          previous.attending
            ? `Thank you, ${previous.name}. We have you down as attending, for ${people}.`
            : `Thank you, ${previous.name}. We've noted that you can't make it.`
        }
        action={
          <button
            type="button"
            onClick={respondAgain}
            className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Responding for someone else? Send another RSVP
          </button>
        }
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
            attending === true ? 'border-[color:var(--iv-main)] bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]' : 'border-ink/20 text-ink hover:border-ink/40'
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
            attending === false ? 'border-ink bg-ink text-white' : 'border-ink/20 text-ink hover:border-ink/40'
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
            placeholder={guest.messagePlaceholder}
            rows={3}
            maxLength={500}
          />
          {guest.wallOptIn && (
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={shareOnWall}
              disabled={!message.trim()}
              onChange={(e) => setShareOnWall(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[color:var(--iv-main)]"
            />
            <span>
              {guest.wallOptIn}
              <span className="block text-xs text-ink-soft/70">Everyone who opens this invitation will be able to read it, with your name.</span>
            </span>
          </label>
          )}

          {formError && (
            <div className="flex items-start gap-2 rounded-xs border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Button
            type="submit"
            isLoading={submitting}
            className="w-full"
            style={{ backgroundColor: 'var(--iv-main)', color: 'var(--iv-on-main)', borderColor: 'var(--iv-main)' }}
          >
            Confirm Attendance
          </Button>
        </div>
      )}
    </form>
  )
}
