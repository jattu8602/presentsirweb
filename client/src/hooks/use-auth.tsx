import { createContext, ReactNode, useContext, useEffect } from 'react'
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'

type UserRole =
  | 'ADMIN'
  | 'SCHOOL'
  | 'COACHING'
  | 'COLLEGE'
  | 'TEACHER'
  | 'STUDENT'

interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  schoolId?: string
  username?: string
}

interface MutationContext {
  onNavigate?: (path: string) => void
}

type LoginResponse = {
  token: string
  user: User
}

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
  institutionName: string
  institutionType: string
  phone?: string
  address?: string
}

type RegisterResponse = {
  message: string
  user?: User
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData, unknown>
  logoutMutation: UseMutationResult<void, Error, void, unknown>
  registerMutation: UseMutationResult<
    RegisterResponse,
    Error,
    RegisterData,
    unknown
  >
  googleAuthUrl: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || ''
  const googleAuthUrl = `${apiUrl}/api/auth/google`

  // Check for token in localStorage
  const getStoredToken = () => localStorage.getItem('token')

  // Verify token and get user data
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = getStoredToken()
      if (!token) return null

      try {
        const response = await api.auth.verifyToken()
        return response.user
      } catch (error) {
        // Clear invalid token
        localStorage.removeItem('token')
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loginMutation = useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (data) => {
      return api.auth.login(data.email, data.password)
    },
    onSuccess: async (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token)

      // Refresh user data
      await refetchUser()
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      })
      throw error
    },
  })

  const registerMutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      return api.auth.register(data)
    },
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        description:
          data.message ||
          'Your registration is pending admin approval. You will be notified via email once approved.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    },
  })

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      localStorage.removeItem('token')
      await refetchUser()
    },
    onSuccess: () => {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        googleAuthUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
