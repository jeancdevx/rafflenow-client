import { GuestRoute } from '@/components/auth/protected-route'
import { MainLayout } from '@/components/layout/main-layout'
import { SignInPage } from '@/pages/auth/sign-in-page'
import { SignUpPage } from '@/pages/auth/sign-up-page'
import { HomePage } from '@/pages/home-page'
import { RaffleDetailPage } from '@/pages/raffle-detail-page'
import { RafflesPage } from '@/pages/raffles-page'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'raffles',
        element: <RafflesPage />
      },
      {
        path: 'raffles/:id',
        element: <RaffleDetailPage />
      }
    ]
  },
  // Auth routes (outside main layout)
  {
    path: '/sign-in',
    element: (
      <GuestRoute>
        <SignInPage />
      </GuestRoute>
    )
  },
  {
    path: '/sign-up',
    element: (
      <GuestRoute>
        <SignUpPage />
      </GuestRoute>
    )
  }
  // TODO: Add admin routes here
  // {
  //   path: '/admin',
  //   element: (
  //     <ProtectedRoute requireAdmin>
  //       <AdminLayout />
  //     </ProtectedRoute>
  //   ),
  //   children: [...],
  // },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
