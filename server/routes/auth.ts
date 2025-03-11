import express from 'express'
import { compare, hash } from 'bcrypt'
import { prisma } from '../lib/prisma'
import { generateToken } from '../lib/jwt'
import { UserRole } from '@prisma/client'

const router = express.Router()

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

export default router
