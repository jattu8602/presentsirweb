import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from '../lib/prisma'
import { Profile } from 'passport-google-oauth20'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const router = Router()

// Google OAuth configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any, info?: any) => void
    ) => {
      try {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value },
          include: { school: true },
        })

        if (!user) {
          // If no user exists, check if there's a pending school registration
          const pendingSchool = await prisma.school.findFirst({
            where: {
              email: profile.emails?.[0].value,
              approvalStatus: 'APPROVED',
            },
          })

          if (!pendingSchool) {
            return done(null, false, {
              message: 'No approved school found with this email',
            })
          }

          // Create user for approved school
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value || '',
              role: 'SCHOOL' as UserRole,
              school: {
                connect: {
                  id: pendingSchool.id,
                },
              },
            },
            include: { school: true },
          })
        }

        if (!user || user.role !== 'SCHOOL') {
          return done(null, false, {
            message: 'This login is for schools only',
          })
        }

        if (
          !user.school?.approvalStatus ||
          user.school.approvalStatus !== 'APPROVED'
        ) {
          return done(null, false, {
            message: 'Your school registration is pending approval',
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error)
      }
    }
  )
)

// Google OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth?error=google-auth-failed',
    successRedirect: '/dashboard',
  })
)

export default router
