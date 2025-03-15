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

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<RegisterResponse, Error, RegisterData>
  googleAuthUrl: string
}

interface LoginData {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

interface RegisterData {
  name: string
  email: string
  password: string
  institutionName: string
  institutionType: string
  phone?: string
  address?: string
}

interface RegisterResponse {
  message: string
  user?: User
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
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token)

      // Refresh user data
      refetchUser()

      // Show success toast
      toast({
        title: 'Login successful',
        description: `Welcome back${
          data.user.name ? ', ' + data.user.name : ''
        }!`,
      })

      // Check if school is approved before redirecting
      if (
        data.user.role === 'SCHOOL' ||
        data.user.role === 'COACHING' ||
        data.user.role === 'COLLEGE'
      ) {
        api.auth.checkSchoolStatus().then((response) => {
          if (response.status === 'PENDING') {
            toast({
              title: 'Registration Pending',
              description:
                'Your registration is pending admin approval. You will be notified via email once approved.',
              variant: 'default',
            })
            // Redirect to a pending approval page
            window.location.href = '/auth/pending'
          } else if (response.status === 'REJECTED') {
            toast({
              title: 'Registration Rejected',
              description:
                'Your registration has been rejected. Please contact support for more information.',
              variant: 'destructive',
            })
            // Log them out
            localStorage.removeItem('token')
            window.location.href = '/auth'
          } else {
            // Approved - redirect to dashboard
            window.location.href = '/dashboard'
          }
        })
      } else if (data.user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/dashboard'
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
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

      // Redirect to login page
      window.location.href = '/auth'
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // Clear token from localStorage
      localStorage.removeItem('token')
    },
    onSuccess: () => {
      // Clear user data
      refetchUser()

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })

      // Redirect to login page
      window.location.href = '/auth'
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
