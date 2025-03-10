import { createContext, ReactNode, useContext } from 'react'
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'
import {
  insertUserSchema,
  User as SelectUser,
  InsertUser,
} from '@shared/schema'
import { getQueryFn, apiRequest, queryClient } from '../lib/queryClient'
import { useToast } from '@/hooks/use-toast'

type UserRole = 'ADMIN' | 'SCHOOL' | 'TEACHER' | 'STUDENT'

interface User extends SelectUser {
  role: UserRole
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, InsertUser>
}

type LoginData = {
  username: string
  password: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/login', credentials)
      const userData = await res.json()
      return userData
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data.user)
      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin'
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

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest('POST', '/api/register', credentials)
      return res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
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
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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
