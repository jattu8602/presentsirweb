import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

interface TokenPayload {
  id: string
  role: UserRole
}

export function generateToken(payload: TokenPayload): string {
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
