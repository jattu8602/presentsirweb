import type { Express } from 'express'
import { createServer, type Server } from 'http'
import { setupAuth } from './auth'
import { Router } from 'express'

// Import routers - handle both default and named exports
import authRouter from './routes/auth'
import schoolsRouter from './routes/schools'
import adminRouter from './routes/admin'
import classesRouter from './routes/classes'
import timetableRouter from './routes/timetable'
import attendanceRouter from './routes/attendance'
import marksRouter from './routes/marks'
import feesRouter from './routes/fees'
import subscriptionsRouter from './routes/subscriptions'

// Create additional routers
const usersRouter = Router()
const router = Router()

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app)

  // Register all API routes
  app.use('/api/auth', authRouter)
  app.use('/api/schools', schoolsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/classes', classesRouter)
  app.use('/api/timetable', timetableRouter)
  app.use('/api/attendance', attendanceRouter)
  app.use('/api/marks', marksRouter)
  app.use('/api/fees', feesRouter)
  app.use('/api/subscriptions', subscriptionsRouter)

  app.use(router)

  const httpServer = createServer(app)
  return httpServer
}

export default router
