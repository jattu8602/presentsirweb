import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!user) {
      setLocation('/auth')
    }
  }, [user, setLocation])

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">School Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add dashboard content here */}
      </div>
    </div>
  )
}
