import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, Loader2Icon, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import {
  confirmCodeSchema,
  signUpSchema,
  type ConfirmCodeFormValues,
  type SignUpFormValues
} from '@/lib/validations/auth'

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'

type SignUpStep = 'register' | 'confirm'

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@')
  if (!domain) return '***@***.***'

  const [domainName, ...tldParts] = domain.split('.')
  const tld = tldParts.join('.')

  const maskedLocal = localPart.charAt(0) + '***'
  const maskedDomain = domainName.charAt(0) + '***'

  return `${maskedLocal}@${maskedDomain}.${tld}`
}

const SignUpPage = () => {
  const [step, setStep] = useState<SignUpStep>('register')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const { signUp, confirmSignUp, resendConfirmationCode } = useAuth()
  const navigate = useNavigate()

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const confirmForm = useForm<ConfirmCodeFormValues>({
    resolver: zodResolver(confirmCodeSchema),
    defaultValues: {
      code: ''
    }
  })

  const watchPassword = signUpForm.watch('password')

  const passwordRequirements = [
    { label: 'Al menos 8 caracteres', met: watchPassword?.length >= 8 },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(watchPassword || '') },
    { label: 'Una letra minúscula', met: /[a-z]/.test(watchPassword || '') },
    { label: 'Un número', met: /[0-9]/.test(watchPassword || '') },
    {
      label: 'Un carácter especial',
      met: /[^A-Za-z0-9]/.test(watchPassword || '')
    }
  ]

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true)

    try {
      const { nextStep } = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      })

      if (nextStep === 'CONFIRM_SIGN_UP') {
        setEmail(values.email)
        setStep('confirm')
        toast.success('Código enviado', {
          description: 'Revisa tu correo para obtener el código de verificación'
        })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear cuenta'

      if (
        message.includes('UsernameExistsException') ||
        message.includes('already exists')
      ) {
        try {
          await resendConfirmationCode(values.email)
          setEmail(values.email)
          setStep('confirm')
          toast.info('Cuenta pendiente de verificación', {
            description: 'Te hemos reenviado el código de verificación'
          })
        } catch {
          toast.error('Este correo ya está registrado', {
            description: 'Intenta iniciar sesión o usa otro correo'
          })
        }
      } else {
        toast.error('Error al crear cuenta', { description: message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (values: ConfirmCodeFormValues) => {
    setIsLoading(true)

    try {
      await confirmSignUp({
        email,
        code: values.code
      })

      toast.success('¡Cuenta verificada!', {
        description: 'Ya puedes iniciar sesión'
      })

      navigate('/sign-in')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Código inválido'

      if (
        message.includes('CodeMismatchException') ||
        message.includes('Invalid')
      ) {
        toast.error('Código incorrecto', {
          description: 'Verifica el código e intenta de nuevo'
        })
      } else if (message.includes('ExpiredCodeException')) {
        toast.error('Código expirado', {
          description: 'Solicita un nuevo código'
        })
      } else {
        toast.error('Error de verificación', { description: message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      await resendConfirmationCode(email)
      toast.success('Código reenviado', {
        description: 'Revisa tu correo'
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al reenviar'
      toast.error('No se pudo reenviar el código', { description: message })
    } finally {
      setIsResending(false)
    }
  }

  if (step === 'register') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-muted/30'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl'>Crear cuenta</CardTitle>
            <CardDescription>
              Regístrate para participar en sorteos increíbles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
                className='space-y-4'
              >
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={signUpForm.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Juan'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Pérez'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signUpForm.control}
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
                  control={signUpForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
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

                {watchPassword && (
                  <div className='space-y-1 text-sm'>
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-2 ${
                          req.met ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {req.met ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <X className='h-3 w-3' />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <FormField
                  control={signUpForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            {...field}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
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
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <p className='text-sm text-muted-foreground'>
              ¿Ya tienes cuenta?{' '}
              <Link
                to='/sign-in'
                className='text-primary font-medium hover:underline'
              >
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-muted/30'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Verificar correo</CardTitle>
          <CardDescription>
            Ingresa el código de 6 dígitos enviado a{' '}
            <span className='font-medium ml-1 text-foreground'>
              {maskEmail(email)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...confirmForm}>
            <form
              onSubmit={confirmForm.handleSubmit(handleConfirm)}
              className='space-y-6'
            >
              <FormField
                control={confirmForm.control}
                name='code'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-y-4 items-center w-full'>
                    <FormLabel>Código de verificación</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        autoFocus
                        value={field.value}
                        onChange={field.onChange}
                        className='w-full'
                        containerClassName='w-full justify-between'
                        disabled={isLoading}
                      >
                        <InputOTPGroup className='w-full'>
                          <InputOTPSlot
                            index={0}
                            className='flex-1 size-12'
                          />
                          <InputOTPSlot
                            index={1}
                            className='flex-1 size-12'
                          />
                          <InputOTPSlot
                            index={2}
                            className='flex-1 size-12'
                          />
                          <InputOTPSlot
                            index={3}
                            className='flex-1 size-12'
                          />
                          <InputOTPSlot
                            index={4}
                            className='flex-1 size-12'
                          />
                          <InputOTPSlot
                            index={5}
                            className='flex-1 size-12'
                          />
                        </InputOTPGroup>
                      </InputOTP>
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
                    Verificando...
                  </>
                ) : (
                  'Verificar cuenta'
                )}
              </Button>
            </form>
          </Form>

          <div className='mt-4 text-center'>
            <Button
              type='button'
              variant='link'
              disabled={isResending}
              onClick={handleResendCode}
            >
              {isResending ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  Reenviando...
                </>
              ) : (
                '¿No recibiste el código? Reenviar'
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => setStep('register')}
          >
            ← Volver al registro
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export { SignUpPage }
