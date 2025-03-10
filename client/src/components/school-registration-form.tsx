import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'

const registrationSchema = z.object({
  registeredName: z
    .string()
    .min(3, 'School name must be at least 3 characters'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  principalName: z.string().min(3, 'Principal name is required'),
  principalPhone: z
    .string()
    .min(10, 'Valid principal phone number is required'),
})

type RegistrationData = z.infer<typeof registrationSchema>

interface SchoolRegistrationFormProps {
  onSuccess: () => void
}

export function SchoolRegistrationForm({
  onSuccess,
}: SchoolRegistrationFormProps) {
  const { toast } = useToast()
  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      try {
        const res = await apiRequest('POST', '/api/schools/register', data)
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Registration failed')
        }
        return res.json()
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Registration failed'
        )
      }
    },
    onSuccess: () => {
      toast({
        title: 'Registration Successful',
        description:
          'Your school registration is pending admin approval. We will notify you via email once approved.',
      })
      onSuccess()
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="registeredName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="principalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Principal Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="principalPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Principal Phone</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register School'
          )}
        </Button>
      </form>
    </Form>
  )
}
