import { cn } from '@/utils/cn'

/** The Invytory mark: an envelope flap that is also the letter "y". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn('size-7', className)} fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="25" height="25" rx="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 9 L14 15.5 L20.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 15.5 V21.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-wine', className)}>
      <LogoMark className={markClassName} />
      <span className="font-brand text-[1.65rem] leading-none tracking-tight">Invytory</span>
    </span>
  )
}
