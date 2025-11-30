import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string })?.from || '/'

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleSignIn = async (values: SignInFormValues) => {
    setIsLoading(true)

    try {
      await signIn({
        email: values.email,
        password: values.password
      })

      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente'
      })

      navigate(from, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al iniciar sesión'

      if (
        message.includes('NotAuthorizedException') ||
        message.includes('Incorrect username or password')
      ) {
        toast.error('Credenciales incorrectas', {
          description: 'Verifica tu correo y contraseña'
        })
      } else if (message.includes('UserNotConfirmedException')) {
        toast.error('Cuenta no verificada', {
          description: 'Debes verificar tu correo antes de iniciar sesión'
        })
        navigate('/sign-up', {
          state: { needsConfirmation: true, email: values.email }
        })
      } else if (message.includes('UserNotFoundException')) {
        toast.error('Usuario no encontrado', {
          description: 'No existe una cuenta con este correo'
        })
      } else if (message.includes('CONFIRM_SIGN_UP')) {
        toast.error('Cuenta no verificada', {
          description: 'Debes verificar tu correo antes de iniciar sesión'
        })
      } else {
        toast.error('Error al iniciar sesión', { description: message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-muted/30'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignIn)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='tu@email.com'
                        autoComplete='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Contraseña</FormLabel>
                      {/* TODO: Implement forgot password */}
                      {/* <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link> */}
                    </div>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          autoComplete='current-password'
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Eye className='h-4 w-4 text-muted-foreground' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className='size-4 animate-spin' />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-muted-foreground'>
            ¿No tienes cuenta?{' '}
            <Link
              to='/sign-up'
              className='text-primary font-medium hover:underline'
            >
              Crear cuenta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export { SignInPage }
