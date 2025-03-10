import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare, hash } from 'bcrypt'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './lib/prisma'
import { sendPasswordResetEmail } from './lib/email'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      image?: string
    }
  }

  interface JWT {
    id: string
    name: string
    email: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || '',
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email || undefined,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.username || '',
        email: dbUser.email,
        role: dbUser.role,
      }
    },
  },
}

export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

  await prisma.verificationToken.create({
    data: {
      identifier: user.email!,
      token,
      expires,
    },
  })

  return { token, email: user.email! }
}

export async function resetPassword(token: string, newPassword: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  })

  if (!verificationToken) {
    throw new Error('Invalid token')
  }

  if (verificationToken.expires < new Date()) {
    throw new Error('Token expired')
  }

  const hashedPassword = await hash(newPassword, 10)

  await prisma.user.update({
    where: {
      email: verificationToken.identifier,
    },
    data: {
      password: hashedPassword,
    },
  })

  await prisma.verificationToken.delete({
    where: {
      token,
    },
  })
}

export async function requestPasswordReset(email: string) {
  const { token, email: userEmail } = await generatePasswordResetToken(email)
  await sendPasswordResetEmail(userEmail, token)
}
