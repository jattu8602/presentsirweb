import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Schema for class creation
const createClassSchema = z.object({
  name: z.string().min(1, { message: 'Class name is required' }),
  teacherName: z.string().min(1, { message: 'Teacher name is required' }),
  teacherEmail: z.string().email({ message: 'Invalid email address' }),
  teacherPhone: z
    .string()
    .min(10, { message: 'Phone number should be at least 10 digits' }),
  subject: z.string().optional(),
  totalStudents: z.number().min(1, { message: 'Must have at least 1 student' }),
  boys: z.number().min(0),
  girls: z.number().min(0),
  startRollNumber: z.number().min(1),
  endRollNumber: z.number().min(1),
  schoolId: z.string().optional(),
})

// Get all classes for the current school
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get the school ID from the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (!user?.school) {
      return res
        .status(400)
        .json({ error: 'No school associated with this user' })
    }

    const schoolId = user.school.id

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        teacher: true,
        students: true,
      },
      orderBy: { name: 'asc' },
    })

    return res.json(classes)
  } catch (err) {
    console.error('Error fetching classes:', err)
    return res.status(500).json({ error: 'Failed to fetch classes' })
  }
})

// Create a new class
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get the school ID from the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (!user?.school) {
      return res
        .status(400)
        .json({ error: 'No school associated with this user' })
    }

    const schoolId = user.school.id

    // Validate the input
    const validatedData = createClassSchema.parse({
      ...req.body,
      totalStudents: Number(req.body.totalStudents),
      boys: Number(req.body.boys),
      girls: Number(req.body.girls),
      startRollNumber: Number(req.body.startRollNumber),
      endRollNumber: Number(req.body.endRollNumber),
    })

    // First, create or find the teacher
    const teacher = await prisma.teacher.upsert({
      where: {
        email_schoolId: {
          email: validatedData.teacherEmail,
          schoolId,
        },
      },
      update: {
        name: validatedData.teacherName,
        phone: validatedData.teacherPhone,
      },
      create: {
        name: validatedData.teacherName,
        email: validatedData.teacherEmail,
        phone: validatedData.teacherPhone,
        school: { connect: { id: schoolId } },
      },
    })

    // Now create the class
    const newClass = await prisma.class.create({
      data: {
        name: validatedData.name,
        totalStudents: validatedData.totalStudents,
        boys: validatedData.boys,
        girls: validatedData.girls,
        startRollNumber: validatedData.startRollNumber,
        endRollNumber: validatedData.endRollNumber,
        subject: validatedData.subject,
        school: { connect: { id: schoolId } },
        teacher: { connect: { id: teacher.id } },
      },
      include: { teacher: true },
    })

    return res.status(201).json(newClass)
  } catch (err) {
    console.error('Error creating class:', err)
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors })
    }
    return res.status(500).json({ error: 'Failed to create class' })
  }
})

// Get a specific class by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const classId = req.params.id

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        students: true,
      },
    })

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if the user is authorized to access this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (user?.school?.id !== classData.schoolId && user?.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Unauthorized access to this class' })
    }

    return res.json(classData)
  } catch (err) {
    console.error('Error fetching class:', err)
    return res.status(500).json({ error: 'Failed to fetch class' })
  }
})

// Update a class
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const classId = req.params.id

    // Get the class to check authorization
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if the user is authorized to modify this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (user?.school?.id !== existingClass.schoolId && user?.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Unauthorized to modify this class' })
    }

    // Validate the input
    const validatedData = createClassSchema.parse({
      ...req.body,
      totalStudents: Number(req.body.totalStudents),
      boys: Number(req.body.boys),
      girls: Number(req.body.girls),
      startRollNumber: Number(req.body.startRollNumber),
      endRollNumber: Number(req.body.endRollNumber),
    })

    // Update the teacher if provided
    if (validatedData.teacherEmail) {
      await prisma.teacher.upsert({
        where: {
          email_schoolId: {
            email: validatedData.teacherEmail,
            schoolId,
          },
        },
        update: {
          name: validatedData.teacherName,
          phone: validatedData.teacherPhone,
        },
        create: {
          name: validatedData.teacherName,
          email: validatedData.teacherEmail,
          phone: validatedData.teacherPhone,
          school: { connect: { id: schoolId } },
        },
      })
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        name: validatedData.name,
        totalStudents: validatedData.totalStudents,
        boys: validatedData.boys,
        girls: validatedData.girls,
        startRollNumber: validatedData.startRollNumber,
        endRollNumber: validatedData.endRollNumber,
        subject: validatedData.subject,
        teacher: validatedData.teacherEmail
          ? {
              connect: {
                email_schoolId: {
                  email: validatedData.teacherEmail,
                  schoolId,
                },
              },
            }
          : undefined,
      },
      include: { teacher: true },
    })

    return res.json(updatedClass)
  } catch (err) {
    console.error('Error updating class:', err)
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors })
    }
    return res.status(500).json({ error: 'Failed to update class' })
  }
})

// Delete a class
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const classId = req.params.id

    // Get the class to check authorization
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if the user is authorized to delete this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (user?.school?.id !== existingClass.schoolId && user?.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Unauthorized to delete this class' })
    }

    // Delete the class
    await prisma.class.delete({
      where: { id: classId },
    })

    return res.json({ message: 'Class deleted successfully' })
  } catch (err) {
    console.error('Error deleting class:', err)
    return res.status(500).json({ error: 'Failed to delete class' })
  }
})

export const classesRouter = router
// Keep the default export for backward compatibility
export default router
