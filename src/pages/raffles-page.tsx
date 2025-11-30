import { RaffleCard } from '@/components/raffle/raffle-card'
import { RaffleCardSkeletonGrid } from '@/components/raffle/raffle-card-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listRaffles } from '@/lib/api'
import type { Raffle, RaffleStatus } from '@/types/raffle'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterStatus = RaffleStatus | 'all'

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' }
]

const isValidStatus = (status: string | null): status is FilterStatus => {
  return (
    status === 'all' ||
    status === 'active' ||
    status === 'processing' ||
    status === 'completed' ||
    status === 'cancelled'
  )
}

export function RafflesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const filter: FilterStatus = isValidStatus(statusParam) ? statusParam : 'all'

  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const cursorRef = useRef<string | null>(null)

  const setFilter = (newFilter: FilterStatus) => {
    if (newFilter === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ status: newFilter })
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchRaffles = async () => {
      setIsLoading(true)
      setError(null)

      const response = await listRaffles({
        status: filter === 'all' ? undefined : filter,
        limit: 12
      })

      if (!isMounted) return

      setIsLoading(false)

      if (!response.ok || !response.data) {
        setError(response.error?.message || 'Error al cargar los sorteos')
        return
      }

      setRaffles(response.data.raffles)
      cursorRef.current = response.data.next_cursor
      setHasMore(response.data.has_more)
    }

    fetchRaffles()

    return () => {
      isMounted = false
    }
  }, [filter])

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !cursorRef.current) return

    setIsLoadingMore(true)

    const response = await listRaffles({
      status: filter === 'all' ? undefined : filter,
      cursor: cursorRef.current,
      limit: 12
    })

    setIsLoadingMore(false)

    if (!response.ok || !response.data) {
      return
    }

    setRaffles((prev) => [...prev, ...response.data!.raffles])
    cursorRef.current = response.data.next_cursor
    setHasMore(response.data.has_more)
  }

  const handleRetry = () => {
    // Force re-fetch by toggling a key or simply re-running
    setFilter(filter)
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Sorteos</h1>
          <p className='text-muted-foreground'>
            Explora todos los sorteos disponibles
          </p>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {filterOptions.map((option) => (
          <Badge
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            className='cursor-pointer px-3 py-1 text-sm transition-colors'
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <RaffleCardSkeletonGrid count={6} />
      ) : error ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
          <AlertCircle className='h-12 w-12 text-destructive' />
          <p className='mt-4 text-lg font-medium'>Error al cargar</p>
          <p className='text-muted-foreground'>{error}</p>
          <Button
            variant='outline'
            className='mt-4'
            onClick={handleRetry}
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Reintentar
          </Button>
        </div>
      ) : raffles.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
          <p className='text-lg font-medium'>No hay sorteos</p>
          <p className='text-muted-foreground'>
            {filter === 'all'
              ? 'Aún no hay sorteos disponibles'
              : `No hay sorteos con estado "${
                  filterOptions.find((f) => f.value === filter)?.label
                }"`}
          </p>
        </div>
      ) : (
        <>
          <div className='grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
            {raffles.map((raffle) => (
              <RaffleCard
                key={raffle.raffle_id}
                raffle={raffle}
              />
            ))}
          </div>

          {hasMore && (
            <div className='flex justify-center pt-4'>
              <Button
                variant='outline'
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Cargando...
                  </>
                ) : (
                  'Cargar más'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
