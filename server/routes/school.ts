import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient, PlanType } from '@prisma/client'
import Razorpay from 'razorpay'
import bcrypt from 'bcrypt'
import { sendEmail } from '../lib/email'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const schoolRegistrationSchema = z.object({
  registeredName: z.string().min(3),
  registrationNumber: z.string().min(3),
  streetAddress: z.string().min(3),
  city: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  officialPhone: z.string().min(10),
  officialEmail: z.string().email(),
  principalName: z.string().min(3),
  principalPhone: z.string().min(10),
  planType: z.enum(['BASIC', 'PRO']),
  planDuration: z.number().min(1).max(12),
})

// Register a new school
router.post('/register', async (req, res) => {
  try {
    const data = schoolRegistrationSchema.parse(req.body)

    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { registrationNumber: data.registrationNumber },
          { officialEmail: data.officialEmail },
        ],
      },
    })

    if (existingSchool) {
      return res.status(400).json({
        error: 'School with this registration number or email already exists',
      })
    }

    // Create temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: data.officialEmail,
        name: data.registeredName,
        password: hashedPassword,
        role: 'SCHOOL',
      },
    })

    // Create school profile
    const school = await prisma.school.create({
      data: {
        ...data,
        userId: user.id,
      },
    })

    // Create Razorpay order
    const amount = data.planType === 'BASIC' ? 999 : 1999
    const totalAmount = amount * data.planDuration

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: school.id,
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        schoolId: school.id,
        amount: totalAmount,
        planType: data.planType as PlanType,
        planDuration: data.planDuration,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    })

    // Send welcome email with temporary password
    await sendEmail({
      to: data.officialEmail,
      subject: 'Welcome to EduTrackPro - School Registration',
      text: `
        Dear ${data.principalName},

        Thank you for registering your school "${data.registeredName}" with EduTrackPro.

        Your registration is pending admin approval. Once approved, you can login with:
        Email: ${data.officialEmail}
        Temporary Password: ${tempPassword}

        Please change your password after your first login.

        Best regards,
        EduTrackPro Team
      `,
    })

    res.json({
      message: 'School registration submitted successfully',
      orderId: order.id,
      amount: totalAmount,
    })
  } catch (error) {
    console.error('School registration error:', error)
    res.status(400).json({ error: 'Invalid registration data' })
  }
})

// Payment verification webhook
router.post('/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' })
    }

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: razorpay_payment_id,
      },
    })

    res.json({ message: 'Payment verified successfully' })
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(400).json({ error: 'Payment verification failed' })
  }
})

export default router
