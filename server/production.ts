import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { registerRoutes } from './routes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve static files from the React app
app.use(express.static(path.resolve(__dirname, '../public')))

// Register API routes
registerRoutes(app)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
