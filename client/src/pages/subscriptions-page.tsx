import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, CreditCard, Crown, Plus, Star, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Subscription plan types
interface Plan {
  id: string
  name: string
  features: string[]
  price: number
  duration: string
  maxStudents: number
  maxTeachers: number
  maxClasses: number
  isPopular?: boolean
}

// Payment details interface
interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  details: string
  isDefault: boolean
}

// Subscription status types
type SubscriptionStatus = 'active' | 'expired' | 'trialing' | 'canceled'

interface Subscription {
  id: string
  planId: string
  planName: string
  status: SubscriptionStatus
  startDate: string
  endDate: string
  nextBillingDate: string
  price: number
  usedStorage: number
  totalStorage: number
  paymentMethod: string
  invoices: Invoice[]
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  date: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  description: string
  amount: number
}

// Sample data
const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    features: [
      'Up to 200 students',
      'Up to 15 teachers',
      'Up to 10 classes',
      'Basic attendance tracking',
      'Fee management',
      'Email support',
    ],
    price: 999,
    duration: 'month',
    maxStudents: 200,
    maxTeachers: 15,
    maxClasses: 10,
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    features: [
      'Up to 500 students',
      'Up to 30 teachers',
      'Up to 20 classes',
      'Advanced attendance with reports',
      'Fee & expense management',
      'Timetable management',
      'Email & phone support',
      'Data export',
    ],
    price: 1999,
    duration: 'month',
    maxStudents: 500,
    maxTeachers: 30,
    maxClasses: 20,
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    features: [
      'Unlimited students',
      'Unlimited teachers',
      'Unlimited classes',
      'Advanced reporting & analytics',
      'Complete school management',
      'SMS notifications',
      'Priority support',
      'API access',
    ],
    price: 4999,
    duration: 'month',
    maxStudents: -1, // -1 indicates unlimited
    maxTeachers: -1,
    maxClasses: -1,
  },
]

// Sample payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card1',
    type: 'card',
    details: 'XXXX XXXX XXXX 4242',
    isDefault: true,
  },
  {
    id: 'upi1',
    type: 'upi',
    details: 'username@upi',
    isDefault: false,
  },
]

// Sample subscription data
const SAMPLE_SUBSCRIPTION: Subscription = {
  id: 'sub_123456',
  planId: 'standard',
  planName: 'Standard Plan',
  status: 'active',
  startDate: '2023-01-15',
  endDate: '2024-01-14',
  nextBillingDate: '2023-12-15',
  price: 1999,
  usedStorage: 523, // MB
  totalStorage: 5000, // MB
  paymentMethod: 'XXXX XXXX XXXX 4242',
  invoices: [
    {
      id: 'inv_123',
      number: 'INV-2023-001',
      amount: 1999,
      status: 'paid',
      date: '2023-01-15',
      items: [
        {
          description: 'Standard Plan - Monthly Subscription',
          amount: 1999,
        },
      ],
    },
    {
      id: 'inv_124',
      number: 'INV-2023-002',
      amount: 1999,
      status: 'paid',
      date: '2023-02-15',
      items: [
        {
          description: 'Standard Plan - Monthly Subscription',
          amount: 1999,
        },
      ],
    },
    {
      id: 'inv_125',
      number: 'INV-2023-003',
      amount: 1999,
      status: 'paid',
      date: '2023-03-15',
      items: [
        {
          description: 'Standard Plan - Monthly Subscription',
          amount: 1999,
        },
      ],
    },
  ],
}

