import { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    // Extend the existing Request interface
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
        name?: string
      }
    }
  }
}

// This is needed to make this file a module
export {}
