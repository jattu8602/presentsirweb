import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { UserRole } from '@prisma/client'

// Define the token payload interface
interface TokenPayload {
  id: string
  role: UserRole
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('Current path:', req.path)

  // Skip auth check for login route
  if (req.path === '/login') {
    console.log('Skipping auth for login route')
    return next()
  }

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  console.log('Auth header:', authHeader ? 'Present' : 'Missing')

  if (!token) {
    console.log('No token provided')
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = verifyToken(token)
    console.log('Token decoded:', decoded)

    if (decoded.role !== UserRole.ADMIN) {
      console.log('Not an admin role:', decoded.role)
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    req.user = decoded
    console.log('Admin access granted')
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(403).json({ message: 'Invalid token' })
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' })
  }
}
