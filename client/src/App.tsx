import { Route, Switch, Router, useLocation } from 'wouter'
import LandingPage from '@/pages/landing-page'
import AuthPage from '@/pages/auth-page'
import AdminAuthPage from '@/pages/admin-auth-page'
import AdminDashboard from '@/pages/admin/dashboard'
import DashboardPage from '@/pages/dashboard-page'
import HomePage from '@/pages/home-page'
import NotFound from '@/pages/not-found'
import AuthRedirect from '@/pages/auth-redirect'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'

// Component to handle root path redirection based on auth status
function RootRedirect() {
  const { user, isLoading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (isLoading) return

    if (user) {
      // If user is logged in, redirect based on role
      if (user.role === 'ADMIN') {
        setLocation('/admin/dashboard')
      } else {
        setLocation('/dashboard')
      }
    } else {
      // If not logged in, show landing page
      setLocation('/landing')
    }
  }, [user, isLoading, setLocation])

  // Show loading while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Switch>
        {/* Root route with auth-based redirection */}
        <Route path="/" component={RootRedirect} />
        <Route path="/landing" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/auth/redirect" component={AuthRedirect} />

        {/* Admin routes */}
        <Route path="/admin/login" component={AdminAuthPage} />
        <Route path="/admin/dashboard" component={AdminDashboard} />

        {/* Protected routes */}
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/home" component={HomePage} />

        {/* 404 route */}
        <Route component={NotFound} />
      </Switch>

      <Toaster />
    </>
  )
}
