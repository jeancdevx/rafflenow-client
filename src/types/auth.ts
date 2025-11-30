export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  groups: string[]
  isAdmin: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface SignUpInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface ConfirmSignUpInput {
  email: string
  code: string
}
