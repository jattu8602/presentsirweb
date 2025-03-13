import express from 'express'
import { compare, hash } from 'bcrypt'
import { prisma } from '../lib/prisma'
import { generateToken } from '../lib/jwt'
import { UserRole } from '../types/enums'
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
  schoolId?: string
  name?: string
}

// Define custom types for passport to properly handle our user structure
declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      username: string | null
      role: UserRole
      schoolId?: string
      name?: string
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

    // Generate JWT token with specific fields
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    })

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
    console.log(
      `Login attempt for email: ${email}, password length: ${password.length}`
    )

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      console.log(`User not found or no password set for: ${email}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    console.log(`User found, comparing password for: ${email}`)
    console.log(`Stored password hash: ${user.password.substring(0, 10)}...`)
    console.log(
      `Password type: ${typeof password}, Password value first few chars: ${password.substring(
        0,
        3
      )}...`
    )

    const isValidPassword = await compare(password, user.password)
    console.log(`Password comparison result: ${isValidPassword}`)

    if (!isValidPassword) {
      console.log(`Invalid password for: ${email}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token - pass the whole user object
    // Our updated generateToken will handle the conversion
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    })

    // Set token in cookie/session
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return success response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.username,
      },
      token,
    })
  } catch (error) {
    console.error('Error during login:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Verify token endpoint - added to fix login issues
router.get('/verify', authenticateToken, (req, res) => {
  try {
    // If the authenticateToken middleware passes, we have a valid user
    if (!req.user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    // Return the user info
    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        username: req.user.username,
        name: req.user.username, // For backward compatibility
        schoolId: req.user.schoolId,
      },
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export const authRouter = router
// Keep the default export for backward compatibility
export default router
