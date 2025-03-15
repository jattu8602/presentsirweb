import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { RegistrationWizard } from '@/components/school-registration/RegistrationWizard'
import { Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AuthPage() {
  const [, setLocation] = useLocation()
  const { user, isLoading, loginMutation, googleAuthUrl } = useAuth()
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setLocation('/admin/dashboard')
      } else {
        setLocation('/dashboard')
      }
    }
  }, [user, setLocation])

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // If loading, show a loading state
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

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data)
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }

  const handleGoogleLogin = () => {
    // Show loading state
    toast({
      title: 'Redirecting to Google',
      description: "You'll be redirected to Google to complete authentication",
    })

    // Redirect to the Google auth URL
    window.location.href = googleAuthUrl
  }

  const handleRegistrationClick = () => {
    setIsRegistering(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {isRegistering ? (
        // Registration view: full screen, wider layout for a bigger appearance
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl p-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setIsRegistering(false)}
            >
              ← Back to Login
            </Button>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <RegistrationWizard />
            </div>
          </div>
        </div>
      ) : (
        // Login view: two-column layout with branding on the left
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div className="absolute inset-0 bg-zinc-900" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
              Present Sir
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  "Streamline your educational institution's management with our
                  comprehensive solution."
                </p>
                <p className="text-sm">
                  Register your school today and join our growing network of
                  educational institutions.
                </p>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8 h-full flex items-center overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl">
              <Card className="mx-auto w-full max-w-md">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogin}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          className="mr-2 h-4 w-4"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      onClick={handleRegistrationClick}
                      className="text-sm"
                    >
                      Don't have an account? Register your school
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
