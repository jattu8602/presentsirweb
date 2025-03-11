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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AuthPage() {
  console.log('AuthPage rendering')
  const [, setLocation] = useLocation()
  const { loginMutation } = useAuth()
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    console.log('Registration state changed:', isRegistering)
  }, [isRegistering])

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data)
      if (response.user.role === 'ADMIN') {
        setLocation('/admin')
      } else {
        setLocation('/dashboard')
      }
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
    window.location.href = '/api/auth/google'
  }

  const handleRegistrationClick = () => {
    console.log('Registration button clicked')
    setIsRegistering(true)
    console.log('isRegistering set to:', true)
  }

  console.log('Current isRegistering state:', isRegistering)

  return (
    <div className="min-h-screen bg-background">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
            EduTrackPro
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
            {isRegistering ? (
              <div className="w-full p-4">
                <Button
                  variant="ghost"
                  className="mb-4"
                  onClick={() => {
                    console.log('Back to login clicked')
                    setIsRegistering(false)
                  }}
                >
                  ← Back to Login
                </Button>
                <div className="bg-card rounded-lg shadow-sm p-6">
                  {console.log('Rendering RegistrationWizard')}
                  <RegistrationWizard />
                </div>
              </div>
            ) : (
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
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogin}
                      >
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
