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
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminAuthPage() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      try {
        const res = await apiRequest('POST', '/api/admin/login', data)
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Login failed')
        }
        return res.json()
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Login failed')
      }
    },
    onSuccess: (data) => {
      if (data.user.role !== 'ADMIN') {
        toast({
          title: 'Access Denied',
          description: 'This login is for administrators only.',
          variant: 'destructive',
        })
        return
      }
      setLocation('/admin')
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
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
                control={form.control}
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
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setLocation('/auth')}>
              Back to School Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
