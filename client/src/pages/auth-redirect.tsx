import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function AuthRedirect() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const state = params.get('state')
        const error = params.get('error')

        // Check for errors from Google
        if (error) {
          throw new Error(
            error === 'access_denied'
              ? 'You cancelled the Google sign in'
              : 'Google authentication failed'
          )
        }

        // Verify state parameter to prevent CSRF
        const storedState = localStorage.getItem('googleAuthState')
        if (!state || state !== storedState) {
          throw new Error('Invalid authentication state')
        }

        // Clear stored state
        localStorage.removeItem('googleAuthState')

        if (!code) {
          throw new Error('No authentication code received')
        }

        // Exchange code for token
        const authResult = await authApi.googleCallback(code)

        // Store the token
        if (authResult.token) {
          localStorage.setItem('token', authResult.token)

          // Update auth state
          await queryClient.invalidateQueries({ queryKey: ['currentUser'] })

          toast({
            title: 'Successfully signed in',
            description: `Welcome${
              authResult.user?.name ? ' ' + authResult.user.name : ''
            }!`,
          })
        }

        setCheckingAuth(false)
      } catch (error) {
        console.error('Auth callback error:', error)
        toast({
          title: 'Authentication Failed',
          description:
            error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive',
        })
        setLocation('/auth')
      }
    }

    handleAuthCallback()
  }, [setLocation, toast])

  useEffect(() => {
    // Wait until we've checked auth and React Query has loaded
    if (checkingAuth || isLoading) return

    // If no user, go back to auth page
    if (!user) {
      setLocation('/auth')
      return
    }

    // If authenticated, redirect based on role
    if (user.role === 'ADMIN') {
      setLocation('/admin/dashboard')
    } else {
      setLocation('/dashboard')
    }
  }, [user, isLoading, checkingAuth, setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Completing authentication...
        </h2>
        <p className="text-muted-foreground">
          You'll be redirected momentarily
        </p>
      </div>
    </div>
  )
}
