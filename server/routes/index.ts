import { Router } from 'express'
import authRouter from './auth'
import schoolsRouter from './schools'
import adminRouter from './admin'

const router = Router()

router.use('/auth', authRouter)
router.use('/schools', schoolsRouter)
router.use('/admin', adminRouter)

export default router
