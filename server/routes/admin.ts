import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ApprovalStatus, UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '../lib/email'
import { hash } from 'bcrypt'

const router = Router()

// Admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized' })
  }
  next()
}

// Get all schools pending approval
router.get('/schools/pending', isAdmin, async (req, res) => {
  try {
    const pendingSchools = await prisma.school.findMany({
      where: {
        approvalStatus: ApprovalStatus.PENDING,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    res.json(pendingSchools)
  } catch (error) {
    console.error('Error fetching pending schools:', error)
    res.status(500).json({ error: 'An error occurred' })
  }
})

// Approve or reject a school
router.post('/schools/:id/approval', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, message } = req.body

    if (
      status !== ApprovalStatus.APPROVED &&
      status !== ApprovalStatus.REJECTED
    ) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!school) {
      return res.status(404).json({ error: 'School not found' })
    }

    // Update school approval status
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        approvalStatus: status,
      },
    })

    // If approved, send welcome email with login credentials
    if (status === ApprovalStatus.APPROVED) {
      // Generate a random password
      const password = Math.random().toString(36).slice(-8)
      const hashedPassword = await hash(password, 10)

      // Update user password
      await prisma.user.update({
        where: { id: school.userId },
        data: {
          password: hashedPassword,
        },
      })

      // Send welcome email with password
      await sendWelcomeEmail(school.user.email!, password)
    }

    res.json(updatedSchool)
  } catch (error) {
    console.error('Error updating school approval:', error)
    res.status(500).json({ error: 'An error occurred' })
  }
})

// Get admin dashboard analytics
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const [
      totalSchools,
      totalStudents,
      totalTeachers,
      schoolsByType,
      schoolsByPlan,
      recentApprovals,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.school.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.school.groupBy({
        by: ['planType'],
        _count: true,
      }),
      prisma.school.findMany({
        where: {
          approvalStatus: ApprovalStatus.APPROVED,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
      }),
    ])

    res.json({
      totalSchools,
      totalStudents,
      totalTeachers,
      schoolsByType,
      schoolsByPlan,
      recentApprovals,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'An error occurred' })
  }
})

export default router
