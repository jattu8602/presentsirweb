import { NextResponse } from 'next/server'

/**
 * Create a success response
 * @param {Object} data - The data to include in the response
 * @param {string} message - A success message
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse} The formatted success response
 */
export function successResponse(
  data = null,
  message = 'Success',
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

/**
 * Create an error response
 * @param {string} message - An error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {Object|null} errors - Additional error details
 * @returns {NextResponse} The formatted error response
 */
export function errorResponse(
  message = 'An error occurred',
  status = 400,
  errors = null
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  )
}

/**
 * Create a validation error response
 * @param {Object} errors - Validation errors
 * @param {string} message - An error message
 * @returns {NextResponse} The formatted validation error response
 */
export function validationErrorResponse(errors, message = 'Validation failed') {
  return errorResponse(message, 422, errors)
}

/**
 * Create an unauthorized error response
 * @param {string} message - An error message
 * @returns {NextResponse} The formatted unauthorized error response
 */
export function unauthorizedResponse(message = 'Unauthorized access') {
  return errorResponse(message, 401)
}

/**
 * Create a forbidden error response
 * @param {string} message - An error message
 * @returns {NextResponse} The formatted forbidden error response
 */
export function forbiddenResponse(message = 'Forbidden access') {
  return errorResponse(message, 403)
}

/**
 * Create a not found error response
 * @param {string} message - An error message
 * @returns {NextResponse} The formatted not found error response
 */
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404)
}
