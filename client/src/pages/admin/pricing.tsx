import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Package,
  Star,
  Check,
  X,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Database,
  Clock,
  Users,
  Mail,
  CheckCircle,
  Settings,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Define types for our pricing plans
interface PricingFeature {
  id: string
  name: string
  included: boolean
  description?: string
}

interface PricingPlan {
  id: string
  name: string
  description: string
  monthly_price: number
  annual_price: number
  currency: string
  features: PricingFeature[]
  isPopular: boolean
  maxStudents: number
  maxTeachers: number
  isActive: boolean
}

// Mock data for initial plans
const initialPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Essential features for small institutions',
    monthly_price: 999,
    annual_price: 9999,
    currency: 'INR',
    isPopular: false,
    maxStudents: 200,
    maxTeachers: 20,
    isActive: true,
    features: [
      { id: '1-1', name: 'Attendance Management', included: true },
      { id: '1-2', name: 'Basic Reporting', included: true },
      { id: '1-3', name: 'Email Support', included: true },
      { id: '1-4', name: 'Student Portal', included: true },
      { id: '1-5', name: 'Advanced Analytics', included: false },
      { id: '1-6', name: 'Custom Branding', included: false },
      { id: '1-7', name: 'API Access', included: false },
      { id: '1-8', name: 'Priority Support', included: false },
    ],
  },
  {
    id: '2',
    name: 'Pro',
    description: 'Advanced features for growing institutions',
    monthly_price: 1999,
    annual_price: 19999,
    currency: 'INR',
    isPopular: true,
    maxStudents: 500,
    maxTeachers: 50,
    isActive: true,
    features: [
      { id: '2-1', name: 'Attendance Management', included: true },
      { id: '2-2', name: 'Basic Reporting', included: true },
      { id: '2-3', name: 'Email Support', included: true },
      { id: '2-4', name: 'Student Portal', included: true },
      { id: '2-5', name: 'Advanced Analytics', included: true },
      { id: '2-6', name: 'Custom Branding', included: true },
      { id: '2-7', name: 'API Access', included: false },
      { id: '2-8', name: 'Priority Support', included: true },
    ],
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'Full capabilities for large institutions',
    monthly_price: 4999,
    annual_price: 49999,
    currency: 'INR',
    isPopular: false,
    maxStudents: 2000,
    maxTeachers: 200,
    isActive: true,
    features: [
      { id: '3-1', name: 'Attendance Management', included: true },
      { id: '3-2', name: 'Basic Reporting', included: true },
      { id: '3-3', name: 'Email Support', included: true },
      { id: '3-4', name: 'Student Portal', included: true },
      { id: '3-5', name: 'Advanced Analytics', included: true },
      { id: '3-6', name: 'Custom Branding', included: true },
      { id: '3-7', name: 'API Access', included: true },
      { id: '3-8', name: 'Priority Support', included: true },
    ],
  },
]

// List of all possible features for new plans
const allFeatures = [
  'Attendance Management',
  'Basic Reporting',
  'Email Support',
  'Student Portal',
  'Advanced Analytics',
  'Custom Branding',
  'API Access',
  'Priority Support',
  'SMS Notifications',
  'Parent Portal',
  'Exam Management',
  'Fee Management',
  'Online Payment',
  'Library Management',
  'Transport Management',
  'Hostel Management',
  'Calendar & Events',
  'Video Conferencing',
  'Homework Management',
  'Custom Domain',
]

