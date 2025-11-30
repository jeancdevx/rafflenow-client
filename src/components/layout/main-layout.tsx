import { Outlet } from 'react-router-dom'
import { Header } from './header'

const MainLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <main className='flex-1 mx-auto w-full max-w-7xl px-4 py-6'>
        <Outlet />
      </main>
    </div>
  )
}

export { MainLayout }
