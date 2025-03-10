import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import { Redirect, Route } from 'wouter'

interface ProtectedRouteProps {
  path: string
  component: () => React.JSX.Element
  role?: 'ADMIN' | 'SCHOOL' | 'TEACHER' | 'STUDENT'
}

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    )
  }

  if (!user || (role && user.role !== role)) {
    const redirectPath = role === 'ADMIN' ? '/auth/admin' : '/auth'
    return <Redirect to={redirectPath} />
  }

  return <Route path={path} component={Component} />
}
