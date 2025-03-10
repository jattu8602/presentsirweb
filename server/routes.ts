import type { Express } from 'express'
import { createServer, type Server } from 'http'
import { storage } from './storage'
import { setupAuth } from './auth'
import { z } from 'zod'
import schoolRoutes from './routes/school'
import adminRoutes from './routes/admin'
import { prisma } from './lib/prisma'
import { Router } from 'express'

const router = Router()

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app)

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Unauthorized')
    }
    next()
  }

  // Register the routes
  router.use('/api/schools', schoolRoutes)
  router.use('/api/admin', adminRoutes)

  // Students
  router.get('/api/students', requireAuth, async (req, res) => {
    const students = await storage.getStudentsByInstitution(req.user!.id)
    res.json(students)
  })

  router.post('/api/students', requireAuth, async (req, res) => {
    const student = await storage.createStudent({
      ...req.body,
      institutionId: req.user!.id,
    })
    res.status(201).json(student)
  })

  // Attendance
  router.get('/api/attendance/today', requireAuth, async (req, res) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const students = await storage.getStudentsByInstitution(req.user!.id)
    const attendance = await storage.getAttendanceByDate(today)

    const present = attendance.filter((a) => a.status === 'present').length

    res.json({
      present,
      total: students.length,
    })
  })

  router.post('/api/attendance', requireAuth, async (req, res) => {
    const attendance = await storage.createAttendance(req.body)
    res.status(201).json(attendance)
  })

  // Fees
  router.get('/api/fees/pending', requireAuth, async (req, res) => {
    const students = await storage.getStudentsByInstitution(req.user!.id)
    const studentIds = students.map((s) => s.id)
    const fees = await storage.getPendingFees(studentIds)
    res.json(fees)
  })

  router.post('/api/fees', requireAuth, async (req, res) => {
    const fee = await storage.createFee(req.body)
    res.status(201).json(fee)
  })

  // Reports
  router.get('/api/reports/recent', requireAuth, async (req, res) => {
    const students = await storage.getStudentsByInstitution(req.user!.id)
    const studentIds = students.map((s) => s.id)
    const reports = await storage.getRecentReports(studentIds)
    res.json(reports)
  })

  router.post('/api/reports', requireAuth, async (req, res) => {
    const report = await storage.createReport(req.body)
    res.status(201).json(report)
  })

  // Recent Activity
  router.get('/api/activity/recent', requireAuth, async (req, res) => {
    const students = await storage.getStudentsByInstitution(req.user!.id)
    const studentIds = students.map((s) => s.id)

    const [attendance, fees, reports] = await Promise.all([
      storage.getRecentAttendance(studentIds),
      storage.getRecentFees(studentIds),
      storage.getRecentReports(studentIds),
    ])

    // Combine and sort by date
    const activities = [
      ...attendance.map((a) => ({
        type: 'attendance',
        description: `Attendance marked for ${a.studentId}`,
        time: a.date,
      })),
      ...fees.map((f) => ({
        type: 'fee',
        description: `Fee ${f.status} for ${f.studentId}`,
        time: f.date,
      })),
      ...reports.map((r) => ({
        type: 'report',
        description: r.description,
        time: r.date,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5)

    res.json(activities)
  })

  const httpServer = createServer(app)
  return httpServer
}

export default router
