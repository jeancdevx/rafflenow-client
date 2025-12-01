import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAuth } from '@/contexts/auth-context'
import { ChevronDown, LogIn, LogOut, User, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

const Header = () => {
  const { isAuthenticated, user, signOut, isLoading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className='sticky top-0 z-50 w-full bg-background/75 backdrop-blur-sm'>
      <div className='mx-auto flex h-16 max-w-5xl items-center justify-between px-4'>
        <div className='w-32'>
          <Link
            to='/'
            className='flex items-center'
          >
            <img
              src='/logo.png'
              alt='RaffleNow'
              className='h-[52px] w-auto'
            />
          </Link>
        </div>

        {/* <nav className='flex flex-1 items-center justify-center gap-6'>
          <Link
            to='/'
            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            Inicio
          </Link>
          <Link
            to='/raffles'
            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            Sorteos
          </Link>
          {user?.isAdmin && (
            <Link
              to='/admin'
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Admin
            </Link>
          )}
        </nav> */}

        <div className='w-32 flex justify-end'>
          {isLoading ? (
            <div className='h-9 w-9 animate-pulse bg-muted rounded-full' />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center gap-2 px-2'
                >
                  {isAuthenticated ? (
                    <UserAvatar
                      seed={user?.email}
                      size='sm'
                      shape='circle'
                    />
                  ) : (
                    <div className='size-8 rounded-full bg-muted flex items-center justify-center'>
                      <User className='size-4 text-muted-foreground' />
                    </div>
                  )}
                  <ChevronDown className='size-4 text-muted-foreground' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56'
              >
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className='font-normal'>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium'>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {user?.email}
                        </p>
                        {user?.isAdmin && (
                          <span className='text-xs text-amber-600 font-medium'>
                            Administrador
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className='text-white flex items-center justify-center bg-destructive/70 cursor-pointer hover:bg-destructive/60! hover:text-white! text-xs'
                    >
                      <LogOut className='size-4 text-white' />
                      <span className='font-semibold'>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className='cursor-pointer'
                    >
                      <Link
                        to='/sign-in'
                        className='flex items-center'
                      >
                        <LogIn className='mr-2 h-4 w-4' />
                        Iniciar sesión
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className='cursor-pointer'
                    >
                      <Link
                        to='/sign-up'
                        className='flex items-center'
                      >
                        <UserPlus className='mr-2 h-4 w-4' />
                        Crear cuenta
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

export { Header }
