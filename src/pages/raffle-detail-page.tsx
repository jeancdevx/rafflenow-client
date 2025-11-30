import { CountdownTimer } from '@/components/raffle/countdown-timer'
import { ParticipateButton } from '@/components/raffle/participate-button'
import { RaffleImageGallery } from '@/components/raffle/raffle-image-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { getRaffleById, participateInRaffle } from '@/lib/api'
import type { RaffleDetail, RaffleStatus } from '@/types/raffle'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Tag,
  Trophy,
  Users,
  XCircle
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const statusConfig: Record<
  RaffleStatus,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  active: {
    label: 'Activo',
    className: 'bg-green-600 hover:bg-green-600'
  },
  processing: {
    label: 'Seleccionando ganador',
    className: 'bg-yellow-500 hover:bg-yellow-500',
    icon: <Loader2 className='h-3 w-3 animate-spin' />
  },
  completed: {
    label: 'Finalizado',
    className: 'bg-blue-500 hover:bg-blue-500',
    icon: <Trophy className='h-3 w-3' />
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-destructive hover:bg-destructive',
    icon: <XCircle className='h-3 w-3' />
  }
}

const categoryLabels: Record<string, string> = {
  pequeño: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande',
  premium: 'Premium'
}

const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return value.toLocaleString()
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const RaffleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user, getAccessToken } = useAuth()

  const [raffle, setRaffle] = useState<RaffleDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isPendingParticipation, setIsPendingParticipation] = useState(false)

  const fetchRaffleWithAuth = useCallback(
    async (raffleId: string) => {
      const token = isAuthenticated ? await getAccessToken() : undefined
      return getRaffleById(raffleId, token ?? undefined)
    },
    [isAuthenticated, getAccessToken]
  )

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const fetchRaffle = async () => {
      setIsLoading(true)
      setError(null)

      const response = await fetchRaffleWithAuth(id)

      if (!isMounted) return

      setIsLoading(false)

      if (!response.ok || !response.data) {
        setError(response.error?.message || 'Error al cargar el sorteo')
        return
      }

      setRaffle(response.data)
    }

    fetchRaffle()

    return () => {
      isMounted = false
    }
  }, [id, fetchRaffleWithAuth])

  useEffect(() => {
    if (!isPendingParticipation || !id) return

    const pollInterval = setInterval(async () => {
      const response = await fetchRaffleWithAuth(id)
      if (response.ok && response.data) {
        const canParticipateNow =
          'can_participate' in response.data && response.data.can_participate
        const hasParticipated =
          'user_has_participated' in response.data &&
          response.data.user_has_participated

        if (!canParticipateNow || hasParticipated) {
          setRaffle(response.data)
          setIsPendingParticipation(false)
          toast.success('¡Participación confirmada!', {
            description: 'Ya estás participando en este sorteo'
          })
        }
      }
    }, 2000)

    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
      setIsPendingParticipation(false)
      toast.info('Participación en proceso', {
        description:
          'Tu solicitud está siendo procesada. Recarga la página en unos momentos.'
      })
    }, 30000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [isPendingParticipation, id, fetchRaffleWithAuth])

  const handleParticipate = async () => {
    if (!id || !isAuthenticated || isPendingParticipation) return

    setIsParticipating(true)

    try {
      const token = await getAccessToken()
      if (!token) {
        toast.error('Sesión expirada', {
          description: 'Por favor inicia sesión nuevamente'
        })
        return
      }

      const response = await participateInRaffle(token, id)

      if (!response.ok) {
        toast.error('Error al participar', {
          description: response.error?.message || 'Intenta nuevamente'
        })
        return
      }

      if (response.status === 202) {
        toast.info('Solicitud en cola', {
          description: 'Tu participación está siendo procesada...'
        })
        setIsPendingParticipation(true)
      } else {
        toast.success('¡Participación registrada!', {
          description: 'Ya estás participando en este sorteo'
        })
        const refreshed = await fetchRaffleWithAuth(id)
        if (refreshed.ok && refreshed.data) {
          setRaffle(refreshed.data)
        }
      }
    } finally {
      setIsParticipating(false)
    }
  }

  const handleExpire = () => {
    if (id) {
      fetchRaffleWithAuth(id).then((response) => {
        if (response.ok && response.data) {
          setRaffle(response.data)
        }
      })
    }
  }

  if (isLoading) {
    return <RaffleDetailSkeleton />
  }

  if (error || !raffle) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <AlertCircle className='h-12 w-12 text-destructive' />
        <p className='mt-4 text-lg font-medium'>Error al cargar</p>
        <p className='text-muted-foreground'>
          {error || 'Sorteo no encontrado'}
        </p>
        <Button
          asChild
          variant='outline'
          className='mt-4'
        >
          <Link to='/raffles'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a sorteos
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[raffle.status]
  const isActive = raffle.status === 'active'
  const participationPercentage =
    'participation_percentage' in raffle ? raffle.participation_percentage : 0
  const canParticipate =
    'can_participate' in raffle ? raffle.can_participate : false
  const userHasParticipated =
    'user_has_participated' in raffle ? raffle.user_has_participated : false

  return (
    <div className='space-y-6'>
      <Button
        asChild
        variant='ghost'
        size='sm'
      >
        <Link to='/raffles'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Volver a sorteos
        </Link>
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8'>
        <div>
          <RaffleImageGallery
            images={raffle.prize_images}
            title={raffle.title}
          />
        </div>

        <div className='space-y-6'>
          <div>
            <div className='flex items-start justify-between gap-4'>
              <h1 className='text-2xl lg:text-4xl font-bold'>{raffle.title}</h1>
              <Badge className={`shrink-0 ${status.className}`}>
                {status.icon}
                <span className={status.icon ? 'ml-1' : ''}>
                  {status.label}
                </span>
              </Badge>
            </div>
          </div>

          {isActive && (
            <div>
              <CountdownTimer
                endDate={raffle.end_date}
                onExpire={handleExpire}
              />
            </div>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between items-center text-sm'>
                <span className='flex items-center gap-1'>
                  <Users className='h-4 w-4' />
                  Participantes
                </span>
                <span className='font-medium'>
                  {formatNumber(raffle.current_participants)} /{' '}
                  {formatNumber(raffle.max_participants)}
                </span>
              </div>
              <Progress
                value={participationPercentage}
                className='h-3'
              />
              <p className='text-xs text-muted-foreground text-right'>
                {formatNumber(
                  raffle.max_participants - raffle.current_participants
                )}{' '}
                tickets disponibles · {participationPercentage}% completado
              </p>
            </div>

            {isActive && (
              <ParticipateButton
                canParticipate={canParticipate}
                userHasParticipated={userHasParticipated}
                isAuthenticated={isAuthenticated}
                isAdmin={user?.isAdmin || false}
                onParticipate={handleParticipate}
                isParticipating={isParticipating}
                isPending={isPendingParticipation}
              />
            )}

            {raffle.status === 'processing' && (
              <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto text-yellow-500' />
                <p className='mt-2 font-medium'>Seleccionando ganador...</p>
                <p className='text-sm text-muted-foreground'>
                  Este proceso puede tomar unos minutos
                </p>
              </div>
            )}

            {raffle.status === 'completed' && 'winner_name' in raffle && (
              <div className='bg-primary/10 border border-primary/20 rounded-lg p-4 text-center'>
                <Trophy className='h-8 w-8 mx-auto text-primary' />
                <p className='mt-2 font-medium'>
                  {raffle.winner_name
                    ? `Ganador: ${raffle.winner_name}`
                    : 'Sin ganador (no hubo participantes)'}
                </p>
                {raffle.winner_selected_at && (
                  <p className='text-sm text-muted-foreground'>
                    Seleccionado{' '}
                    {formatDistanceToNow(new Date(raffle.winner_selected_at), {
                      locale: es,
                      addSuffix: true
                    })}
                  </p>
                )}
              </div>
            )}

            {raffle.status === 'cancelled' &&
              'cancellation_reason' in raffle && (
                <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center'>
                  <XCircle className='h-8 w-8 mx-auto text-destructive' />
                  <p className='mt-2 font-medium'>Sorteo cancelado</p>
                  <p className='text-sm text-muted-foreground'>
                    {raffle.cancellation_reason}
                  </p>
                </div>
              )}
          </div>

          <Separator />

          <div>
            <h2 className='font-semibold mb-2'>Descripción</h2>
            <p className='text-muted-foreground whitespace-pre-line'>
              {raffle.description}
            </p>
          </div>

          <Separator />

          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Inicio:</span>
              <span>{formatDate(raffle.start_date)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Cierre:</span>
              <span>{formatDate(raffle.end_date)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Categoría:</span>
              <Badge variant='secondary'>
                {categoryLabels[raffle.category] || raffle.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RaffleDetailSkeleton = () => {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-9 w-40' />

      <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8'>
        <div className='space-y-3'>
          <Skeleton className='aspect-video w-full rounded-lg' />
          <div className='flex gap-2'>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className='w-20 h-20 rounded-md'
              />
            ))}
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <Skeleton className='h-8 w-3/4' />
            <Skeleton className='h-8 w-1/3 mt-2' />
          </div>

          <div className='flex gap-2'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className='h-16 w-16 rounded-lg'
              />
            ))}
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-full' />
          </div>

          <Skeleton className='h-12 w-full' />

          <Skeleton className='h-px w-full' />

          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-20 w-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export { RaffleDetailPage }
