import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { authenticateToken } from '../middleware/auth'
import { UserRole, ApprovalStatus, PlanType } from '@prisma/client'
import type { Request } from 'express'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const schoolRegistrationSchema = z.object({
  registeredName: z.string().min(3),
  registrationNumber: z.string().min(3),
  streetAddress: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  phoneNumber: z.string().min(10),
  email: z.string().email(),
  principalName: z.string().min(3),
  principalPhone: z.string().min(10),
  institutionType: z.enum(['SCHOOL', 'COACHING', 'COLLEGE']),
})

router.post('/register', async (req, res) => {
  try {
    const data = schoolRegistrationSchema.parse(req.body)

    // Check if institution with same registration number or email exists
    const existingInstitution = await prisma.school.findFirst({
      where: {
        OR: [
          { registrationNumber: data.registrationNumber },
          { email: data.email },
        ],
      },
    })

    if (existingInstitution) {
      return res.status(400).json({
        message:
          'An institution with this registration number or email already exists',
      })
    }

    // Create Razorpay order for basic plan
    const order = await razorpay.orders.create({
      amount: 999900, // ₹9,999 in paise
      currency: 'INR',
      receipt: `inst_${Date.now()}`,
      notes: {
        institutionName: data.registeredName,
        email: data.email,
        type: data.institutionType,
      },
    })

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create user account with appropriate role
    const userRole =
      data.institutionType === 'SCHOOL'
        ? UserRole.SCHOOL
        : data.institutionType === 'COACHING'
        ? UserRole.COACHING
        : UserRole.COLLEGE

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: userRole,
        username: data.registeredName.toLowerCase().replace(/\s+/g, '_'),
      },
    })

    // Create institution record
    const institution = await prisma.school.create({
      data: {
        ...data,
        userId: user.id,
        planType: PlanType.BASIC,
        planDuration: 12, // 12 months
        approvalStatus: ApprovalStatus.PENDING,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        schoolId: institution.id,
        amount: 9999,
        planType: PlanType.BASIC,
        planDuration: 12,
        razorpayOrderId: order.id,
      },
    })

    // Send email to institution with temporary credentials
    await sendEmail({
      to: data.email,
      subject: `${data.institutionType} Registration Submitted - EduTrackPro`,
      text: `
        Dear ${data.principalName},

        Thank you for registering ${data.registeredName} with EduTrackPro.

        Your registration is pending admin approval. You will receive another email once your registration is approved.

        Temporary Login Credentials:
        Email: ${data.email}
        Password: ${tempPassword}

        Please complete your payment using the following Razorpay order ID: ${order.id}

        Best regards,
        EduTrackPro Team
      `,
    })

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `New ${data.institutionType} Registration - EduTrackPro`,
      text: `
        A new ${data.institutionType.toLowerCase()} has registered:

        Institution Name: ${data.registeredName}
        Registration Number: ${data.registrationNumber}
        Email: ${data.email}
        Principal: ${data.principalName}

        Please review and approve the registration in the admin panel.
      `,
    })

    res.status(201).json({
      message: 'Registration submitted successfully',
      orderId: order.id,
    })
  } catch (error) {
    console.error('Institution registration error:', error)
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Registration failed',
    })
  }
})

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    // Update payment status
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'PAID',
        updatedAt: new Date(),
      },
    })

    res.json({ message: 'Payment verified successfully' })
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Payment verification failed',
    })
  }
})

// Get all institutions (admin only)
router.get('/', authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user
    if (!user?.role || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const institutions = await prisma.school.findMany({
      include: {
        user: {
          select: {
            email: true,
            username: true,
            role: true,
          },
        },
      },
    })

    res.json(institutions)
  } catch (error) {
    console.error('Error fetching institutions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get pending institutions (admin only)
router.get('/pending', authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user
    if (!user?.role || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const institutions = await prisma.school.findMany({
      where: {
        approvalStatus: ApprovalStatus.PENDING,
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            role: true,
          },
        },
      },
    })

    res.json(institutions)
  } catch (error) {
    console.error('Error fetching pending institutions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Approve/reject institution (admin only)
router.post('/:id/approve', authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user
    if (!user?.role || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const { status } = req.body

    const institution = await prisma.school.update({
      where: { id },
      data: {
        approvalStatus: status as ApprovalStatus,
      },
    })

    res.json(institution)
  } catch (error) {
    console.error('Error updating institution status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
