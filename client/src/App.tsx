import { Switch, Route } from 'wouter'
import { queryClient } from './lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from './lib/protected-route'
import NotFound from '@/pages/not-found'
import HomePage from '@/pages/home-page'
import AuthPage from '@/pages/auth-page'
import AdminAuthPage from '@/pages/admin-auth-page'
import AdminPage from '@/pages/admin-page'
import LandingPage from '@/pages/landing-page'

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/admin" component={AdminAuthPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} role="SCHOOL" />
      <ProtectedRoute path="/admin" component={AdminPage} role="ADMIN" />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
