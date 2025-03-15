import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { authenticateToken } from '../middleware/auth'
import { UserRole, ApprovalStatus, PlanType } from '../types/enums'
import { jsonResponse } from '../utils/serializer'
import type { Request } from 'express'
import type { School, Prisma } from '@prisma/client'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create separate schemas for different stages
const validationSchema = z
  .object({
    registeredName: z.string().min(3),
    registrationNumber: z.string().min(3),
    educationBoard: z.enum(['CBSE', 'ICSE', 'STATE']),
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
    planType: z.enum(['BASIC', 'PRO']),
    planDuration: z
      .number()
      .min(1)
      .max(12)
      .transform((val) => BigInt(val)),
  })
  .required()

// Separate schema for order creation that doesn't require userId
const orderSchema = validationSchema

// Complete registration schema that includes payment details but not userId
const completeRegistrationSchema = validationSchema.extend({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
})

type SchoolInput = z.infer<typeof completeRegistrationSchema>

// Validate registration data
router.post('/validate', async (req, res) => {
  try {
    const data = validationSchema.parse(req.body)

    // Check if institution already exists
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      })
    }

    // All validations passed
    res.json({
      valid: true,
      message: 'Validation successful',
    })
  } catch (error) {
    console.error('Validation error:', error)
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Validation failed',
    })
  }
})

// Step 1: Create payment order
router.post('/create-order', async (req, res) => {
  try {
    const data = orderSchema.parse(req.body)

    // Check for existing institution/user first
    const [existingInstitution, existingUser] = await Promise.all([
      prisma.school.findFirst({
        where: {
          OR: [
            { registrationNumber: data.registrationNumber },
            { email: data.email },
          ],
        },
      }),
      prisma.user.findUnique({
        where: { email: data.email },
      }),
    ])

    if (existingInstitution) {
      return res.status(400).json({
        message:
          'An institution with this registration number or email already exists',
      })
    }

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      })
    }

    // Calculate amount based on plan (₹1 for testing)
    const amount = 100 // ₹1 in paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // Fixed ₹1 amount for testing
      currency: 'INR',
      receipt: `inst_${Date.now()}`,
    })

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Order creation failed',
    })
  }
})

// Step 2: Complete registration after payment
router.post('/complete-registration', async (req, res) => {
  try {
    const data = completeRegistrationSchema.parse(req.body)
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    // Check if institution already exists
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      })
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Generate unique username
    const baseUsername = data.registeredName.toLowerCase().replace(/\s+/g, '_')
    let username = baseUsername
    let counter = 1

    while (true) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })
      if (!existingUsername) break
      username = `${baseUsername}_${counter}`
      counter++
    }

    // Create user account
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
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create institution record
    const institution = await prisma.school.create({
      data: {
        userId: user.id,
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
        approvalStatus: ApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        schoolId: institution.id,
        amount: 1, // ₹1 for testing
        planType: data.planType,
        planDuration: data.planDuration,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'SUCCESS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Send email notification
    await sendEmail({
      to: data.email,
      subject: 'School Registration Successful',
      text: `Thank you for registering your institution. Your login credentials are:\n\nEmail: ${data.email}\nPassword: ${tempPassword}\n\nPlease change your password after logging in.`,
    })

    res.status(201).json({
      message: 'Registration successful',
      password: tempPassword,
      email: data.email,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Registration failed',
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
      // Remove the user relation that doesn't exist in the schema
    })

    res.json(institutions)
  } catch (error) {
    console.error('Error fetching institutions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get pending institutions (admin only)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const pendingSchools = await prisma.school.findMany({
      where: {
        approvalStatus: ApprovalStatus.PENDING,
      },
      select: {
        id: true,
        registeredName: true,
        registrationNumber: true,
        email: true,
        principalName: true,
        phoneNumber: true,
        institutionType: true,
        approvalStatus: true,
        createdAt: true,
        userId: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        streetAddress: true,
        principalPhone: true,
        planType: true,
        planDuration: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch associated users separately
    const schoolUserIds = pendingSchools.map((school) => school.userId)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: schoolUserIds,
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    // Combine school and user data
    const schoolsWithUsers = pendingSchools.map((school) => {
      const user = users.find((u) => u.id === school.userId)
      return {
        ...school,
        user: user || null,
      }
    })

    return jsonResponse(res, schoolsWithUsers)
  } catch (error) {
    console.error('Error fetching pending institutions:', error)
    return res.status(500).json({
      error: 'Failed to fetch pending institutions',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Approve/reject institution (admin only)
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, rejectionReason, emailTemplate } = req.body

    const updatedSchool = await prisma.school.update({
      where: {
        id: id,
      },
      data: {
        approvalStatus: status as ApprovalStatus,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        registeredName: true,
        email: true,
        principalName: true,
        approvalStatus: true,
        userId: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        streetAddress: true,
        principalPhone: true,
        planType: true,
        planDuration: true,
      },
    })

    // Fetch the associated user
    const user = await prisma.user.findUnique({
      where: {
        id: updatedSchool.userId,
      },
      select: {
        email: true,
        role: true,
      },
    })

    const schoolWithUser = {
      ...updatedSchool,
      user: user || null,
    }

    // Send email notification
    if (emailTemplate) {
      await sendEmail({
        to: updatedSchool.email,
        subject: emailTemplate.subject,
        text: emailTemplate.body
          .replace('{{principalName}}', updatedSchool.principalName)
          .replace('{{schoolName}}', updatedSchool.registeredName)
          .replace('{{rejectionReason}}', rejectionReason || ''),
      })
    }

    return jsonResponse(res, schoolWithUser)
  } catch (error) {
    console.error('Error updating school status:', error)
    return res.status(500).json({
      error: 'Failed to update school status',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Get school status (for the dashboard to check if approved)
router.get('/status', authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Only school accounts can access this endpoint
    if (
      user.role !== UserRole.SCHOOL &&
      user.role !== UserRole.COACHING &&
      user.role !== UserRole.COLLEGE
    ) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const school = await prisma.school.findFirst({
      where: { userId: user.id },
    })

    if (!school) {
      return res.status(404).json({ message: 'School not found' })
    }

    res.json({
      status: school.approvalStatus,
    })
  } catch (error) {
    console.error('Error fetching school status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body
    const validatedData = completeRegistrationSchema.parse(data)

    const schoolData: Prisma.SchoolUncheckedCreateInput = {
      userId: validatedData.userId,
      registeredName: validatedData.registeredName,
      registrationNumber: validatedData.registrationNumber,
      streetAddress: validatedData.streetAddress,
      city: validatedData.city,
      district: validatedData.district,
      state: validatedData.state,
      pincode: validatedData.pincode,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
      principalName: validatedData.principalName,
      principalPhone: validatedData.principalPhone,
      institutionType: validatedData.institutionType,
      planType: validatedData.planType,
      planDuration: validatedData.planDuration,
      approvalStatus: ApprovalStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const institution = await prisma.school.create({
      data: schoolData,
    })

    return jsonResponse(res, institution)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid school data',
        details: error.errors,
      })
    }
    console.error('Error creating institution:', error)
    return res.status(500).json({
      error: 'Failed to create institution',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export const schoolsRouter = router
// Keep the default export for backward compatibility
export default router
