import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Define Zod schema for marks entry
const marksSchema = z.object({
  examName: z.string().min(1, 'Exam name is required'),
  examType: z.enum([
    'UNIT_TEST',
    'MIDTERM',
    'FINAL',
    'ASSIGNMENT',
    'PROJECT',
    'OTHER',
  ]),
  subjectId: z.string().min(1, 'Subject ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  maxMarks: z.number().min(1, 'Maximum marks must be at least 1'),
  passingMarks: z.number().min(1, 'Passing marks must be at least 1'),
  studentMarks: z.array(
    z.object({
      studentId: z.string(),
      obtainedMarks: z.number().min(0, 'Obtained marks cannot be negative'),
      remarks: z.string().optional(),
    })
  ),
})

// Get marks for a specific class, subject, and exam
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { classId, subjectId, examType, examName } = req.query

    if (!classId || typeof classId !== 'string') {
      return res.status(400).json({ message: 'Class ID is required' })
    }

    // Build query conditions
    const conditions: any = { classId }

    if (subjectId && typeof subjectId === 'string') {
      conditions.subjectId = subjectId
    }

    if (examType && typeof examType === 'string') {
      conditions.examType = examType
    }

    if (examName && typeof examName === 'string') {
      conditions.examName = examName
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

    // Fetch marks with student information
    const marks = await prisma.mark.findMany({
      where: conditions,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
        class: true,
      },
    })

    return res.status(200).json(marks)
  } catch (error) {
    console.error('Error fetching marks:', error)
    return res.status(500).json({ message: 'Failed to fetch marks' })
  }
})

// Create or update marks for a class
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const validationResult = marksSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors,
      })
    }

    const {
      examName,
      examType,
      subjectId,
      classId,
      date,
      maxMarks,
      passingMarks,
      studentMarks,
    } = validationResult.data

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

    // Create or update marks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if an exam with the same name, type, subject, and class already exists
      const existingExam = await tx.mark.findFirst({
        where: {
          examName,
          examType,
          subjectId,
          classId,
        },
      })

      let markRecord

      if (existingExam) {
        // Update existing exam record
        markRecord = await tx.mark.update({
          where: { id: existingExam.id },
          data: {
            date: new Date(date),
            maxMarks,
            passingMarks,
          },
        })

        // Delete existing student marks to replace with new ones
        await tx.studentMark.deleteMany({
          where: { markId: existingExam.id },
        })
      } else {
        // Create new exam record
        markRecord = await tx.mark.create({
          data: {
            examName,
            examType,
            date: new Date(date),
            maxMarks,
            passingMarks,
            subjectId,
            classId,
            studentMarks: {
              create: studentMarks.map((mark) => ({
                student: { connect: { id: mark.studentId } },
                obtainedMarks: mark.obtainedMarks,
                remarks: mark.remarks,
              })),
            },
          },
        })
      }

      return res.status(200).json({
        message: existingExam
          ? 'Marks updated successfully'
          : 'Marks created successfully',
        data: markRecord,
      })
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error saving marks:', error)
    return res.status(500).json({ message: 'Failed to save marks' })
  }
})

// Get marks for a specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { school: true },
    })

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Check if user has access to this school
    if (req.user?.role !== 'ADMIN' && student.school.userId !== req.user?.id) {
      return res
        .status(403)
        .json({ message: 'You do not have access to this student' })
    }

    // Get all marks for the student
    const marks = await prisma.mark.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    })

    res.json(marks)
  } catch (error) {
    console.error('Error fetching student marks:', error)
    res.status(500).json({ message: 'Failed to fetch student marks' })
  }
})

// Delete a mark
router.delete('/:markId', authenticateToken, async (req, res) => {
  try {
    const { markId } = req.params

    // Verify mark exists
    const mark = await prisma.mark.findUnique({
      where: { id: markId },
      include: {
        class: {
          include: {
            school: true,
          },
        },
      },
    })

    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' })
    }

    // Check if user has access to this school
    const userSchoolId = req.user?.schoolId
    if (!userSchoolId || mark.class.school.id !== userSchoolId) {
      return res
        .status(403)
        .json({ message: 'Access denied: You do not have access to this mark' })
    }

    // Delete the mark
    await prisma.mark.delete({
      where: { id: markId },
    })

    res.json({ message: 'Mark deleted successfully' })
  } catch (error) {
    console.error('Error deleting mark:', error)
    res.status(500).json({ message: 'Failed to delete mark' })
  }
})

export const marksRouter = router
export default router
