import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentPlanProps {
  form: UseFormReturn<any>
}

const plans = [
  {
    type: 'BASIC',
    name: 'Basic Plan',
    price: 9999,
    features: [
      'Basic attendance management',
      'Student profiles',
      'Basic reporting',
      'Email notifications',
    ],
  },
  {
    type: 'PRO',
    name: 'Pro Plan',
    price: 19999,
    features: [
      'Advanced attendance tracking',
      'Comprehensive analytics',
      'Parent portal access',
      'SMS notifications',
      'Custom reports',
      'API access',
    ],
  },
]

export function PaymentPlan({ form }: PaymentPlanProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="planType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Select Plan</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4"
              >
                {plans.map((plan) => (
                  <FormItem key={plan.type}>
                    <FormControl>
                      <RadioGroupItem
                        value={plan.type}
                        className="peer sr-only"
                        id={plan.type}
                      />
                    </FormControl>
                    <label
                      htmlFor={plan.type}
                      className="flex flex-col h-full p-4 border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50"
                    >
                      <CardHeader className="p-0">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">
                          ₹{plan.price.toLocaleString('en-IN')}/year
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 mt-4">
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </label>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="planDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Duration (Years)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              defaultValue={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? 'Year' : 'Years'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">
          Total Amount:{' '}
          <span className="font-bold text-foreground">
            ₹
            {(
              (plans.find((p) => p.type === form.watch('planType'))?.price ||
                plans[0].price) * form.watch('planDuration')
            ).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          *GST and other applicable taxes will be added at checkout
        </div>
      </div>
    </div>
  )
}
