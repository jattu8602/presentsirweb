import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { authenticateToken } from '../middleware/auth'
import { UserRole, ApprovalStatus, PlanType } from '../types/enums'
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
  planType: z.enum(['BASIC', 'PRO']),
  planDuration: z.number().min(1).max(12),
})

// Validate registration data
router.post('/validate', async (req, res) => {
  try {
    const data = schoolRegistrationSchema.parse(req.body)

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

    res.json({ valid: true })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Validation failed',
    })
  }
})

// Step 1: Create payment order
router.post('/create-order', async (req, res) => {
  try {
    const data = schoolRegistrationSchema.parse(req.body)

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
    const data = schoolRegistrationSchema.parse(req.body)
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body

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
    console.log(
      `Generated temporary password for ${data.email}: ${tempPassword} (length: ${tempPassword.length})`
    )
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
        ...data,
        userId: user.id,
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
        status: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Send confirmation emails
    await sendEmail({
      to: data.email,
      subject: `${data.institutionType} Registration Submitted - Present Sir`,
      text: `
        Dear ${data.principalName},

        Thank you for registering ${data.registeredName} with Present Sir.

        Your registration is pending admin approval. You will receive another email once your registration is approved.

        Temporary Login Credentials:
        Email: ${data.email}
        Password: ${tempPassword}

        Best regards,
        Present Sir Team
      `,
    })

    // Send email to admin (don't wait for it)
    sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `New ${data.institutionType} Registration - Present Sir`,
      text: `
        A new ${data.institutionType.toLowerCase()} has registered:

        Institution Name: ${data.registeredName}
        Registration Number: ${data.registrationNumber}
        Email: ${data.email}
        Principal: ${data.principalName}

        Please review and approve the registration in the admin panel.
      `,
    }).catch(console.error)

    res.status(201).json({
      message: 'Registration completed successfully',
      password: tempPassword,
      passwordLength: tempPassword.length,
    })
    console.log(
      `Registration completed for ${data.email} with password: ${tempPassword} (length: ${tempPassword.length})`
    )
  } catch (error) {
    console.error('Registration completion error:', error)
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
      // Remove the user relation that doesn't exist in the schema
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
    const { status, emailTemplate } = req.body

    // Generate temporary password if approving
    let tempPassword = ''
    if (status === 'APPROVED') {
      tempPassword = crypto.randomBytes(6).toString('hex')
      console.log(
        `Generated approval password for institution ${id}: ${tempPassword} (length: ${tempPassword.length})`
      )
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // First get the userId from the school
      const schoolData = await prisma.school.findUnique({
        where: { id },
        select: { userId: true },
      })

      if (!schoolData?.userId) {
        return res.status(404).json({ message: 'School user not found' })
      }

      // Update user's password
      await prisma.user.update({
        where: { id: schoolData.userId },
        data: { password: hashedPassword },
      })
    }

    const institution = await prisma.school.update({
      where: { id },
      data: {
        approvalStatus: status as ApprovalStatus,
      },
      // Don't include user relation since it doesn't exist
    })

    // Send email notification
    if (emailTemplate) {
      let emailBody = emailTemplate.body
        .replace('{{principalName}}', institution.principalName)
        .replace('{{schoolName}}', institution.registeredName)
        .replace('{{email}}', institution.email)
        .replace('{{password}}', tempPassword)

      await sendEmail({
        to: institution.email,
        subject: emailTemplate.subject,
        text: emailBody,
      })
    }

    res.json({
      ...institution,
      tempPassword: status === 'APPROVED' ? tempPassword : undefined,
      passwordLength: status === 'APPROVED' ? tempPassword.length : undefined,
    })
  } catch (error) {
    console.error('Error updating institution status:', error)
    res.status(500).json({ message: 'Internal server error' })
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

export const schoolsRouter = router
// Keep the default export for backward compatibility
export default router
