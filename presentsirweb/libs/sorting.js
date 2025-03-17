/**
 * Parse sorting parameters from a request
 * @param {Object} request - The request object
 * @param {Object} defaultSort - Default sort configuration
 * @returns {Object} Sorting parameters for Prisma
 */
export function getSortParams(request, defaultSort = { createdAt: 'desc' }) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  // Get sort field and direction from query parameters
  const sortField = searchParams.get('sortBy')
  const sortDirection = searchParams.get('sortDir')?.toLowerCase()

  // If no sort parameters are provided, return default sort
  if (!sortField) {
    return defaultSort
  }

  // Validate sort direction
  const validDirection = ['asc', 'desc'].includes(sortDirection)
    ? sortDirection
    : 'asc'

  // Create and return sort object
  return {
    [sortField]: validDirection,
  }
}

/**
 * Create a sort configuration for Prisma
 * @param {string} field - The field to sort by
 * @param {string} direction - The sort direction ('asc' or 'desc')
 * @returns {Object} Sort configuration for Prisma
 */
export function createSortConfig(field, direction = 'asc') {
  // Validate sort direction
  const validDirection = ['asc', 'desc'].includes(direction) ? direction : 'asc'

  // Create and return sort object
  return {
    [field]: validDirection,
  }
}

/**
 * Parse multiple sorting parameters from a request
 * @param {Object} request - The request object
 * @param {Object} allowedFields - Allowed fields for sorting
 * @param {Object} defaultSort - Default sort configuration
 * @returns {Array} Array of sorting parameters for Prisma
 */
export function getMultiSortParams(
  request,
  allowedFields = [],
  defaultSort = { createdAt: 'desc' }
) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  // Get sort parameter from query
  const sortParam = searchParams.get('sort')

  // If no sort parameter is provided, return default sort
  if (!sortParam) {
    return [defaultSort]
  }

  try {
    // Parse sort parameter as JSON
    const sortConfig = JSON.parse(sortParam)

    // Validate and filter sort fields
    const validSortConfig = Object.entries(sortConfig)
      .filter(([field]) => allowedFields.includes(field))
      .map(([field, direction]) => {
        const validDirection = ['asc', 'desc'].includes(direction)
          ? direction
          : 'asc'
        return { [field]: validDirection }
      })

    // If no valid sort fields, return default sort
    if (validSortConfig.length === 0) {
      return [defaultSort]
    }

    return validSortConfig
  } catch (error) {
    // If parsing fails, return default sort
    console.error('Error parsing sort parameter:', error)
    return [defaultSort]
  }
}
