import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocation } from 'wouter'
import { CheckCircle2 } from 'lucide-react'

interface RegistrationCompleteProps {
  password: string
}

export function RegistrationComplete({ password }: RegistrationCompleteProps) {
  const [, setLocation] = useLocation()

  return (
    <Card className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Registration Complete!
        </h2>
        <p className="text-muted-foreground">
          Thank you for registering with Present Sir. Your account has been
          created successfully.
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <p className="font-medium">Your login credentials:</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Email: The email you provided during registration
          </p>
          <p className="text-sm text-muted-foreground">
            Password:{' '}
            <span className="font-mono bg-background px-2 py-1 rounded">
              {password}
            </span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Please save these credentials securely. You'll need them to access
          your account.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Button onClick={() => setLocation('/auth')} className="w-full">
          Go to Login
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="w-full"
        >
          Print Credentials
        </Button>
      </div>
    </Card>
  )
}
