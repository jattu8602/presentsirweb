import { Router } from 'express'
import { hash } from 'bcrypt'
import { prisma } from '../lib/prisma'
import {
  UserRole,
  ApprovalStatus,
  PlanType,
  InstitutionType,
} from '@prisma/client'
import Razorpay from 'razorpay'

const router = Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Register a new school
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      registeredName,
      registrationNumber,
      streetAddress,
      city,
      district,
      state,
      pincode,
      officialPhone,
      officialEmail,
      principalName,
      principalPhone,
      planType,
      planDuration,
    } = req.body

    // Check if school registration number already exists
    const existingSchool = await prisma.school.findUnique({
      where: {
        registrationNumber,
      },
    })

    if (existingSchool) {
      return res
        .status(400)
        .json({ error: 'School with this registration number already exists' })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: officialEmail,
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Generate a temporary password
    const tempPassword = process.env.NEXT_DEFAULT_PASSWORD || '42455SKHDKDDR'
    const hashedPassword = await hash(tempPassword, 10)

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: officialEmail,
        name: registeredName,
        password: hashedPassword,
        role: UserRole.SCHOOL,
      },
    })

    // Then create school profile
    const school = await prisma.school.create({
      data: {
        userId: user.id,
        registeredName,
        registrationNumber,
        type: InstitutionType.SCHOOL,
        streetAddress,
        city,
        district,
        state,
        pincode,
        officialPhone,
        officialEmail,
        principalName,
        principalPhone,
        planType: (planType as PlanType) || PlanType.BASIC,
        planDuration: planDuration || 1,
        approvalStatus: ApprovalStatus.PENDING,
      },
    })

    // Create Razorpay order for plan payment
    const amount =
      planType === PlanType.PRO
        ? planDuration * 2999 * 100 // Pro plan: 2999 per year
        : planDuration * 999 * 100 // Basic plan: 999 per year

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `school_${school.id}`,
      notes: {
        schoolId: school.id,
        planType,
        planDuration,
      },
    })

    // Record the payment intent
    await prisma.payment.create({
      data: {
        schoolId: school.id,
        amount: amount / 100, // Store in rupees not paise
        planType: planType as PlanType,
        planDuration,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    })

    res.status(201).json({
      message: 'School registration submitted for approval',
      orderId: order.id,
      amount,
      schoolId: school.id,
    })
  } catch (error) {
    console.error('School registration error:', error)
    res.status(500).json({ error: 'An error occurred during registration' })
  }
})

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment' })
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'COMPLETED',
      },
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    res
      .status(500)
      .json({ error: 'An error occurred during payment verification' })
  }
})

export default router
