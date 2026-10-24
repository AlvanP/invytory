import { cn } from '@/utils/cn'

/** The Invytory mark (envelope). Files live in public/brand/. */
export function LogoMark({ className }: { className?: string }) {
  return <img src="/brand/logo-mark.svg" alt="" aria-hidden className={cn('h-8 w-auto', className)} />
}

/** The full logo: mark + wordmark. tone="light" is for dark (wine) backgrounds. */
export function Logo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <img
      src={tone === 'light' ? '/brand/logo-full-light.svg' : '/brand/logo-full.svg'}
      alt="Invytory"
      className={cn('h-9 w-auto', className)}
    />
  )
}
