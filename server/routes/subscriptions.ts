import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Define Zod schema for subscription creation
const subscriptionSchema = z.object({
  planName: z.string().min(1, 'Plan name is required'),
  planType: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
  amount: z.number().min(0, 'Amount cannot be negative'),
  features: z.array(z.string()).optional(),
  status: z
    .enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'])
    .default('PENDING'),
  schoolId: z.string().min(1, 'School ID is required'),
})

// Define Zod schema for subscription update
const subscriptionUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'FAILED']).optional(),
  paymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid payment date format',
    })
    .optional(),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  receiptNumber: z.string().optional(),
  renewedUntil: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid renewal date format',
    })
    .optional(),
})

// Get subscriptions (admin route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, schoolId } = req.query

    // Only admin can list all subscriptions
    if (req.user?.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'Access denied: Admin privileges required' })
    }

    // Build query conditions
    let whereConditions: any = {}

    if (status && typeof status === 'string') {
      whereConditions.status = status
    }

    if (schoolId && typeof schoolId === 'string') {
      whereConditions.schoolId = schoolId
    }

    // Fetch subscription records
    const subscriptions = await prisma.subscription.findMany({
      where: whereConditions,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return res.status(500).json({ message: 'Failed to fetch subscriptions' })
  }
})

// Get subscription for a school
router.get('/school', authenticateToken, async (req, res) => {
  try {
    // Check if user has school association
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Fetch subscription records for the school
    const subscriptions = await prisma.subscription.findMany({
      where: {
        schoolId: userSchoolId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Find active subscription if any
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'ACTIVE'
    )

    return res.status(200).json({
      subscriptions,
      active: activeSubscription || null,
      hasActiveSubscription: !!activeSubscription,
    })
  } catch (error) {
    console.error('Error fetching school subscriptions:', error)
    return res
      .status(500)
      .json({ message: 'Failed to fetch school subscriptions' })
  }
})

// Create a new subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const validationResult = subscriptionSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const {
      planName,
      planType,
      startDate,
      endDate,
      amount,
      features,
      status,
      schoolId,
    } = validationResult.data

    // Check if user is admin or the school owner
    if (req.user?.role !== 'ADMIN' && req.user?.schoolId !== schoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' })
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    })

    if (!school) {
      return res.status(404).json({ message: 'School not found' })
    }

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        planName,
        planType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount,
        features: features || [],
        status,
        school: { connect: { id: schoolId } },
      },
    })

    return res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return res.status(500).json({ message: 'Failed to create subscription' })
  }
})

// Update subscription status
router.put('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.params

    // Validate request body
    const validationResult = subscriptionUpdateSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const updateData = validationResult.data

    // Fetch subscription to check ownership
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { school: true },
    })

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    // Check if user is admin or the school owner
    if (
      req.user?.role !== 'ADMIN' &&
      req.user?.schoolId !== subscription.schoolId
    ) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' })
    }

    // Prepare update data with date conversions
    const dataToUpdate: any = { ...updateData }

    if (updateData.paymentDate) {
      dataToUpdate.paymentDate = new Date(updateData.paymentDate)
    }

    if (updateData.renewedUntil) {
      dataToUpdate.renewedUntil = new Date(updateData.renewedUntil)
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: dataToUpdate,
    })

    return res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return res.status(500).json({ message: 'Failed to update subscription' })
  }
})

// Cancel subscription
router.post('/:subscriptionId/cancel', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.params

    // Fetch subscription to check ownership
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { school: true },
    })

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' })
    }

    // Check if user is admin or the school owner
    if (
      req.user?.role !== 'ADMIN' &&
      req.user?.schoolId !== subscription.schoolId
    ) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' })
    }

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    return res.status(200).json({
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return res.status(500).json({ message: 'Failed to cancel subscription' })
  }
})

// Get subscription plans (public route)
router.get('/plans', async (req, res) => {
  try {
    // This would typically fetch from a database, but for now just return static plans
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential features for small schools',
        price: 999,
        duration: 'monthly',
        features: [
          'Up to 100 students',
          'Basic attendance tracking',
          'Fee management',
          'Student profiles',
          'Email support',
        ],
      },
      {
        id: 'standard',
        name: 'Standard Plan',
        description: 'Complete solution for medium-sized schools',
        price: 2499,
        duration: 'monthly',
        features: [
          'Up to 500 students',
          'Advanced attendance tracking',
          'Fee management with receipts',
          'Exam and marks management',
          'Student & teacher profiles',
          'Timetable management',
          'Priority email support',
          'Basic reporting',
        ],
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        description: 'Advanced features for large institutions',
        price: 4999,
        duration: 'monthly',
        features: [
          'Unlimited students',
          'All Standard features',
          'Advanced analytics',
          'Custom reporting',
          'SMS notifications',
          'Online payment gateway',
          'Library management',
          'Transport management',
          'Dedicated support',
        ],
      },
    ]

    return res.status(200).json(plans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return res
      .status(500)
      .json({ message: 'Failed to fetch subscription plans' })
  }
})

export default router
