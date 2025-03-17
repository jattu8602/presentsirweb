import jwt from 'jsonwebtoken'

/**
 * Generate a JWT token for a user
 * @param {Object} payload - The data to encode in the token
 * @param {Object} options - Options for the token generation
 * @returns {string} The generated JWT token
 */
export function generateToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET or NEXTAUTH_SECRET is not defined in environment variables'
    )
  }

  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }

  return jwt.sign(payload, secret, { ...defaultOptions, ...options })
}

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET or NEXTAUTH_SECRET is not defined in environment variables'
    )
  }

  try {
    return jwt.verify(token, secret)
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return null
  }
}

/**
 * Decode a JWT token without verification
 * @param {string} token - The token to decode
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    console.error('Token decoding failed:', error.message)
    return null
  }
}
