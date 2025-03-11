import { Route, Switch } from 'wouter'
import { AuthProvider } from '@/hooks/use-auth'
import AuthPage from '@/pages/auth-page'
import AdminLoginPage from './pages/admin/login'
import AdminDashboard from './pages/admin/dashboard'
import DashboardPage from '@/pages/dashboard-page'
import { Toaster } from '@/components/ui/toaster'

export function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/">
          <AuthPage />
        </Route>
      </Switch>
      <Toaster />
    </AuthProvider>
  )
}
