import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Loader2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ParticipateButtonProps {
  canParticipate: boolean
  userHasParticipated: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  onParticipate: () => void
  isParticipating: boolean
  isPending?: boolean
}

const ParticipateButton = ({
  canParticipate,
  userHasParticipated,
  isAuthenticated,
  isAdmin,
  onParticipate,
  isParticipating,
  isPending = false
}: ParticipateButtonProps) => {
  if (userHasParticipated) {
    return (
      <Button
        disabled
        className='w-full'
        size='lg'
      >
        <CheckCircle className='mr-2 h-5 w-5' />
        Ya estás participando
      </Button>
    )
  }

  if (isPending) {
    return (
      <Button
        disabled
        className='w-full'
        size='lg'
      >
        <Clock className='mr-2 h-5 w-5 animate-pulse' />
        Procesando participación...
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button
        asChild
        className='w-full'
        size='lg'
      >
        <Link to='/sign-in'>
          <LogIn className='mr-2 h-5 w-5' />
          Inicia sesión para participar
        </Link>
      </Button>
    )
  }

  if (isAdmin) {
    return (
      <Button
        disabled
        variant='secondary'
        className='w-full'
        size='lg'
      >
        Los administradores no pueden participar
      </Button>
    )
  }

  if (!canParticipate) {
    return (
      <Button
        disabled
        variant='secondary'
        className='w-full'
        size='lg'
      >
        No disponible
      </Button>
    )
  }

  return (
    <Button
      onClick={onParticipate}
      disabled={isParticipating}
      className='w-full'
      size='lg'
    >
      {isParticipating ? (
        <>
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          Participando...
        </>
      ) : (
        'Participar en el sorteo'
      )}
    </Button>
  )
}

export { ParticipateButton }
