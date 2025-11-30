import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel'
import { Progress } from '@/components/ui/progress'
import type { Raffle, RaffleStatus } from '@/types/raffle'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Autoplay from 'embla-carousel-autoplay'
import { Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

interface RaffleCardProps {
  raffle: Raffle
}

const statusConfig: Record<RaffleStatus, { label: string; className: string }> =
  {
    active: {
      label: 'Activo',
      className: 'bg-green-600/50 backdrop-blur-md border-2 border-green-600'
    },
    processing: {
      label: 'Procesando',
      className: 'bg-amber-300/50 backdrop-blur-md border-2 border-amber-600'
    },
    completed: {
      label: 'Finalizado',
      className:
        'bg-fuchsia-600/50 backdrop-blur-md border-2 border-fuchsia-600'
    },
    cancelled: {
      label: 'Cancelado',
      className:
        'bg-destructive/50 backdrop-blur-md border-2 border-destructive'
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
  return value.toString()
}

const getTimeRemaining = (endDate: string, status: RaffleStatus): string => {
  const end = new Date(endDate)
  const now = new Date()

  if (status !== 'active' || end <= now) {
    return 'Finalizado'
  }

  return formatDistanceToNow(end, { locale: es, addSuffix: false })
}

const getParticipationPercentage = (raffle: Raffle): number => {
  if (raffle.max_participants === 0) return 0
  return Math.round(
    (raffle.current_participants / raffle.max_participants) * 100
  )
}

const RaffleCard = ({ raffle }: RaffleCardProps) => {
  const status = statusConfig[raffle.status]
  const percentage = getParticipationPercentage(raffle)
  const hasMultipleImages = raffle.prize_images.length > 1

  return (
    <Card className='group overflow-hidden transition-all border-none py-0 rounded-md gap-y-2 shadow-none flex flex-col'>
      <div className='relative aspect-video rounded-md overflow-hidden'>
        {raffle.prize_images.length > 0 ? (
          hasMultipleImages ? (
            <Carousel
              opts={{
                loop: true
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true
                })
              ]}
              className='w-full h-full'
            >
              <CarouselContent className='h-full ml-0'>
                {raffle.prize_images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className='h-full pl-0 overflow-hidden'
                  >
                    <img
                      src={image}
                      alt={`${raffle.title} - Imagen ${index + 1}`}
                      className='size-full object-cover transition-transform group-hover:scale-105'
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <img
              src={raffle.prize_images[0]}
              alt={raffle.title}
              className='size-full object-cover transition-transform group-hover:scale-105'
            />
          )
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-muted'>
            <span className='text-muted-foreground'>Sin imagen</span>
          </div>
        )}

        <Badge className={`absolute right-2 top-2 ${status.className}`}>
          {status.label}
        </Badge>

        <Badge
          variant='secondary'
          className='absolute left-2 top-2'
        >
          {categoryLabels[raffle.category] || raffle.category}
        </Badge>

        {hasMultipleImages && (
          <div className='absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md'>
            {raffle.prize_images.length} fotos
          </div>
        )}
      </div>

      <CardContent className='px-3 py-2 flex-1'>
        <h3 className='line-clamp-2 text-lg font-semibold group-hover:text-primary'>
          {raffle.title}
        </h3>

        <p className='mt-2 text-sm text-muted-foreground line-clamp-2'>
          {raffle.description}
        </p>

        <div className='mt-4 space-y-1'>
          <div className='flex items-center justify-between text-sm'>
            <span className='flex items-center gap-1 text-muted-foreground'>
              <Users className='h-4 w-4' />
              Participantes
            </span>
            <span className='font-medium'>
              {formatNumber(raffle.current_participants)} /{' '}
              {formatNumber(raffle.max_participants)}
            </span>
          </div>
          <Progress
            value={percentage}
            className='h-2 '
          />
        </div>
      </CardContent>

      <CardFooter className='px-3 py-3 flex flex-col gap-3'>
        <div className='flex w-full items-center justify-between text-sm text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Clock className='h-4 w-4' />
            {raffle.status === 'active' ? (
              <>Quedan {getTimeRemaining(raffle.end_date, raffle.status)}</>
            ) : (
              getTimeRemaining(raffle.end_date, raffle.status)
            )}
          </span>
        </div>

        <Button
          asChild
          variant='default'
          className='w-full'
        >
          <Link to={`/raffles/${raffle.raffle_id}`}>Ver detalle</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export { RaffleCard }
