import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function PendingApprovalPage() {
  const [, setLocation] = useLocation()
  const { user, isLoading, logoutMutation } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth')
    }
  }, [user, isLoading, setLocation])

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-center">Registration Pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                Your registration is under review
              </h3>
              <p>
                Our admin team is reviewing your registration. You will receive
                an email notification once your account is approved.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full"
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                'Sign Out'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
