import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Define Zod schema for fee creation
const feeSchema = z.object({
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  studentId: z.string().min(1, 'Student ID is required'),
  notes: z.string().optional(),
})

// Define Zod schema for fee payment
const paymentSchema = z.object({
  status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'PARTIAL']),
  paymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid payment date format',
    })
    .optional(),
  paymentMethod: z.string().optional(),
  receiptNumber: z.string().optional(),
  amountPaid: z.number().min(0, 'Amount paid cannot be negative').optional(),
})

// Get all fees for a school
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, studentId, classId, startDate, endDate } = req.query

    // Check if user has school association
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Build query conditions
    let whereCondition: any = {
      student: {
        school: {
          id: userSchoolId,
        },
      },
    }

    // Filter by status
    if (status && typeof status === 'string') {
      whereCondition.status = status
    }

    // Filter by student
    if (studentId && typeof studentId === 'string') {
      whereCondition.studentId = studentId
    }

    // Filter by class
    if (classId && typeof classId === 'string') {
      whereCondition.student = {
        ...whereCondition.student,
        classId,
      }
    }

    // Filter by date range
    if (
      (startDate && typeof startDate === 'string') ||
      (endDate && typeof endDate === 'string')
    ) {
      whereCondition.dueDate = {}

      if (
        startDate &&
        typeof startDate === 'string' &&
        !isNaN(Date.parse(startDate))
      ) {
        whereCondition.dueDate.gte = new Date(startDate)
      }

      if (
        endDate &&
        typeof endDate === 'string' &&
        !isNaN(Date.parse(endDate))
      ) {
        whereCondition.dueDate.lte = new Date(endDate)
      }
    }

    // Fetch fee records
    const feeRecords = await prisma.feeRecord.findMany({
      where: whereCondition,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return res.status(200).json(feeRecords)
  } catch (error) {
    console.error('Error fetching fee records:', error)
    return res.status(500).json({ message: 'Failed to fetch fee records' })
  }
})

// Create a new fee record
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const validationResult = feeSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const { feeType, amount, dueDate, studentId, notes } = validationResult.data

    // Check if user has school association
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Verify student belongs to the user's school
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { school: true },
    })

    if (!student || student.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Student not found in your school' })
    }

    // Create fee record
    const feeRecord = await prisma.feeRecord.create({
      data: {
        feeType,
        amount,
        dueDate: new Date(dueDate),
        status: 'PENDING',
        notes,
        student: { connect: { id: studentId } },
      },
    })

    return res.status(201).json({
      message: 'Fee record created successfully',
      feeRecord,
    })
  } catch (error) {
    console.error('Error creating fee record:', error)
    return res.status(500).json({ message: 'Failed to create fee record' })
  }
})

// Update fee status (mark as paid, etc.)
router.put('/:feeId', authenticateToken, async (req, res) => {
  try {
    const { feeId } = req.params

    // Validate request body
    const validationResult = paymentSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const { status, paymentDate, paymentMethod, receiptNumber, amountPaid } =
      validationResult.data

    // Check if user has school association
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Verify fee record exists and belongs to the user's school
    const feeRecord = await prisma.feeRecord.findUnique({
      where: { id: feeId },
      include: { student: { include: { school: true } } },
    })

    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found' })
    }

    if (feeRecord.student.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Fee record not found in your school' })
    }

    // Update fee record
    const updateData: any = { status }

    if (paymentDate) {
      updateData.paymentDate = new Date(paymentDate)
    } else if (status === 'PAID') {
      // If marking as paid without a date, use current date
      updateData.paymentDate = new Date()
    }

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod
    }

    if (receiptNumber) {
      updateData.receiptNumber = receiptNumber
    }

    if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid
    }

    const updatedFeeRecord = await prisma.feeRecord.update({
      where: { id: feeId },
      data: updateData,
    })

    return res.status(200).json({
      message: 'Fee record updated successfully',
      feeRecord: updatedFeeRecord,
    })
  } catch (error) {
    console.error('Error updating fee record:', error)
    return res.status(500).json({ message: 'Failed to update fee record' })
  }
})

// Get fee summary stats for a school
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // Check if user has school association
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Calculate total fees, collected fees, and pending fees
    const allFees = await prisma.feeRecord.findMany({
      where: {
        student: {
          school: {
            id: userSchoolId,
          },
        },
      },
    })

    const totalAmount = allFees.reduce((sum, fee) => sum + fee.amount, 0)
    const collectedAmount = allFees
      .filter((fee) => fee.status === 'PAID')
      .reduce((sum, fee) => sum + fee.amount, 0)

    const pendingAmount = allFees
      .filter((fee) => fee.status === 'PENDING' || fee.status === 'OVERDUE')
      .reduce((sum, fee) => sum + fee.amount, 0)

    const overdueCount = allFees.filter(
      (fee) =>
        fee.status === 'OVERDUE' ||
        (fee.status === 'PENDING' && new Date(fee.dueDate) < new Date())
    ).length

    // Calculate monthly collection for the current year
    const currentYear = new Date().getFullYear()
    const monthlyCollection = Array(12).fill(0)

    allFees.forEach((fee) => {
      if (fee.status === 'PAID' && fee.paymentDate) {
        const paymentDate = new Date(fee.paymentDate)
        if (paymentDate.getFullYear() === currentYear) {
          const month = paymentDate.getMonth()
          monthlyCollection[month] += fee.amount
        }
      }
    })

    return res.status(200).json({
      totalAmount,
      collectedAmount,
      pendingAmount,
      overdueCount,
      collectionRate:
        totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0,
      monthlyCollection,
    })
  } catch (error) {
    console.error('Error fetching fee summary:', error)
    return res.status(500).json({ message: 'Failed to fetch fee summary' })
  }
})

export default router
