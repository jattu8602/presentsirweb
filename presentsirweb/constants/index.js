// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SCHOOL: 'school',
  TEACHER: 'teacher',
  STUDENT: 'student',
}

// School approval status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// Fee types
export const FEE_TYPES = {
  TUITION: 'tuition',
  ADMISSION: 'admission',
  EXAM: 'exam',
  TRANSPORT: 'transport',
  LIBRARY: 'library',
  LABORATORY: 'laboratory',
  SPORTS: 'sports',
  OTHER: 'other',
}

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  ONLINE: 'online',
  CHEQUE: 'cheque',
  BANK_TRANSFER: 'bank_transfer',
}

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
}

// Exam types
export const EXAM_TYPES = {
  UNIT_TEST: 'unit_test',
  MID_TERM: 'mid_term',
  FINAL: 'final',
  PRACTICAL: 'practical',
  ASSIGNMENT: 'assignment',
}

// Grade scales
export const GRADE_SCALES = {
  A_PLUS: { min: 90, max: 100, grade: 'A+', gpa: 4.0 },
  A: { min: 80, max: 89, grade: 'A', gpa: 3.7 },
  B_PLUS: { min: 75, max: 79, grade: 'B+', gpa: 3.3 },
  B: { min: 70, max: 74, grade: 'B', gpa: 3.0 },
  C_PLUS: { min: 65, max: 69, grade: 'C+', gpa: 2.7 },
  C: { min: 60, max: 64, grade: 'C', gpa: 2.3 },
  D: { min: 50, max: 59, grade: 'D', gpa: 2.0 },
  F: { min: 0, max: 49, grade: 'F', gpa: 0.0 },
}

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    RESET_PASSWORD: '/api/auth/reset-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
  },
  ADMIN: {
    AUTH: '/api/admin/auth',
    SCHOOLS: '/api/admin/schools',
    USERS: '/api/admin/users',
    DASHBOARD: '/api/admin/dashboard',
  },
  SCHOOL: {
    PROFILE: '/api/school/profile',
    STUDENTS: '/api/school/students',
    TEACHERS: '/api/school/teachers',
    CLASSES: '/api/school/classes',
    ATTENDANCE: '/api/school/attendance',
    FEES: '/api/school/fees',
    PAYMENTS: '/api/school/payments',
    EXAMS: '/api/school/exams',
    MARKS: '/api/school/marks',
    TIMETABLE: '/api/school/timetable',
    DASHBOARD: '/api/school/dashboard',
  },
  TEACHER: {
    PROFILE: '/api/teacher/profile',
    STUDENTS: '/api/teacher/students',
    ATTENDANCE: '/api/teacher/attendance',
    MARKS: '/api/teacher/marks',
    TIMETABLE: '/api/teacher/timetable',
    DASHBOARD: '/api/teacher/dashboard',
  },
  STUDENT: {
    PROFILE: '/api/student/profile',
    ATTENDANCE: '/api/student/attendance',
    FEES: '/api/student/fees',
    MARKS: '/api/student/marks',
    TIMETABLE: '/api/student/timetable',
    DASHBOARD: '/api/student/dashboard',
  },
}
