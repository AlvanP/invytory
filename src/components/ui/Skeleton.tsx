import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xs bg-ink/8', className)} />
}

export function TemplateCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[3/4] w-full rounded-md" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink/10 p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function GuestRowSkeleton() {
  return (
    <div className="grid grid-cols-6 gap-4 border-b border-ink/8 px-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

export function InvitationPreviewSkeleton() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16">
      <Skeleton className="aspect-[3/4] w-64 rounded-md" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}
