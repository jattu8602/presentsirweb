import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { BasicInformation } from './steps/BasicInformation.tsx'
import { ContactDetails } from './steps/ContactDetails.tsx'
import { PrincipalInformation } from './steps/PrincipalInformation.tsx'
import { PaymentPlan } from './steps/PaymentPlan.tsx'

const registrationSchema = z.object({
  // Basic Information
  registeredName: z
    .string()
    .min(3, 'School name must be at least 3 characters'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  boardType: z.enum(['CBSE', 'ICSE', 'STATE']),

  // Address and Contact
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),

  // Principal Information
  principalName: z.string().min(3, 'Principal name is required'),
  principalEmail: z.string().email('Invalid principal email'),
  principalPhone: z
    .string()
    .min(10, 'Principal phone must be at least 10 digits'),

  // Plan Selection
  planType: z.enum(['BASIC', 'PRO']),
  planDuration: z.number().min(1).max(12),
})

type RegistrationData = z.infer<typeof registrationSchema>

const steps = [
  'Basic Information',
  'Contact Details',
  'Principal Information',
  'Payment Plan',
]

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      registeredName: '',
      registrationNumber: '',
      boardType: 'CBSE',
      streetAddress: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      phoneNumber: '',
      email: '',
      principalName: '',
      principalEmail: '',
      principalPhone: '',
      planType: 'BASIC',
      planDuration: 1,
    },
  })

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fields)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const getFieldsForStep = (step: number): Array<keyof RegistrationData> => {
    switch (step) {
      case 0:
        return ['registeredName', 'registrationNumber', 'boardType']
      case 1:
        return [
          'streetAddress',
          'city',
          'district',
          'state',
          'pincode',
          'phoneNumber',
          'email',
        ]
      case 2:
        return ['principalName', 'principalEmail', 'principalPhone']
      case 3:
        return ['planType', 'planDuration']
      default:
        return []
    }
  }

  const onSubmit = async (data: RegistrationData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/schools/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const result = await response.json()

      // Redirect to payment page with order ID
      if (result.orderId) {
        window.location.href = `/payment?orderId=${result.orderId}`
      }

      toast({
        title: 'Registration Successful',
        description:
          'Please complete the payment process to finalize your registration.',
      })
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInformation form={form} />
      case 1:
        return <ContactDetails form={form} />
      case 2:
        return <PrincipalInformation form={form} />
      case 3:
        return <PaymentPlan form={form} />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{steps[currentStep]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 text-center ${
                  index === currentStep
                    ? 'text-primary font-bold'
                    : index < currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-secondary rounded-full">
            <div
              className="absolute h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStep()}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
