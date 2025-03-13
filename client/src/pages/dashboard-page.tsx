import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'

interface SchoolStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, logoutMutation } = useAuth()
  const [, setLocation] = useLocation()

  // Always call this useEffect hook first
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth')
    }
  }, [user, authLoading, setLocation])

  // Fetch school status to check if approved
  const { data: schoolData, isLoading: statusLoading } = useQuery<SchoolStatus>(
    {
      queryKey: ['/api/schools/status'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/schools/status')
        return res.json()
      },
      enabled: !!user && ['SCHOOL', 'COACHING', 'COLLEGE'].includes(user.role),
      // Don't refetch too often
      refetchInterval: 60000, // Check every minute
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  )

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      // Redirect is handled in the mutation, but as a fallback:
      setLocation('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Rendering logic starts here

  // If user is not authenticated yet, don't show anything during the redirect
  if (!user) {
    return null
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we load your dashboard
          </p>
        </div>
      </div>
    )
  }

  // Show pending approval state
  if (
    ['SCHOOL', 'COACHING', 'COLLEGE'].includes(user.role) &&
    !statusLoading &&
    schoolData?.status === 'PENDING'
  ) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Waiting for Admin Approval</CardTitle>
            <CardDescription>
              Your account is currently pending approval by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Once approved, you'll get full access to the dashboard and all
              features. You'll be notified via email when your account is
              approved. There's no need to keep checking this page - you can log
              in again later.
            </p>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">School Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add dashboard content here */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Welcome to your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are now logged in as {user.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
