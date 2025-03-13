import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { UserRole } from '../types/enums'

const prisma = new PrismaClient()

/**
 * Middleware to authenticate token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET not configured')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    // Verify token and extract payload
    const payload = jwt.verify(token, secret) as any

    // Attach user info to request
    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username ?? null,
      role: payload.role,
      schoolId: payload.schoolId,
      name: payload.name,
    }

    // Skip schoolId lookup for admin users
    if (req.user.role === UserRole.ADMIN) {
      return next()
    }

    // If no schoolId in token but user might be associated with a school,
    // try to fetch and add it to the request
    if (req.user && !req.user.schoolId && req.user.id) {
      try {
        // Check if user owns a school
        const school = await prisma.school.findFirst({
          where: { userId: req.user.id },
          select: { id: true },
        })

        if (school) {
          req.user.schoolId = school.id
        } else {
          // Skip teacher lookup as it's causing issues with JSON fields
          // We'll address this in a more comprehensive fix
          console.log('Skipping teacher lookup due to Prisma schema mismatch')
        }
      } catch (error) {
        console.error('Error enhancing user token with school ID:', error)
        // Continue anyway, just without the schoolId
      }
    }

    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Admin privileges required' })
  }

  next()
}

/**
 * Middleware to require school admin or teacher role
 */
export const requireSchoolAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (req.user.role !== UserRole.ADMIN && !req.user.schoolId) {
    return res.status(403).json({ message: 'School access required' })
  }

  next()
}

// Export isAdmin for backward compatibility
export const isAdmin = requireAdmin

export default { authenticateToken, requireAdmin, requireSchoolAccess, isAdmin }
