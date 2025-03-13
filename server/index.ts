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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
