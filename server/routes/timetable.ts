import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Schema for timetable entry
const timetableEntrySchema = z.object({
  classId: z.string().min(1),
  day: z.string().min(1),
  periodNumber: z.number().min(1),
  startTime: z.string(),
  endTime: z.string(),
  subject: z.string().min(1),
  teacherId: z.string().optional(),
  teacherName: z.string().optional(),
})

// Get timetable for a specific class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { classId } = req.params

    // Check if the user has access to this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Get class details
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classDetails) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if user has access to this class
    if (user.school?.id !== classDetails.schoolId && user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'You do not have access to this class' })
    }

    // Get timetable entries
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: { classId },
      include: { teacher: true },
      orderBy: [{ day: 'asc' }, { periodNumber: 'asc' }],
    })

    return res.json(timetableEntries)
  } catch (err) {
    console.error('Error fetching timetable:', err)
    return res.status(500).json({ error: 'Failed to fetch timetable' })
  }
})

// Create or update timetable entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Validate input
    const validatedData = timetableEntrySchema.parse({
      ...req.body,
      periodNumber: Number(req.body.periodNumber),
    })

    // Check if user has access to this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Get class details
    const classDetails = await prisma.class.findUnique({
      where: { id: validatedData.classId },
    })

    if (!classDetails) {
      return res.status(404).json({ error: 'Class not found' })
    }

    // Check if user has access to this class
    if (user.school?.id !== classDetails.schoolId && user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'You do not have access to this class' })
    }

    // Find or create teacher if teacherName is provided but not teacherId
    let teacherId = validatedData.teacherId
    if (!teacherId && validatedData.teacherName) {
      const teacher = await prisma.teacher.create({
        data: {
          name: validatedData.teacherName,
          email: `${validatedData.teacherName
            .toLowerCase()
            .replace(/\s+/g, '.')}@school.com`,
          school: { connect: { id: classDetails.schoolId } },
        },
      })
      teacherId = teacher.id
    }

    // Check if an entry already exists for this class, day, and period
    const existingEntry = await prisma.timetableEntry.findFirst({
      where: {
        classId: validatedData.classId,
        day: validatedData.day,
        periodNumber: validatedData.periodNumber,
      },
    })

    let timetableEntry

    if (existingEntry) {
      // Update existing entry
      timetableEntry = await prisma.timetableEntry.update({
        where: { id: existingEntry.id },
        data: {
          subject: validatedData.subject,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          teacher: teacherId ? { connect: { id: teacherId } } : undefined,
        },
        include: { teacher: true },
      })
    } else {
      // Create new entry
      timetableEntry = await prisma.timetableEntry.create({
        data: {
          class: { connect: { id: validatedData.classId } },
          day: validatedData.day,
          periodNumber: validatedData.periodNumber,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          subject: validatedData.subject,
          teacher: teacherId ? { connect: { id: teacherId } } : undefined,
        },
        include: { teacher: true },
      })
    }

    return res.status(existingEntry ? 200 : 201).json(timetableEntry)
  } catch (err) {
    console.error('Error creating/updating timetable entry:', err)
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors })
    }
    return res
      .status(500)
      .json({ error: 'Failed to create/update timetable entry' })
  }
})

// Delete timetable entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    // Get the entry
    const entry = await prisma.timetableEntry.findUnique({
      where: { id },
      include: { class: true },
    })

    if (!entry) {
      return res.status(404).json({ error: 'Timetable entry not found' })
    }

    // Check if user has access to this class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (user.school?.id !== entry.class.schoolId && user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'You do not have access to this timetable entry' })
    }

    // Delete the entry
    await prisma.timetableEntry.delete({
      where: { id },
    })

    return res.json({ message: 'Timetable entry deleted successfully' })
  } catch (err) {
    console.error('Error deleting timetable entry:', err)
    return res.status(500).json({ error: 'Failed to delete timetable entry' })
  }
})

export const timetableRouter = router
// Keep the default export for backward compatibility
export default router
