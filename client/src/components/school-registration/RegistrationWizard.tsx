import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { BasicInfo } from './steps/BasicInfo'
import { AddressContact } from './steps/AddressContact'
import { PrincipalInfo } from './steps/PrincipalInfo'
import { PaymentPlan } from './steps/PaymentPlan'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'wouter'
import { useRouter } from 'wouter'

const registrationSchema = z.object({
  // Basic Info
  registeredName: z
    .string()
    .min(3, 'School name must be at least 3 characters'),
  registrationNumber: z
    .string()
    .min(3, 'Valid registration number is required'),
  educationBoard: z.enum(['CBSE', 'ICSE', 'STATE']),
  institutionType: z.enum(['SCHOOL', 'COACHING', 'COLLEGE']),

  // Address and Contact
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Valid 6-digit pincode is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid official email is required'),

  // Principal Info
  principalName: z.string().min(3, 'Principal name is required'),
  principalEmail: z.string().email('Valid email is required'),
  principalPhone: z.string().min(10, 'Valid phone number is required'),

  // Payment Plan
  planType: z.enum(['BASIC', 'PRO']),
  planDuration: z.number().min(1).max(12),
})

type RegistrationFormData = z.infer<typeof registrationSchema>
type FormField = keyof RegistrationFormData

const steps = [
  {
    id: 'basic-info',
    title: 'Basic School Information',
    component: BasicInfo,
    fields: [
      'registeredName',
      'registrationNumber',
      'educationBoard',
    ] as FormField[],
  },
  {
    id: 'address-contact',
    title: 'Address and Contact Details',
    component: AddressContact,
    fields: [
      'streetAddress',
      'city',
      'district',
      'state',
      'pincode',
      'phoneNumber',
      'email',
    ] as FormField[],
  },
  {
    id: 'principal-info',
    title: "Principal's Information",
    component: PrincipalInfo,
    fields: [
      'principalName',
      'principalEmail',
      'principalPhone',
    ] as FormField[],
  },
  {
    id: 'payment-plan',
    title: 'Payment Plan',
    component: PaymentPlan,
    fields: ['planType', 'planDuration'] as FormField[],
  },
]

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('registrationStep')
    return saved ? parseInt(saved) : 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      ...(() => {
        const saved = localStorage.getItem('registrationData')
        return saved ? JSON.parse(saved) : {}
      })(),
      planType: 'BASIC',
      planDuration: 1,
      educationBoard: 'CBSE',
      institutionType: 'SCHOOL',
    },
  })

  // Save form data when it changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem('registrationData', JSON.stringify(data))
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Save current step
  useEffect(() => {
    localStorage.setItem('registrationStep', currentStep.toString())
  }, [currentStep])

  const CurrentStepComponent = steps[currentStep].component

  const onNext = async () => {
    const isValid = await form.trigger(steps[currentStep].fields)
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const onBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const clearRegistrationData = () => {
    localStorage.removeItem('registrationData')
    localStorage.removeItem('registrationStep')
  }

  const handleSubmit = async (data: z.infer<typeof registrationSchema>) => {
    try {
      setIsSubmitting(true)

      // First validate the registration data
      const validationResponse = await fetch('/api/schools/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredName: data.registeredName,
          registrationNumber: data.registrationNumber,
          educationBoard: data.educationBoard,
          streetAddress: data.streetAddress,
          city: data.city,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
          phoneNumber: data.phoneNumber,
          email: data.email,
          principalName: data.principalName,
          principalPhone: data.principalPhone,
          institutionType: data.institutionType,
          planType: data.planType,
          planDuration: data.planDuration,
        }),
      })

      const validationData = await validationResponse.json()

      if (!validationResponse.ok) {
        toast({
          title: 'Registration Error',
          description: validationData.message || 'Validation failed',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Create payment order
      const orderResponse = await fetch('/api/schools/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredName: data.registeredName,
          registrationNumber: data.registrationNumber,
          educationBoard: data.educationBoard,
          streetAddress: data.streetAddress,
          city: data.city,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
          phoneNumber: data.phoneNumber,
          email: data.email,
          principalName: data.principalName,
          principalPhone: data.principalPhone,
          institutionType: data.institutionType,
          planType: data.planType,
          planDuration: data.planDuration,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        toast({
          title: 'Payment Error',
          description: orderData.message || 'Failed to create payment order',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Save registration data to localStorage before payment
      localStorage.setItem('registrationData', JSON.stringify(data))

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Present Sir',
        description: `${data.institutionType} Registration - ${data.planType} Plan`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Complete registration after payment
            const registrationResponse = await fetch(
              '/api/schools/complete-registration',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  registeredName: data.registeredName,
                  registrationNumber: data.registrationNumber,
                  educationBoard: data.educationBoard,
                  streetAddress: data.streetAddress,
                  city: data.city,
                  district: data.district,
                  state: data.state,
                  pincode: data.pincode,
                  phoneNumber: data.phoneNumber,
                  email: data.email,
                  principalName: data.principalName,
                  principalPhone: data.principalPhone,
                  institutionType: data.institutionType,
                  planType: data.planType,
                  planDuration: data.planDuration,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            )

            const registrationData = await registrationResponse.json()

            if (!registrationResponse.ok) {
              throw new Error(
                registrationData.message || 'Registration failed after payment'
              )
            }

            // Save password for display if provided
            if (registrationData.password) {
              setPassword(registrationData.password)
            }

            // Clear localStorage
            localStorage.removeItem('registrationData')
            localStorage.removeItem('registrationStep')

            // Set success state
            setIsSuccess(true)

            toast({
              title: 'Registration Successful',
              description:
                'Your registration is complete. Please check your email for login credentials.',
            })

            // Redirect to login page after a short delay
            setTimeout(() => {
              window.location.href = '/auth'
            }, 3000)
          } catch (error) {
            console.error('Registration error:', error)
            toast({
              title: 'Registration Failed',
              description:
                error instanceof Error
                  ? error.message
                  : 'An error occurred during registration',
              variant: 'destructive',
            })
          } finally {
            setIsSubmitting(false)
          }
        },
        prefill: {
          name: data.registeredName,
          email: data.email,
          contact: data.phoneNumber,
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
          },
        },
      }

      // @ts-ignore - Razorpay is loaded via script
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred during registration',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Thank You for Registering!</h2>
        {password ? (
          <div className="mb-6 p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold mb-2">
              Your Account Credentials
            </h3>
            <p className="mb-2">
              Email:{' '}
              <span className="font-medium">{form.getValues().email}</span>
            </p>
            <div className="flex items-center justify-center gap-2 mb-1">
              <p>
                Password: <span className="font-medium">{password}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(password)
                  toast({
                    title: 'Password Copied',
                    description: 'Password has been copied to clipboard',
                  })
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Please save this password in a secure location. You'll need it to
              login.
            </p>
          </div>
        ) : null}
        <p className="text-muted-foreground mb-6">
          Your school registration is pending admin approval. Once approved, you
          will be able to access all dashboard features. You can login now with
          your credentials or using Google authentication.
        </p>
        <Button onClick={() => setLocation('/auth')}>Go to Login</Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <Form {...form}>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  index === currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CurrentStepComponent form={form} />
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button type="button" onClick={onNext}>
                Next
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Card>
  )
}
