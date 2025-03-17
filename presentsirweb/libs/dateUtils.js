/**
 * Format a date to a string in the format DD/MM/YYYY
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
export function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Format a date to a string in the format DD/MM/YYYY HH:MM
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date and time string
 */
export function formatDateTime(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Get the current academic year in the format YYYY-YYYY
 * @returns {string} The current academic year
 */
export function getCurrentAcademicYear() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed

  // In India, academic year typically starts in June
  if (month >= 6) {
    return `${currentYear}-${currentYear + 1}`
  } else {
    return `${currentYear - 1}-${currentYear}`
  }
}

/**
 * Get the start and end dates of a month
 * @param {number} month - The month (1-12)
 * @param {number} year - The year
 * @returns {Object} Object containing start and end dates
 */
export function getMonthDateRange(month, year) {
  // Month is 1-indexed in the parameter but Date constructor uses 0-indexed months
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of the month

  return {
    startDate,
    endDate,
  }
}

/**
 * Calculate the difference in days between two dates
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} The number of days between the dates
 */
export function getDaysDifference(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Set hours, minutes, seconds, and milliseconds to 0 to compare only dates
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  // Calculate the difference in milliseconds and convert to days
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} Whether the date is in the past
 */
export function isDateInPast(date) {
  const checkDate = new Date(date)
  const today = new Date()

  // Set hours, minutes, seconds, and milliseconds to 0 to compare only dates
  checkDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return checkDate < today
}
