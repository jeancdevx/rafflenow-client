import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({
  children,
  requireAdmin = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to='/sign-in'
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  if (requireAdmin && !user?.isAdmin) {
    return (
      <Navigate
        to='/'
        replace
      />
    )
  }

  return <>{children}</>
}

interface GuestRouteProps {
  children: React.ReactNode
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || '/'
    return (
      <Navigate
        to={from}
        replace
      />
    )
  }

  return <>{children}</>
}

export { GuestRoute, ProtectedRoute }
