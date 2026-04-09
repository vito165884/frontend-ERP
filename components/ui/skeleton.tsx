import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-white/10 animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

function SkeletonTable() {
  return (
    <div className="space-y-0">
      {/* Header Row */}
      <div className="flex gap-4 p-4 bg-white/5 border-b border-white/10 rounded-t-lg">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32 ml-4" />
        <Skeleton className="h-4 w-40 ml-auto" />
      </div>
      {/* Data Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex gap-4 p-4 bg-white/5 border-b border-white/10',
            i === 5 && 'rounded-b-lg'
          )}
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32 ml-4" />
          <Skeleton className="h-4 w-40 ml-auto" />
        </div>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonTable, SkeletonCard, SkeletonGrid }
