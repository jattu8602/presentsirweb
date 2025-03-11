import express from 'express'
import cors from 'cors'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import schoolRoutes from './routes/schools'
import adminRoutes from './routes/admin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/schools', schoolRoutes)
app.use('/api/admin', adminRoutes)

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
