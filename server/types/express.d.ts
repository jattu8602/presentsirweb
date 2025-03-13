import { UserRole } from '../types/enums'

declare global {
  namespace Express {
    // Extend the existing Request interface with a flexible user object
    // that can accommodate any property structure
    interface Request {
      user?: {
        id: string
        email: string
        username?: string
        role?: UserRole | string
        schoolId?: string
        name?: string
        [key: string]: any // Allow any additional properties
      }
    }
  }
}

// This is needed to make this file a module
export {}
