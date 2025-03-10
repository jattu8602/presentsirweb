import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sendEmail } from '../lib/email'

const router = Router()

// Admin authentication middleware
const isAdmin = async (req: any, res: any, next: any) => {
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

// Get dashboard stats
router.get('/admin/stats', isAdmin, async (req, res) => {
  const [schools, pendingSchools, teachers, students] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.teacher.count(),
    prisma.student.count(),
  ])

  res.json({
    schools,
    pendingSchools,
    teachers,
    students,
  })
})

// Get pending schools
router.get('/admin/schools/pending', isAdmin, async (req, res) => {
  const schools = await prisma.school.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { user: true },
  })
  res.json(schools)
})

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
      where: { id: parseInt(id) },
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

export default router
