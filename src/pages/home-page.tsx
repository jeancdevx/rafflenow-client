import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className='container py-8'>
      <div className='max-w-2xl mx-auto text-center space-y-6'>
        <h1 className='text-4xl font-bold'>
          Bienvenido a{' '}
          <span className='bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            RaffleNow
          </span>
        </h1>

        <p className='text-xl text-muted-foreground'>
          La plataforma de sorteos más emocionante. Participa y gana premios
          increíbles.
        </p>

        {isAuthenticated ? (
          <div className='space-y-4'>
            <p className='text-lg'>
              ¡Hola, <span className='font-semibold'>{user?.firstName}</span>!
              {user?.isAdmin
                ? ' Tienes acceso de administrador.'
                : ' Estás listo para participar en sorteos.'}
            </p>

            {user?.isAdmin && (
              <Button
                asChild
                size='lg'
              >
                <Link to='/admin/raffles/new'>Crear nuevo sorteo</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              asChild
              size='lg'
            >
              <Link to='/sign-up'>Crear cuenta gratis</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
            >
              <Link to='/sign-in'>Ya tengo cuenta</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
