import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import schoolRoutes from './routes/schools'
import adminRoutes from './routes/admin'
import authRoutes from './routes/auth'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './middleware/auth'
import { prisma } from './lib/prisma'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      /\.ngrok-free\.app$/, // Allow all ngrok domains
      /\.ngrok\.io$/, // Allow all ngrok domains (older format)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(cookieParser())

// API routes
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

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist/public')))

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../dist/public/index.html'))
})

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log('Connecting to database:', process.env.DATABASE_URL)
  })
  .catch((error) => {
    console.error('Database connection error:', error)
    process.exit(1)
  })

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
