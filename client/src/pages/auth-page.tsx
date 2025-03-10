import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Loader2 } from 'lucide-react'
import { SchoolRegistrationForm } from '@/components/school-registration-form'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AuthPage() {
  const [, setLocation] = useLocation()
  const { loginMutation } = useAuth()
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const user = await loginMutation.mutateAsync(data)
      if (user.role === 'ADMIN') {
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

  return (
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
      <div className="p-4 lg:p-8 h-full flex items-center">
        {isRegistering ? (
          <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
              <CardTitle>School Registration</CardTitle>
            <CardDescription>
                Register your school to get started. Your application will be
                reviewed by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <SchoolRegistrationForm
                onSuccess={() => setIsRegistering(false)}
              />
              <Button
                variant="link"
                className="mt-4"
                onClick={() => setIsRegistering(false)}
              >
                Already have an account? Sign in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to access your school dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
                    <Form {...loginForm}>
                      <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                                <Input type="password" {...field} />
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
                      </form>
                    </Form>
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full mt-4"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setIsRegistering(true)}>
                  New school? Register here
                        </Button>
              </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
