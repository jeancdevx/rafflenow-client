import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { AppRouter } from '@/router'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position='bottom-right'
        richColors
      />
    </AuthProvider>
  )
}

export default App
