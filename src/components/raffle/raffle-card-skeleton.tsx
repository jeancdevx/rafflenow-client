import { Skeleton } from '@/components/ui/skeleton'

export function RaffleCardSkeleton() {
  return (
    <div className='overflow-hidden rounded-lg border bg-card'>
      <Skeleton className='aspect-video w-full' />

      <div className='p-4 space-y-3'>
        <Skeleton className='h-6 w-3/4' />

        <Skeleton className='h-7 w-1/3' />

        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>

        <div className='space-y-2 pt-2'>
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-2 w-full' />
        </div>
      </div>

      <div className='border-t px-4 py-3'>
        <Skeleton className='h-4 w-32' />
      </div>
    </div>
  )
}

export function RaffleCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <RaffleCardSkeleton key={i} />
      ))}
    </div>
  )
}
