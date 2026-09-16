import { useState } from 'react'
import { Copy, Check, Mail, MessageCircle, Share2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { QrPlaceholder } from '@/components/ui/Placeholder'

export function ShareModal({ isOpen, onClose, slug }: { isOpen: boolean; onClose: () => void; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${slug}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable in some environments — fail silently.
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share your invitation">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 rounded-xs border border-ink/15 bg-white px-3 py-2">
          <span className="flex-1 truncate text-sm text-ink-soft">{url}</span>
          <button onClick={handleCopy} aria-label="Copy link" className="rounded-xs p-1.5 text-ink-soft hover:bg-ink/5">
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <QrPlaceholder />
          <p className="text-xs text-ink-soft/70">Scannable QR codes arrive in a future version.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" size="sm" icon={<MessageCircle className="size-4" />}>WhatsApp</Button>
          <Button variant="outline" size="sm" icon={<Share2 className="size-4" />}>Facebook</Button>
          <Button variant="outline" size="sm" icon={<Mail className="size-4" />}>Email</Button>
        </div>
      </div>
    </Modal>
  )
}
