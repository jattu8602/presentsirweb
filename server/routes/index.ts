import { Router } from 'express'
import { authRouter } from './auth'
import { schoolsRouter } from './schools'
import { adminRouter } from './admin'
import { classesRouter } from './classes'
import { timetableRouter } from './timetable'
import { marksRouter } from './marks'
import { feesRouter } from './fees'
import { subscriptionsRouter } from './subscriptions'

const router = Router()

router.use('/auth', authRouter)
router.use('/schools', schoolsRouter)
router.use('/admin', adminRouter)
router.use('/classes', classesRouter)
router.use('/timetable', timetableRouter)
router.use('/marks', marksRouter)
router.use('/fees', feesRouter)
router.use('/subscriptions', subscriptionsRouter)

export {
  router,
  authRouter,
  schoolsRouter,
  adminRouter,
  classesRouter,
  timetableRouter,
  marksRouter,
  feesRouter,
  subscriptionsRouter,
}

export default router
