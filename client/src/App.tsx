import { Route, Switch } from 'wouter'
import { AuthProvider } from '@/hooks/use-auth'
import AuthPage from '@/pages/auth-page'
import DashboardPage from '@/pages/dashboard-page'
import AdminPage from '@/pages/admin-page'
import LandingPage from '@/pages/landing-page'
import { Toaster } from '@/components/ui/toaster'

export function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/admin" component={AdminPage} />
      </Switch>
      <Toaster />
    </AuthProvider>
  )
}
