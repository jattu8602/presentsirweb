import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

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

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
