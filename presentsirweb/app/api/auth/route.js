import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
        teacher: true,
        student: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if school user's institution is approved (if applicable)
    if (
      user.role === 'SCHOOL' &&
      user.school &&
      user.school.approvalStatus !== 'APPROVED'
    ) {
      return NextResponse.json(
        { message: 'Your institution is pending approval', status: 'PENDING' },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '24h' }
    )

    // Prepare user data for response (excluding sensitive info)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      school: user.school,
      teacher: user.teacher,
      student: user.student,
    }

    return NextResponse.json({ user: userData, token }, { status: 200 })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Endpoint to verify a token and return user data
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)

      // Fetch user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          school: true,
          teacher: true,
          student: true,
        },
      })

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 })
      }

      // Prepare user data for response (excluding sensitive info)
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        school: user.school,
        teacher: user.teacher,
        student: user.student,
      }

      return NextResponse.json({ user: userData }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}
