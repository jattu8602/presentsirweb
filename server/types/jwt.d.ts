import { UserRole } from './enums'

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string
    email?: string
    username?: string | null
    role?: UserRole | string
    schoolId?: string
    name?: string
    [key: string]: any
  }
}
