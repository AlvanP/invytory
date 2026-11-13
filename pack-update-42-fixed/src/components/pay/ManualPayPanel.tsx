import { useState } from 'react'
import { Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react'
import { BANK_DETAILS, PAY_EMAIL, PAY_PHONES } from '@/data/paymentContact'
import { cn } from '@/utils/cn'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {
      // clipboard blocked: the number is still on screen to copy by hand
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.15em] text-ink-soft">{label}</p>
        <p className="break-words text-sm font-medium text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs', done ? 'border-success text-success' : 'border-ink/15 text-ink-soft hover:border-gold hover:text-ink')}
      >
        {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/**
 * Pay by bank transfer, then tell us. The reference goes in the transfer narration and in the
 * WhatsApp message, so we can match the payment to the invitation and publish it.
 */
export function ManualPayPanel({
  amount,
  reference,
  planName,
  email,
}: {
  amount: number
  reference: string
  planName: string
  email: string
}) {
  const text = `Hello Invytory, I have paid ₦${amount.toLocaleString()} for the ${planName} plan.\nReference: ${reference}\nEmail: ${email}\nI am attaching my payment receipt.`
  const mailto = `mailto:${PAY_EMAIL}?subject=${encodeURIComponent(`Payment ${reference}`)}&body=${encodeURIComponent(text)}`
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        Send <span className="font-medium text-ink">₦{amount.toLocaleString()}</span> to the account below from any bank or
        app (OPay, Moneypoint, your bank app). Put <span className="font-medium text-ink">{reference}</span> in the
        transfer description.
      </p>
      <div className="rounded-md border border-ink/10 bg-ivory px-4">
        <CopyRow label="BANK" value={BANK_DETAILS.bank} />
        <CopyRow label="ACCOUNT NUMBER" value={BANK_DETAILS.accountNumber} />
        <CopyRow label="ACCOUNT NAME" value={BANK_DETAILS.accountName} />
        <CopyRow label="AMOUNT" value={`₦${amount.toLocaleString()}`} />
        <CopyRow label="YOUR REFERENCE" value={reference} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.15em] text-ink-soft">THEN SEND US YOUR RECEIPT</p>
        {PAY_PHONES.map((p) => (
          <div key={p.whatsapp} className="flex flex-wrap items-center gap-2">
            <a
              href={`https://wa.me/${p.whatsapp}?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xs bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white"
            >
              <MessageCircle className="size-4" /> WhatsApp {p.display}
            </a>
            <a href={`tel:${p.tel}`} aria-label={`Call ${p.display}`} className="flex items-center gap-1.5 rounded-xs border border-ink/15 px-3 py-2.5 text-sm text-ink">
              <Phone className="size-4" /> Call
            </a>
          </div>
        ))}
        <a href={mailto} className="flex items-center justify-center gap-2 rounded-xs border border-ink/15 px-4 py-2.5 text-sm text-ink">
          <Mail className="size-4" /> Email {PAY_EMAIL}
        </a>
      </div>

      <p className="text-xs text-ink-soft">
        Your invitation is saved and will go live as soon as we confirm your payment. We reply as quickly as we can.
      </p>
    </div>
  )
}
