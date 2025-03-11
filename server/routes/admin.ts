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

declare module 'express-session' {
  interface SessionData {
    userId: string
  }
}

const router = Router()

// Middleware to check if user is admin
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

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = schema.parse(req.body)

    // Check against environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create or get admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@edutrackpro.com',
          role: 'ADMIN',
          password: await bcrypt.hash(adminPassword, 10),
        },
      })
    }

    req.session.userId = adminUser.id
    res.json({ user: adminUser })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

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

// Approve/reject school
router.post('/admin/schools/:id/approve', isAdmin, async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(['APPROVED', 'REJECTED']),
      message: z.string().optional(),
    })

    const { id } = req.params
    const { status, message } = schema.parse(req.body)

    const school = await prisma.school.update({
      where: { id }, // MongoDB expects string IDs
      data: { approvalStatus: status },
      include: { user: true },
    })

    if (status === 'APPROVED') {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8)

      await prisma.user.update({
        where: { id: school.userId },
        data: { password: await bcrypt.hash(tempPassword, 10) },
      })

      // Send approval email with credentials
      await sendEmail({
        to: school.email,
        subject: 'School Registration Approved',
        text: `Your school registration has been approved! You can now login with:\n\nEmail: ${school.email}\nTemporary Password: ${tempPassword}\n\nPlease change your password after logging in.`,
      })
    } else if (message) {
      // Send rejection email
      await sendEmail({
        to: school.email,
        subject: 'School Registration Update',
        text: `Your school registration has been rejected.\n\nReason: ${message}`,
      })
    }

    res.json(school)
  } catch (error) {
    console.error('Error approving/rejecting school:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Approve or reject school
router.post('/schools/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = z
      .object({
        status: z.enum(['APPROVED', 'REJECTED']),
      })
      .parse(req.body)

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!school) {
      return res.status(404).json({ message: 'School not found' })
    }

    await prisma.school.update({
      where: { id },
      data: { approvalStatus: status },
    })

    // Send email notification
    const emailSubject =
      status === 'APPROVED'
        ? 'School Registration Approved - EduTrackPro'
        : 'School Registration Update - EduTrackPro'

    const emailText =
      status === 'APPROVED'
        ? `
          Dear ${school.principalName},

          Congratulations! Your school registration for ${school.registeredName} has been approved.

          You can now log in to your school dashboard using:
          Email: ${school.email}

          If you haven't set up your password yet, you can use the "Forgot Password" option on the login page.

          Best regards,
          EduTrackPro Team
        `
        : `
          Dear ${school.principalName},

          We regret to inform you that your school registration for ${school.registeredName} could not be approved at this time.

          Please contact our support team for more information.

          Best regards,
          EduTrackPro Team
        `

    await sendEmail({
      to: school.email,
      subject: emailSubject,
      text: emailText,
    })

    res.json({ message: `School ${status.toLowerCase()} successfully` })
  } catch (error) {
    console.error('Error updating school status:', error)
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : 'Failed to update school status',
    })
  }
})

export default router
