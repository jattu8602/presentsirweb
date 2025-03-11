import { UserRole } from '@prisma/client'

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string
    email: string
    role: UserRole
    name?: string
  }
}
