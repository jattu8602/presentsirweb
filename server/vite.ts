import express, { type Express } from 'express'
import fs from 'fs'
import path, { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createServer as viteCreateServer, createLogger } from 'vite'
import { ViteDevServer } from 'vite'
import { type Server } from 'http'
import viteConfig from '../vite.config'
import { nanoid } from 'nanoid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const viteLogger = createLogger()

export function log(message: string, source = 'express') {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  console.log(`${formattedTime} [${source}] ${message}`)
}

export async function createViteServer(
  app: express.Application,
  isProd = process.env.NODE_ENV === 'production'
) {
  const distPath = resolve(__dirname, '../dist/public')
  const srcPath = resolve(__dirname, '../client')
  const indexProd = resolve(distPath, 'index.html')

  if (!isProd) {
    const vite = await (
      await import('vite')
    ).createServer({
      root: srcPath,
      logLevel: 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
      appType: 'custom',
    })

    app.use(vite.middlewares)
  } else {
    app.use(express.static(distPath, { index: false }))
  }

  return { isProd, distPath, srcPath, indexProd }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, 'public')

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    )
  }

  app.use(express.static(distPath))

  // fall through to index.html if the file doesn't exist
  app.use('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'))
  })
}
