import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * Authentication middleware for API routes
 * @param {Request} request - The incoming request
 * @param {boolean} requireAdmin - Whether admin access is required
 * @returns {Object} - The user data if authenticated, null otherwise
 */
export async function authMiddleware(request, requireAdmin = false) {
  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      user: null,
      error: 'No token provided',
      status: 401,
    }
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('JWT secret not configured')
      return {
        authenticated: false,
        user: null,
        error: 'Authentication not configured',
        status: 500,
      }
    }

    const decoded = jwt.verify(token, secret)

    // If admin access is required, check if user is admin
    if (requireAdmin && (!decoded.isAdmin || decoded.role !== 'ADMIN')) {
      return {
        authenticated: false,
        user: null,
        error: 'Admin access required',
        status: 403,
      }
    }

    return {
      authenticated: true,
      user: decoded,
      error: null,
      status: 200,
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return {
      authenticated: false,
      user: null,
      error: 'Invalid token',
      status: 401,
    }
  }
}

/**
 * Create a response for authentication errors
 * @param {string} message - The error message
 * @param {number} status - The HTTP status code
 * @returns {NextResponse} - The JSON response
 */
export function authErrorResponse(message, status) {
  return NextResponse.json({ message }, { status })
}
