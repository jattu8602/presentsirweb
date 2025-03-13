import express from 'express'
import { compare, hash } from 'bcrypt'
import { prisma } from '../lib/prisma'
import { generateToken } from '../lib/jwt'
import { UserRole } from '@prisma/client'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { authenticateToken } from '../middleware/auth'
import type { Request, Response } from 'express'

const router = express.Router()

// Type definition for our user
interface User {
  id: string
  email: string
  username: string | null
  password?: string
  role: UserRole
}

// Define custom types for passport to properly handle our user structure
declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      username: string | null
      role: UserRole
    }
  }
}

// Configure Google Strategy for Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        // Find user by email
        const email = profile.emails?.[0]?.value
        if (!email) {
          return done(new Error('No email found in Google profile'))
        }

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          // No user found with this email - can't automatically register
          return done(null, false)
        }

        // User exists, return the user (we don't need to update anything)
        return done(null, {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        })
      } catch (error) {
        return done(error as Error)
      }
    }
  )
)

// Initialize passport
router.use(passport.initialize())

// Google Auth Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth' }),
  (req, res) => {
    const user = req.user as User

    if (!user) {
      return res.redirect('/auth?error=auth_failed')
    }

    // Generate JWT token
    const token = generateToken(user)

    // Set token in cookie/session
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/auth/redirect`)
  }
)

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.username,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { email, password, ...schoolData } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.SCHOOL,
        username: schoolData.schoolName,
      },
    })

    const school = await prisma.school.create({
      data: {
        ...schoolData,
        userId: user.id,
        approvalStatus: 'PENDING',
      },
    })

    res.status(201).json({
      message: 'Registration successful',
      school,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get current user
router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
