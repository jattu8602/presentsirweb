import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check against environment variables for admin credentials
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables')
      return NextResponse.json(
        { message: 'Admin authentication not configured' },
        { status: 500 }
      )
    }

    // Verify admin credentials
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { message: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Create JWT token for admin
    const token = jwt.sign(
      {
        username: adminUsername,
        role: 'ADMIN',
        isAdmin: true,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '24h' }
    )

    // Return admin data and token
    return NextResponse.json(
      {
        user: {
          username: adminUsername,
          role: 'ADMIN',
          isAdmin: true,
        },
        token,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin authentication error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Verify admin token
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

      // Check if token is for admin
      if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
        return NextResponse.json(
          { message: 'Not authorized as admin' },
          { status: 403 }
        )
      }

      // Return admin data
      return NextResponse.json(
        {
          user: {
            username: decoded.username,
            role: 'ADMIN',
            isAdmin: true,
          },
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin token verification error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}
