import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { queryClient } from '@/lib/queryClient'

export default function AuthRedirect() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [checkingServer, setCheckingServer] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if we're already authenticated via cookie
        const response = await fetch('/api/user', {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          // Update our auth state
          queryClient.setQueryData(['/api/user'], userData)
          setCheckingServer(false)
        } else {
          setCheckingServer(false)
        }
      } catch (error) {
        console.error('Auth redirect error:', error)
        setCheckingServer(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Wait until we've checked with the server and React Query has loaded
    if (checkingServer || isLoading) return

    // If no user, something went wrong with authentication
    if (!user) {
      toast({
        title: 'Authentication Failed',
        description:
          'There was a problem with your authentication. Please try again.',
        variant: 'destructive',
      })
      setLocation('/auth')
      return
    }

    // If authenticated, redirect based on role
    if (user.role === 'ADMIN') {
      setLocation('/admin')
    } else if (
      user.role === 'SCHOOL' ||
      user.role === 'COACHING' ||
      user.role === 'COLLEGE'
    ) {
      setLocation('/dashboard')
    } else {
      setLocation('/auth')
    }
  }, [user, isLoading, checkingServer, setLocation, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          Authentication in progress...
        </h2>
        <p className="text-muted-foreground">
          You'll be redirected momentarily
        </p>
      </div>
    </div>
  )
}
