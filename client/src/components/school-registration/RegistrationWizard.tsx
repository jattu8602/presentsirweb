import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BasicInfo } from './steps/BasicInfo'
import { AddressContact } from './steps/AddressContact'
import { PrincipalInfo } from './steps/PrincipalInfo'
import { PaymentPlan } from './steps/PaymentPlan'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'wouter'

const registrationSchema = z.object({
  // Basic Info
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  registrationNumber: z
    .string()
    .min(3, 'Valid registration number is required'),
  educationBoard: z.enum(['CBSE', 'ICSE', 'STATE']),

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
      'schoolName',
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
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      planType: 'BASIC',
      planDuration: 1,
      educationBoard: 'CBSE',
    },
  })

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

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/schools/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registeredName: data.schoolName,
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
          principalEmail: data.principalEmail,
          planType: data.planType,
          planDuration: data.planDuration,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const result = await response.json()

      toast({
        title: 'Registration Successful',
        description: 'Please check your email for login credentials.',
      })

      // Redirect to payment if needed
      if (result.orderId) {
        // Handle Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: result.amount,
          currency: 'INR',
          name: 'Present Sir',
          description: `${data.planType} Plan - ${data.planDuration} Year(s)`,
          order_id: result.orderId,
          handler: async (response: any) => {
            await fetch('/api/schools/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            toast({
              title: 'Payment Successful',
              description: 'Your registration is complete.',
            })

            setLocation('/auth')
          },
          prefill: {
            name: data.schoolName,
            email: data.email,
            contact: data.phoneNumber,
          },
          theme: {
            color: '#0f172a',
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        setLocation('/auth')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Failed',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                index === currentStep ? 'text-primary' : 'text-muted-foreground'
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          ) : (
            <Button type="button" onClick={onNext}>
              Next
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
