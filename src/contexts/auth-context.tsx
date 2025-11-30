import type {
  AuthState,
  ConfirmSignUpInput,
  SignInInput,
  SignUpInput,
  User
} from '@/types/auth'
import {
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendCode,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser
} from 'aws-amplify/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

import '@/config/amplify'

interface AuthContextType extends AuthState {
  signUp: (input: SignUpInput) => Promise<{ userId: string; nextStep: string }>
  confirmSignUp: (input: ConfirmSignUpInput) => Promise<void>
  resendConfirmationCode: (email: string) => Promise<void>
  signIn: (input: SignInInput) => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  const parseUserFromSession = useCallback(async (): Promise<User | null> => {
    try {
      const session = await fetchAuthSession()

      if (!session.tokens?.idToken) {
        return null
      }

      const attributes = await fetchUserAttributes()
      const payload = session.tokens.idToken.payload

      const groups = (payload['cognito:groups'] as string[]) || []

      return {
        userId: payload.sub as string,
        email: attributes.email || '',
        firstName: attributes.given_name || '',
        lastName: attributes.family_name || '',
        groups,
        isAdmin: groups.includes('Admin')
      }
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        await getCurrentUser()
        const user = await parseUserFromSession()

        if (isMounted) {
          setState({
            user,
            isAuthenticated: !!user,
            isLoading: false
          })
        }
      } catch {
        if (isMounted) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [parseUserFromSession])

  const signUp = useCallback(
    async (
      input: SignUpInput
    ): Promise<{ userId: string; nextStep: string }> => {
      const { userId, nextStep } = await amplifySignUp({
        username: input.email,
        password: input.password,
        options: {
          userAttributes: {
            email: input.email,
            given_name: input.firstName,
            family_name: input.lastName
          }
        }
      })

      return {
        userId: userId || '',
        nextStep: nextStep.signUpStep
      }
    },
    []
  )

  const confirmSignUp = useCallback(
    async (input: ConfirmSignUpInput): Promise<void> => {
      await amplifyConfirmSignUp({
        username: input.email,
        confirmationCode: input.code
      })
    },
    []
  )

  const resendConfirmationCode = useCallback(
    async (email: string): Promise<void> => {
      await amplifyResendCode({
        username: email
      })
    },
    []
  )

  const signIn = useCallback(
    async (input: SignInInput): Promise<void> => {
      const { isSignedIn, nextStep } = await amplifySignIn({
        username: input.email,
        password: input.password
      })

      if (!isSignedIn) {
        throw new Error(`Additional step required: ${nextStep.signInStep}`)
      }

      const user = await parseUserFromSession()

      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false
      })
    },
    [parseUserFromSession]
  )

  const signOut = useCallback(async () => {
    await amplifySignOut()

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
  }, [])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() || null
    } catch {
      return null
    }
  }, [])

  const refreshSession = useCallback(async () => {
    const user = await parseUserFromSession()

    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }))
  }, [parseUserFromSession])

  const value = useMemo(
    () => ({
      ...state,
      signUp,
      confirmSignUp,
      resendConfirmationCode,
      signIn,
      signOut,
      getAccessToken,
      refreshSession
    }),
    [
      state,
      signUp,
      confirmSignUp,
      resendConfirmationCode,
      signIn,
      signOut,
      getAccessToken,
      refreshSession
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
