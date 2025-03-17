import bcrypt from 'bcrypt'

/**
 * Hash a password
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - The plain text password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} Whether the password matches
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a random password
 * @param {number} length - The length of the password to generate
 * @returns {string} A random password
 */
export function generateRandomPassword(length = 12) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}
