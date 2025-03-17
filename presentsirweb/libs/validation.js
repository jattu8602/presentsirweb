/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export function isValidPhone(phone) {
  // Basic validation for Indian phone numbers
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    }
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    }
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    }
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    }
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    }
  }

  return {
    isValid: true,
    message: 'Password is strong',
  }
}

/**
 * Validate required fields in an object
 * @param {Object} data - The data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid flag and errors
 */
export function validateRequiredFields(data, requiredFields) {
  const errors = {}
  let isValid = true

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === 'string' && data[field].trim() === '')
    ) {
      errors[field] = `${field} is required`
      isValid = false
    }
  })

  return {
    isValid,
    errors,
  }
}

/**
 * Validate that a value is within a specified range
 * @param {number} value - The value to validate
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {boolean} Whether the value is within range
 */
export function isInRange(value, min, max) {
  const numValue = Number(value)
  return !isNaN(numValue) && numValue >= min && numValue <= max
}
