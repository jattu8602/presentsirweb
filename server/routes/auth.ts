import express from 'express'
import { compare, hash } from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { generateToken } from '../lib/jwt.js'
import { UserRole } from '../types/enums.js'
import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { authenticateToken } from '../middleware/auth.js'
import type { Request, Response } from 'express'
import type { Session } from 'express-session'

// Extend Session type to include our custom properties
declare module 'express-session' {
  interface SessionData {
    oauthState?: string
  }
}

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
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: any
    ) => {
      try {
        console.log('Google profile:', profile)

        if (!profile.emails?.[0]?.value) {
          console.error('No email found in Google profile')
          return done(new Error('No email found in Google profile'))
        }

        const email = profile.emails[0].value
        console.log('Processing Google login for email:', email)

        // Generate a unique username from email, ensure it's not undefined
        const username = email.split('@')[0] || email

        // First try to find the user
        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          // If user doesn't exist, create a new one
          try {
            user = await prisma.user.create({
              data: {
                email,
                username,
                password: '',
                role: 'SCHOOL' as UserRole,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
            console.log('Created new user:', user)
          } catch (createError: any) {
            // If username is taken, append random numbers until we find a unique one
            if (createError.code === 'P2002') {
              let counter = 1
              while (true) {
                try {
                  user = await prisma.user.create({
                    data: {
                      email,
                      username: `${username}${counter}`,
                      password: '',
                      role: 'SCHOOL' as UserRole,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                  })
                  break
                } catch (retryError: any) {
                  if (retryError.code !== 'P2002') throw retryError
                  counter++
                }
              }
            } else {
              throw createError
            }
          }
        }

        console.log('User after operation:', user)
        return done(null, user)
      } catch (error) {
        console.error('Google auth error:', error)
        return done(error)
      }
    }
  )
)

// Initialize passport
router.use(passport.initialize())

// Google Auth Routes
router.get('/google', (req, res, next) => {
  // Generate a random state parameter for CSRF protection
  const state = Math.random().toString(36).substring(7)

  // Store state in session
  req.session.oauthState = state
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err)
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth?error=session-error`
      )
    }

    // Proceed with Google authentication
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state,
    })(req, res, next)
  })
})

router.get('/google/callback', (req, res, next) => {
  console.log('Received Google callback')
  // Verify state parameter
  const state = req.query.state as string | undefined
  const storedState = req.session.oauthState

  console.log('State verification:', {
    receivedState: state,
    storedState: storedState,
    sessionData: req.session,
  })

  // Skip state verification if both are undefined (fallback for compatibility)
  const stateValid =
    (!state && !storedState) || (state && storedState && state === storedState)

  if (!stateValid) {
    console.error('Invalid state parameter', { state, storedState })
    return res.redirect(`${process.env.FRONTEND_URL}/auth?error=invalid-state`)
  }

  // Clear stored state
  delete req.session.oauthState

  passport.authenticate('google', { session: false, failureRedirect: '/auth' })(
    req,
    res,
    () => {
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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
        sameSite: 'lax',
        path: '/',
      })

      // Redirect to frontend pending auth page
      res.redirect(`${process.env.FRONTEND_URL}/auth/pending`)
    }
  )
})

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
