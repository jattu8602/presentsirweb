/**
 * Parse pagination parameters from a request
 * @param {Object} request - The request object
 * @returns {Object} Pagination parameters
 */
export function getPaginationParams(request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  // Get page and limit from query parameters
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  // Ensure page and limit are valid
  const validPage = page > 0 ? page : 1
  const validLimit = limit > 0 && limit <= 100 ? limit : 10

  // Calculate skip value for pagination
  const skip = (validPage - 1) * validLimit

  return {
    page: validPage,
    limit: validLimit,
    skip,
  }
}

/**
 * Create pagination metadata
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total number of items
 * @returns {Object} Pagination metadata
 */
export function createPaginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  }
}

/**
 * Create a paginated response
 * @param {Array} data - The data to paginate
 * @param {Object} meta - Pagination metadata
 * @param {string} message - Response message
 * @returns {Object} Paginated response
 */
export function paginatedResponse(data, meta, message = 'Success') {
  return {
    success: true,
    message,
    data,
    meta,
  }
}
