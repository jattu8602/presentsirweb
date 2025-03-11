import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../lib/jwt'
import { UserRole, User } from '@prisma/client'

// Define the token payload interface
interface TokenPayload {
  id: string
  email: string
  role: UserRole
  name?: string
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Only check admin access for admin routes
    if (!req.path.startsWith('/admin')) {
      return next()
    }

    const session = await prisma.session.findFirst({
      where: {
        sessionToken: req.headers.authorization?.replace('Bearer ', ''),
      },
      include: {
        user: true,
      },
    })

    if (!session?.user?.role || session.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = verifyToken(token) as TokenPayload
    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      return res.status(403).json({ message: 'Invalid token payload' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' })
  }
}
