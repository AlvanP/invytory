import { type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-md bg-ivory p-6 shadow-lift animate-[modalIn_0.25s_ease-out]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="modal-title" className="font-display text-2xl text-ink">{title}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="rounded-xs p-1 text-ink-soft hover:bg-ink/5"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
