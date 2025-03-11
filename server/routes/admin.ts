import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sendEmail } from '../lib/email'
import { Session } from 'express-session'
import { isAdmin } from '../middleware/auth'
import { authenticateToken } from '../middleware/auth'
import { UserRole, ApprovalStatus } from '@prisma/client'
import type { Request, Response } from 'express'
import { generateToken } from '../lib/jwt'

declare module 'express-session' {
  interface SessionData {
    userId: string
  }
}

const router = Router()

const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

// Admin login route (no auth required)
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', { username: req.body.username })
    const { username, password } = adminLoginSchema.parse(req.body)

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      console.log('Invalid credentials provided')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken({
      id: 'admin',
      role: UserRole.ADMIN,
    })

    console.log('Login successful, token generated')
    res.json({ token })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Login failed',
    })
  }
})

// Apply isAdmin middleware to all routes after this point
router.use(isAdmin)

// Admin authentication middleware
const isAdminMiddleware = async (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}

// Get admin stats
router.get(
  '/stats',
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const [schools, students, teachers] = await Promise.all([
        prisma.school.count(),
        prisma.student.count(),
        prisma.teacher.count(),
      ])

      res.json({
        schools,
        students,
        teachers,
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// Get pending schools
router.get(
  '/schools/pending',
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const schools = await prisma.school.findMany({
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

      res.json(schools)
    } catch (error) {
      console.error('Error fetching pending schools:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// Get all schools
router.get(
  '/schools',
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const schools = await prisma.school.findMany({
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

      res.json(schools)
    } catch (error) {
      console.error('Error fetching schools:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// Get analytics
router.get(
  '/analytics',
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const [
        totalSchools,
        pendingSchools,
        approvedSchools,
        totalStudents,
        totalTeachers,
      ] = await Promise.all([
        prisma.school.count(),
        prisma.school.count({
          where: { approvalStatus: ApprovalStatus.PENDING },
        }),
        prisma.school.count({
          where: { approvalStatus: ApprovalStatus.APPROVED },
        }),
        prisma.student.count(),
        prisma.teacher.count(),
      ])

      res.json({
        totalSchools,
        pendingSchools,
        approvedSchools,
        totalStudents,
        totalTeachers,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// Approve school
router.post(
  '/schools/:id/approve',
  authenticateToken,
  async (req: Request, res) => {
    try {
      const user = req.user
      if (!user?.role || user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Unauthorized' })
      }

      const { id } = req.params

      const school = await prisma.school.update({
        where: { id },
        data: { approvalStatus: ApprovalStatus.APPROVED },
        include: { user: true },
      })

      // Generate a new password
      const newPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update user password
      await prisma.user.update({
        where: { id: school.userId },
        data: { password: hashedPassword },
      })

      // Send approval email with credentials
      await sendEmail({
        to: school.email,
        subject: 'School Registration Approved - EduTrackPro',
        text: `
        Dear ${school.principalName},

        Your school registration for ${school.registeredName} has been approved!

        You can now log in to EduTrackPro using the following credentials:
        Email: ${school.email}
        Password: ${newPassword}

        Please change your password after your first login.

        Best regards,
        EduTrackPro Team
      `,
      })

      res.json({ message: 'School approved successfully' })
    } catch (error) {
      console.error('School approval error:', error)
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Approval failed',
      })
    }
  }
)

// Test email route
router.post('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'chaurasiyajatin68@gmail.com', // Using the email from your previous config
      subject: 'Test Email from Present Sir',
      text: `
Hello!

This is a test email from Present Sir using Resend.
If you receive this, the email configuration is working correctly.

Best regards,
Present Sir Team
      `,
    })

    res.json({ message: 'Test email sent successfully' })
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to send test email',
    })
  }
})

export default router
