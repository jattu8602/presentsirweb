import jwt from 'jsonwebtoken'
import { User, UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const generateToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.username,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: UserRole
      name?: string
    }
  } catch (error) {
    throw new Error('Invalid token')
  }
}
