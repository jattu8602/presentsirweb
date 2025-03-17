import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function PendingAuthPage() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    // If we have a user, redirect to the appropriate dashboard
    if (user) {
      if (user.role === 'ADMIN') {
        setLocation('/admin/dashboard')
      } else {
        setLocation('/dashboard')
      }
    } else {
      // If no user is found, redirect back to auth page
      setLocation('/auth')
    }
  }, [user, setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Completing Authentication
        </h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you...
        </p>
      </div>
    </div>
  )
}
