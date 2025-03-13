import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth'
import { UserRole, AttendanceStatus } from '../types/enums'

const router = express.Router()
const prisma = new PrismaClient()

// Zod schema for attendance records
const attendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  classId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remark: z.string().optional(),
    })
  ),
})

// Get attendance for a specific class and date
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { classId, date } = req.query

    if (
      !classId ||
      !date ||
      typeof classId !== 'string' ||
      typeof date !== 'string'
    ) {
      return res.status(400).json({ message: 'Class ID and date are required' })
    }

    // Validate date format
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    // Check if user has access to this class
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Verify class belongs to the user's school
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: { school: true },
    })

    if (!classRecord || classRecord.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Class not found in your school' })
    }

    // Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId,
        date: new Date(date),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
    })

    return res.status(200).json(attendanceRecords)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return res
      .status(500)
      .json({ message: 'Failed to fetch attendance records' })
  }
})

// Create or update attendance for a class
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const validationResult = attendanceSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const { date, classId, records } = validationResult.data

    // Check if user has access to this class
    const userSchoolId = req.user?.schoolId
    const userRole = req.user?.role

    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Only allow teachers and admins to modify attendance
    if (
      userRole !== UserRole.TEACHER &&
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SCHOOL_ADMIN
    ) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' })
    }

    // Verify class belongs to the user's school
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: { school: true },
    })

    if (!classRecord || classRecord.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Class not found in your school' })
    }

    // Create or update attendance records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing records for this date and class to avoid duplicates
      await tx.attendance.deleteMany({
        where: {
          classId,
          date: new Date(date),
        },
      })

      // Create new attendance records
      const createdRecords = await Promise.all(
        records.map((record) =>
          tx.attendance.create({
            data: {
              date: new Date(date),
              status: record.status,
              remark: record.remark,
              class: { connect: { id: classId } },
              student: { connect: { id: record.studentId } },
            },
          })
        )
      )

      return createdRecords
    })

    return res.status(201).json({
      message: 'Attendance records saved successfully',
      count: result.length,
    })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return res
      .status(500)
      .json({ message: 'Failed to save attendance records' })
  }
})

// Get attendance statistics for a class
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query

    if (!classId || typeof classId !== 'string') {
      return res.status(400).json({ message: 'Class ID is required' })
    }

    // Parse dates if provided, otherwise use defaults
    const start =
      startDate &&
      typeof startDate === 'string' &&
      !isNaN(Date.parse(startDate))
        ? new Date(startDate)
        : new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days by default

    const end =
      endDate && typeof endDate === 'string' && !isNaN(Date.parse(endDate))
        ? new Date(endDate)
        : new Date()

    // Check if user has access to this class
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: No school association' })
    }

    // Verify class belongs to the user's school
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: { school: true },
    })

    if (!classRecord || classRecord.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: Class not found in your school' })
    }

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { classId },
    })

    // Calculate statistics for each student
    const attendanceStats = await Promise.all(
      students.map(async (student) => {
        const records = await prisma.attendance.findMany({
          where: {
            studentId: student.id,
            date: {
              gte: start,
              lte: end,
            },
          },
        })

        const total = records.length
        const present = records.filter((r) => r.status === 'PRESENT').length
        const absent = records.filter((r) => r.status === 'ABSENT').length
        const late = records.filter((r) => r.status === 'LATE').length
        const excused = records.filter((r) => r.status === 'EXCUSED').length

        return {
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          total,
          present,
          absent,
          late,
          excused,
          presentPercentage:
            total > 0 ? Math.round((present / total) * 100) : 0,
        }
      })
    )

    return res.status(200).json({
      startDate: start,
      endDate: end,
      totalDays:
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1,
      students: attendanceStats,
    })
  } catch (error) {
    console.error('Error fetching attendance statistics:', error)
    return res
      .status(500)
      .json({ message: 'Failed to fetch attendance statistics' })
  }
})

export default router
