import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

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
})

router.post('/register', async (req, res) => {
  try {
    const data = schoolRegistrationSchema.parse(req.body)

    // Check if school with same registration number or email exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { registrationNumber: data.registrationNumber },
          { email: data.email },
        ],
      },
    })

    if (existingSchool) {
      return res.status(400).json({
        message:
          'A school with this registration number or email already exists',
      })
    }

    // Create Razorpay order for basic plan
    const order = await razorpay.orders.create({
      amount: 999900, // ₹9,999 in paise
      currency: 'INR',
      receipt: `schl_${Date.now()}`,
      notes: {
        schoolName: data.registeredName,
        email: data.email,
      },
    })

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: 'SCHOOL',
        username: data.registeredName.toLowerCase().replace(/\s+/g, '_'),
      },
    })

    // Create school record
    const school = await prisma.school.create({
      data: {
        ...data,
        userId: user.id,
        planType: 'BASIC',
        planDuration: 12, // 12 months
        approvalStatus: 'PENDING',
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        schoolId: school.id,
        amount: 9999,
        planType: 'BASIC',
        planDuration: 12,
        razorpayOrderId: order.id,
      },
    })

    // Send email to school with temporary credentials
    await sendEmail({
      to: data.email,
      subject: 'School Registration Submitted - EduTrackPro',
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
      subject: 'New School Registration - EduTrackPro',
      text: `
        A new school has registered:

        School Name: ${data.registeredName}
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
    console.error('School registration error:', error)
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

export default router
