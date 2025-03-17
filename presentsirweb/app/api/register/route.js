import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const data = await request.json()
    const {
      email,
      password,
      institutionType,
      registeredName,
      registrationNumber,
      phoneNumber,
      principalName,
      principalPhone,
      streetAddress,
      city,
      district,
      state,
      pincode,
      planType,
      planDuration = 1, // Default to 1 month
    } = data

    // Validate input
    if (!email || !password || !institutionType || !registeredName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Generate username from email
    let username = email.split('@')[0].toLowerCase()

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    // If username exists, append random digits
    if (existingUsername) {
      username = `${username}${Math.floor(1000 + Math.random() * 9000)}`
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: institutionType,
        },
      })

      // Create school/college/coaching record
      const institution = await prisma.school.create({
        data: {
          userId: user.id,
          registeredName,
          registrationNumber,
          institutionType,
          phoneNumber,
          principalName,
          principalPhone,
          streetAddress,
          city,
          district,
          state,
          pincode,
          planType,
          planDuration,
          approvalStatus: 'PENDING',
          educationBoard: data.educationBoard || 'CBSE', // Default to CBSE
        },
      })

      return { user, institution }
    })

    return NextResponse.json(
      {
        message: 'Registration successful. Approval pending.',
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          role: result.user.role,
        },
        institution: {
          id: result.institution.id,
          name: result.institution.registeredName,
          approvalStatus: result.institution.approvalStatus,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed', error: error.message },
      { status: 500 }
    )
  }
}
