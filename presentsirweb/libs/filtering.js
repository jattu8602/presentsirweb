/**
 * Parse filter parameters from a request
 * @param {Object} request - The request object
 * @param {Array} allowedFields - Allowed fields for filtering
 * @returns {Object} Filter parameters for Prisma
 */
export function getFilterParams(request, allowedFields = []) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  // Initialize filter object
  const filters = {}

  // Process each search parameter
  for (const [key, value] of searchParams.entries()) {
    // Skip pagination and sorting parameters
    if (['page', 'limit', 'sortBy', 'sortDir', 'sort'].includes(key)) {
      continue
    }

    // Check if the field is allowed for filtering
    if (allowedFields.includes(key)) {
      filters[key] = value
    }
  }

  return filters
}

/**
 * Create a search filter for text fields
 * @param {string} searchTerm - The search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} Search filter for Prisma
 */
export function createSearchFilter(searchTerm, fields = []) {
  if (!searchTerm || fields.length === 0) {
    return {}
  }

  // Create OR conditions for each field
  const searchConditions = fields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  }))

  return {
    OR: searchConditions,
  }
}

/**
 * Create a date range filter
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} field - Field to filter on
 * @returns {Object} Date range filter for Prisma
 */
export function createDateRangeFilter(startDate, endDate, field = 'createdAt') {
  const filter = {}

  if (startDate) {
    filter[field] = {
      ...filter[field],
      gte: new Date(startDate),
    }
  }

  if (endDate) {
    filter[field] = {
      ...filter[field],
      lte: new Date(`${endDate}T23:59:59.999Z`),
    }
  }

  return filter
}

/**
 * Create a numeric range filter
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} field - Field to filter on
 * @returns {Object} Numeric range filter for Prisma
 */
export function createNumericRangeFilter(min, max, field) {
  const filter = {}

  if (min !== undefined && min !== null) {
    filter[field] = {
      ...filter[field],
      gte: Number(min),
    }
  }

  if (max !== undefined && max !== null) {
    filter[field] = {
      ...filter[field],
      lte: Number(max),
    }
  }

  return filter
}

/**
 * Parse complex filter parameters from a request
 * @param {Object} request - The request object
 * @returns {Object} Complex filter parameters for Prisma
 */
export function getComplexFilterParams(request) {
  const url = new URL(request.url)
  const filterParam = url.searchParams.get('filter')

  if (!filterParam) {
    return {}
  }

  try {
    // Parse filter parameter as JSON
    return JSON.parse(filterParam)
  } catch (error) {
    console.error('Error parsing filter parameter:', error)
    return {}
  }
}
