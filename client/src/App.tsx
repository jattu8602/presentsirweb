import { Route, Switch } from 'wouter'
import LandingPage from '@/pages/landing-page'
import AuthPage from '@/pages/auth-page'
import AdminAuthPage from '@/pages/admin-auth-page'
import AdminDashboard from '@/pages/admin/dashboard'
import DashboardPage from '@/pages/dashboard-page'
import HomePage from '@/pages/home-page'
import NotFound from '@/pages/not-found'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />

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