export default function SubscriptionsPage() {
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription>(SAMPLE_SUBSCRIPTION)
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(PAYMENT_METHODS)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openBillingDialog, setOpenBillingDialog] = useState(false)
  const { toast } = useToast()

  // Find the current plan details
  const currentPlan =
    PLANS.find((plan) => plan.id === currentSubscription.planId) || PLANS[0]

  // Current usage statistics
  const usedStoragePercent = Math.round(
    (currentSubscription.usedStorage / currentSubscription.totalStorage) * 100
  )
  const studentsUsage = 150 // Example value
  const studentsPercent =
    currentPlan.maxStudents === -1
      ? 0
      : Math.round((studentsUsage / currentPlan.maxStudents) * 100)
  const teachersUsage = 10 // Example value
  const teachersPercent =
    currentPlan.maxTeachers === -1
      ? 0
      : Math.round((teachersUsage / currentPlan.maxTeachers) * 100)

  // Add a new payment method
  const addPaymentMethod = () => {
    // In a real app, this would add a new payment method
    setOpenPaymentDialog(false)
    toast({
      title: 'Payment Method Added',
      description: 'Your new payment method has been successfully added.',
    })
  }

  // Change billing plan
  const changePlan = (planId: string) => {
    // In a real app, this would change the subscription plan
    const newPlan = PLANS.find((plan) => plan.id === planId)
    if (!newPlan) return

    setCurrentSubscription({
      ...currentSubscription,
      planId: newPlan.id,
      planName: newPlan.name,
      price: newPlan.price,
    })

    setOpenBillingDialog(false)
    toast({
      title: 'Plan Changed',
      description: `Your subscription has been updated to ${newPlan.name}.`,
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
            <p className="text-muted-foreground">
              Manage your subscription plan and payment methods
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Current Plan */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan: {currentSubscription.planName}</span>
                <Badge
                  variant={
                    currentSubscription.status === 'active'
                      ? 'default'
                      : currentSubscription.status === 'trialing'
                      ? 'outline'
                      : 'destructive'
                  }
                >
                  {currentSubscription.status.charAt(0).toUpperCase() +
                    currentSubscription.status.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your subscription renews on{' '}
                {new Date(
                  currentSubscription.nextBillingDate
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(currentSubscription.price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {' '}
                        /month
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p>{currentSubscription.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Billing Period
                    </p>
                    <p>
                      {new Date(
                        currentSubscription.startDate
                      ).toLocaleDateString()}{' '}
                      to{' '}
                      {new Date(
                        currentSubscription.endDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex-1 max-w-[400px]">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span>
                        {currentSubscription.usedStorage} MB /{' '}
                        {currentSubscription.totalStorage} MB
                      </span>
                    </div>
                    <Progress value={usedStoragePercent} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Students</span>
                      <span>
                        {studentsUsage} /{' '}
                        {currentPlan.maxStudents === -1
                          ? 'Unlimited'
                          : currentPlan.maxStudents}
                      </span>
                    </div>
                    <Progress value={studentsPercent} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Teachers</span>
                      <span>
                        {teachersUsage} /{' '}
                        {currentPlan.maxTeachers === -1
                          ? 'Unlimited'
                          : currentPlan.maxTeachers}
                      </span>
                    </div>
                    <Progress value={teachersPercent} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Dialog
                open={openBillingDialog}
                onOpenChange={setOpenBillingDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Change Plan</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Choose a Plan</DialogTitle>
                    <DialogDescription>
                      Select the plan that best fits your school's needs
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {PLANS.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative ${
                          plan.isPopular ? 'border-primary' : ''
                        }`}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-3 right-4">
                            <Badge variant="default" className="px-3 py-1">
                              <Star className="mr-1 h-3 w-3" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>
                            {formatCurrency(plan.price)}
                            <span className="text-xs">/{plan.duration}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => changePlan(plan.id)}
                            className="w-full"
                            variant={
                              currentSubscription.planId === plan.id
                                ? 'outline'
                                : 'default'
                            }
                          >
                            {currentSubscription.planId === plan.id
                              ? 'Current Plan'
                              : 'Select Plan'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setOpenBillingDialog(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button>Manage Subscription</Button>
            </CardFooter>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {method.type === 'card' ? (
                          <CreditCard className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            U
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{method.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.type === 'card'
                            ? 'Credit/Debit Card'
                            : 'UPI ID'}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Dialog
                open={openPaymentDialog}
                onOpenChange={setOpenPaymentDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new payment method to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="name" className="text-sm font-medium">
                            Cardholder Name
                          </label>
                          <input
                            id="name"
                            className="w-full p-2 border rounded-md"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="card" className="text-sm font-medium">
                            Card Number
                          </label>
                          <input
                            id="card"
                            className="w-full p-2 border rounded-md"
                            placeholder="XXXX XXXX XXXX XXXX"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label
                            htmlFor="month"
                            className="text-sm font-medium"
                          >
                            Month
                          </label>
                          <input
                            id="month"
                            className="w-full p-2 border rounded-md"
                            placeholder="MM"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="year" className="text-sm font-medium">
                            Year
                          </label>
                          <input
                            id="year"
                            className="w-full p-2 border rounded-md"
                            placeholder="YY"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="cvc" className="text-sm font-medium">
                            CVC
                          </label>
                          <input
                            id="cvc"
                            className="w-full p-2 border rounded-md"
                            placeholder="CVC"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setOpenPaymentDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addPaymentMethod}>Add Method</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your recent invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Invoice
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Date
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Amount
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubscription.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-t">
                        <td className="px-4 py-3">{invoice.number}</td>
                        <td className="px-4 py-3">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              invoice.status === 'paid'
                                ? 'default'
                                : invoice.status === 'pending'
                                ? 'outline'
                                : 'destructive'
                            }
                          >
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-3">
              <Button variant="outline" className="w-full">
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
