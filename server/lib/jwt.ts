import jwt from 'jsonwebtoken'
import { UserRole } from '../types/enums'

interface TokenPayload {
  id: string
  email?: string
  username?: string | null
  role: UserRole | string
  schoolId?: string
  name?: string
  [key: string]: any // Allow any additional properties
}

export function generateToken(payload: Partial<TokenPayload>): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || process.env.SESSION_SECRET!,
    {
      expiresIn: '1d',
    }
  )
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || process.env.SESSION_SECRET!
  ) as TokenPayload
}
