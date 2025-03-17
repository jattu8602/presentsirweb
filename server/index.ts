import express from 'express'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import { PrismaClient } from '@prisma/client'
import schoolRoutes from './routes/schools.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './middleware/auth.js'

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/',
    },
  })
)

// Cookie parser middleware (before passport)
app.use(cookieParser())

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    done(null, user)
  } catch (error) {
    done(error)
  }
})

// Routes
app.use('/api/schools', schoolRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)

// User endpoint
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
