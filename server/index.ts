import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { registerRoutes } from './routes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from the dist/public directory
try {
  const publicPath = resolve(__dirname, '../dist/public')
  app.use(express.static(publicPath))
  console.log('Serving static files from:', publicPath)
} catch (error) {
  console.error('Error setting up static files:', error)
}

// Register API routes
try {
  registerRoutes(app)
} catch (error) {
  console.error('Error registering routes:', error)
}

// Serve index.html for all other routes
app.get('*', (req, res) => {
  try {
    const indexPath = resolve(__dirname, '../dist/public/index.html')
    res.sendFile(indexPath)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Error loading the application')
  }
})

const port = process.env.PORT || 3000

// Export the app for Vercel
export default app

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}