export default function PricingManagementPage() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(initialPlans)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('plans')
  const [newFeature, setNewFeature] = useState('')

  // Check for admin token
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.log('No admin token found, redirecting to login')
      setLocation('/admin/login')
      return
    }

    // In a real implementation, you would fetch pricing plans from the API
    // fetchPricingPlans()
  }, [setLocation])

  const fetchPricingPlans = async () => {
    // This would be an API call in a real implementation
    setIsLoading(true)
    try {
      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPricingPlans(initialPlans)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pricing plans',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlan = () => {
    // Create a new plan with default values
    const newPlan: PricingPlan = {
      id: `new-${Date.now()}`,
      name: 'New Plan',
      description: 'Description for new plan',
      monthly_price: 999,
      annual_price: 9999,
      currency: 'INR',
      isPopular: false,
      maxStudents: 100,
      maxTeachers: 10,
      isActive: false,
      features: allFeatures.slice(0, 5).map((name, index) => ({
        id: `new-${Date.now()}-${index}`,
        name,
        included: true,
      })),
    }

    // Open edit dialog with new plan
    setSelectedPlan(newPlan)
    setIsEditDialogOpen(true)
  }

  const handleEditPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setIsEditDialogOpen(true)
  }

  const handleDeletePlan = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePlan = () => {
    if (!selectedPlan) return

    // In a real implementation, this would be an API call
    setPricingPlans((plans) => plans.filter((p) => p.id !== selectedPlan.id))

    toast({
      title: 'Plan Deleted',
      description: `${selectedPlan.name} plan has been deleted.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedPlan(null)
  }

  const saveEditedPlan = () => {
    if (!selectedPlan) return

    // In a real implementation, this would be an API call
    setPricingPlans((plans) => {
      const index = plans.findIndex((p) => p.id === selectedPlan.id)
      if (index >= 0) {
        // Update existing plan
        const newPlans = [...plans]
        newPlans[index] = selectedPlan
        return newPlans
      } else {
        // Add new plan
        return [...plans, selectedPlan]
      }
    })

    toast({
      title: 'Plan Saved',
      description: `${selectedPlan.name} plan has been saved.`,
    })

    setIsEditDialogOpen(false)
    setSelectedPlan(null)
  }

  const addFeature = () => {
    if (!newFeature.trim()) return

    // In a real implementation, this would be an API call
    // Here we're just adding to the local state
    if (!allFeatures.includes(newFeature)) {
      // Code for the backend would add it to the database
      toast({
        title: 'Feature Added',
        description: `${newFeature} has been added to available features.`,
      })
      setNewFeature('')
    } else {
      toast({
        title: 'Feature Already Exists',
        description: 'This feature is already available.',
        variant: 'destructive',
      })
    }
  }

  // Feature handlers for the plan being edited
  const toggleFeatureForPlan = (featureName: string) => {
    if (!selectedPlan) return

    setSelectedPlan((plan) => {
      if (!plan) return null

      const updatedFeatures = [...plan.features]
      const featureIndex = updatedFeatures.findIndex(
        (f) => f.name === featureName
      )

      if (featureIndex >= 0) {
        // Toggle existing feature
        updatedFeatures[featureIndex] = {
          ...updatedFeatures[featureIndex],
          included: !updatedFeatures[featureIndex].included,
        }
      } else {
        // Add new feature
        updatedFeatures.push({
          id: `${plan.id}-${Date.now()}`,
          name: featureName,
          included: true,
        })
      }

      return {
        ...plan,
        features: updatedFeatures,
      }
    })
  }

  const addFeatureToPlan = (featureName: string) => {
    if (!selectedPlan) return

    // Only add if it doesn't already exist
    if (!selectedPlan.features.some((f) => f.name === featureName)) {
      setSelectedPlan((plan) => {
        if (!plan) return null

        return {
          ...plan,
          features: [
            ...plan.features,
            {
              id: `${plan.id}-${Date.now()}`,
              name: featureName,
              included: true,
            },
          ],
        }
      })
    }
  }

  const removeFeatureFromPlan = (featureId: string) => {
    if (!selectedPlan) return

    setSelectedPlan((plan) => {
      if (!plan) return null

      return {
        ...plan,
        features: plan.features.filter((f) => f.id !== featureId),
      }
    })
  }

  const togglePlanActive = (planId: string) => {
    setPricingPlans((plans) =>
      plans.map((plan) =>
        plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
      )
    )
  }

  const togglePlanPopular = (planId: string) => {
    setPricingPlans((plans) =>
      plans.map((plan) =>
        plan.id === planId
          ? { ...plan, isPopular: !plan.isPopular }
          : plan.isPopular
          ? { ...plan, isPopular: false }
          : plan
      )
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <p className="text-lg">Loading pricing plans...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pricing Management</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and features for schools
            </p>
          </div>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Plans Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${!plan.isActive ? 'opacity-70' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-medium">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{plan.name}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlan(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <div className="text-3xl font-bold flex items-end">
                        {plan.currency} {plan.monthly_price}
                        <span className="text-sm text-muted-foreground ml-1">
                          /month
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        or {plan.currency} {plan.annual_price}/year
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Up to {plan.maxStudents} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Up to {plan.maxTeachers} teachers
                        </span>
                      </div>
                    </div>
                    <div className="border-t my-2 pt-2">
                      <span className="text-sm font-medium">Key Features:</span>
                      <ul className="mt-2 space-y-1">
                        {plan.features
                          .filter((feature) => feature.included)
                          .slice(0, 4)
                          .map((feature) => (
                            <li key={feature.id} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{feature.name}</span>
                            </li>
                          ))}
                        {plan.features.filter((feature) => feature.included)
                          .length > 4 && (
                          <li className="text-sm text-muted-foreground">
                            +{' '}
                            {plan.features.filter((feature) => feature.included)
                              .length - 4}{' '}
                            more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={() => togglePlanActive(plan.id)}
                      />
                      <span className="text-sm">
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.isPopular}
                        onCheckedChange={() => togglePlanPopular(plan.id)}
                      />
                      <span className="text-sm">Popular</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Plans Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Comparison</CardTitle>
                <CardDescription>
                  Compare features across different plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Feature</TableHead>
                        {pricingPlans.map((plan) => (
                          <TableHead key={plan.id} className="text-center">
                            {plan.name}
                            {plan.isPopular && (
                              <Badge variant="secondary" className="ml-2">
                                Popular
                              </Badge>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Price (Monthly)
                        </TableCell>
                        {pricingPlans.map((plan) => (
                          <TableCell key={plan.id} className="text-center">
                            {plan.currency} {plan.monthly_price}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Maximum Students
                        </TableCell>
                        {pricingPlans.map((plan) => (
                          <TableCell key={plan.id} className="text-center">
                            {plan.maxStudents}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Maximum Teachers
                        </TableCell>
                        {pricingPlans.map((plan) => (
                          <TableCell key={plan.id} className="text-center">
                            {plan.maxTeachers}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* List all features across all plans */}
                      {Array.from(
                        new Set(
                          pricingPlans.flatMap((plan) =>
                            plan.features.map((feature) => feature.name)
                          )
                        )
                      )
                        .sort()
                        .map((featureName) => (
                          <TableRow key={featureName}>
                            <TableCell className="font-medium">
                              {featureName}
                            </TableCell>
                            {pricingPlans.map((plan) => {
                              const feature = plan.features.find(
                                (f) => f.name === featureName
                              )
                              return (
                                <TableCell
                                  key={plan.id}
                                  className="text-center"
                                >
                                  {feature?.included ? (
                                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Features</CardTitle>
                <CardDescription>
                  Manage the features that can be added to pricing plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="New feature name"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                  />
                  <Button onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                      <Badge variant="outline">
                        {
                          pricingPlans.filter((plan) =>
                            plan.features.some(
                              (f) => f.name === feature && f.included
                            )
                          ).length
                        }{' '}
                        plans
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>
                  See which plans include each feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Plans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allFeatures.map((feature) => {
                      const plansWithFeature = pricingPlans.filter((plan) =>
                        plan.features.some(
                          (f) => f.name === feature && f.included
                        )
                      )
                      return (
                        <TableRow key={feature}>
                          <TableCell className="font-medium">
                            {feature}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      (plansWithFeature.length /
                                        pricingPlans.length) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span>
                                {plansWithFeature.length}/{pricingPlans.length}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {plansWithFeature.map((plan) => (
                                <Badge
                                  key={plan.id}
                                  variant={
                                    plan.isPopular ? 'default' : 'secondary'
                                  }
                                >
                                  {plan.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Plan Dialog */}
      {selectedPlan && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPlan.id.startsWith('new-')
                  ? 'Create New Plan'
                  : `Edit ${selectedPlan.name} Plan`}
              </DialogTitle>
              <DialogDescription>
                Update the details and features for this pricing plan
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Plan Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={selectedPlan.name}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan-currency">Currency</Label>
                    <Select
                      value={selectedPlan.currency}
                      onValueChange={(value) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger id="plan-currency">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-price">Monthly Price</Label>
                    <Input
                      id="monthly-price"
                      type="number"
                      value={selectedPlan.monthly_price}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          monthly_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annual-price">Annual Price</Label>
                    <Input
                      id="annual-price"
                      type="number"
                      value={selectedPlan.annual_price}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          annual_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-students">Maximum Students</Label>
                    <Input
                      id="max-students"
                      type="number"
                      value={selectedPlan.maxStudents}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          maxStudents: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-teachers">Maximum Teachers</Label>
                    <Input
                      id="max-teachers"
                      type="number"
                      value={selectedPlan.maxTeachers}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          maxTeachers: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-description">Description</Label>
                  <textarea
                    id="plan-description"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={selectedPlan.description}
                    onChange={(e) =>
                      setSelectedPlan({
                        ...selectedPlan,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedPlan.isActive}
                      onCheckedChange={(checked) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          isActive: checked,
                        })
                      }
                    />
                    <Label htmlFor="plan-active">Active Plan</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedPlan.isPopular}
                      onCheckedChange={(checked) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          isPopular: checked,
                        })
                      }
                    />
                    <Label htmlFor="plan-popular">Mark as Popular</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 py-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-sm font-medium">Current Features</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Included</span>
                    <X className="h-4 w-4 text-muted-foreground ml-2" />
                    <span>Not Included</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {selectedPlan.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <span>{feature.name}</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={feature.included}
                          onCheckedChange={() =>
                            toggleFeatureForPlan(feature.name)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeatureFromPlan(feature.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-2">Add Features</h3>
                  <div className="flex space-x-2">
                    <Select onValueChange={addFeatureToPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a feature to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {allFeatures
                          .filter(
                            (feature) =>
                              !selectedPlan.features.some(
                                (f) => f.name === feature
                              )
                          )
                          .map((feature) => (
                            <SelectItem key={feature} value={feature}>
                              {feature}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // This would open a dialog to create a new feature in a real implementation
                        toast({
                          title: 'Feature Management',
                          description:
                            'Create new features in the Features tab',
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedPlan(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveEditedPlan}>Save Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedPlan && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the {selectedPlan.name} plan?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedPlan(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeletePlan}>
                Delete Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
}
