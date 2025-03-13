import { useToast } from '@/components/ui/use-toast'

// Create a toast function that can be used outside of React components
let toastFn: any = null
export const setToastFunction = (toast: any) => {
  toastFn = toast
}

// Base API request function with error handling
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token')

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.message || `Error: ${response.status} ${response.statusText}`

      // Show toast for unauthorized or forbidden
      if (response.status === 401 || response.status === 403) {
        if (toastFn) {
          toastFn({
            title: 'Authentication Error',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          })
        }

        // Clear token and redirect to login
        localStorage.removeItem('token')
        window.location.href = '/auth'
      }

      throw new Error(errorMessage)
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiRequest<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyToken: () => apiRequest<{ user: any }>('/api/auth/verify'),
}

// Classes API
export const classesApi = {
  getAll: () => apiRequest<any[]>('/api/classes'),

  getById: (id: string) => apiRequest<any>(`/api/classes/${id}`),

  create: (data: any) =>
    apiRequest<any>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/api/classes/${id}`, {
      method: 'DELETE',
    }),
}

// Timetable API
export const timetableApi = {
  getByClass: (classId: string) =>
    apiRequest<any[]>(`/api/timetable?classId=${classId}`),

  createOrUpdate: (data: any) =>
    apiRequest<any>('/api/timetable', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/api/timetable/${id}`, {
      method: 'DELETE',
    }),
}

// Attendance API
export const attendanceApi = {
  getByClassAndDate: (classId: string, date: string) =>
    apiRequest<any[]>(`/api/attendance?classId=${classId}&date=${date}`),

  saveAttendance: (data: any) =>
    apiRequest<any>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStatistics: (classId: string, startDate?: string, endDate?: string) => {
    let url = `/api/attendance/statistics?classId=${classId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    return apiRequest<any>(url)
  },
}

// Marks API
export const marksApi = {
  getByClass: (classId: string, subjectId?: string, examType?: string) => {
    let url = `/api/marks?classId=${classId}`
    if (subjectId) url += `&subjectId=${subjectId}`
    if (examType) url += `&examType=${examType}`
    return apiRequest<any[]>(url)
  },

  saveMarks: (data: any) =>
    apiRequest<any>('/api/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudentPerformance: (studentId: string) =>
    apiRequest<any>(`/api/marks/student/${studentId}`),
}

// Fees API
export const feesApi = {
  getAll: (filters?: {
    status?: string
    studentId?: string
    classId?: string
  }) => {
    let url = '/api/fees'
    const queryParams = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
    }

    const queryString = queryParams.toString()
    if (queryString) url += `?${queryString}`

    return apiRequest<any[]>(url)
  },

  create: (data: any) =>
    apiRequest<any>('/api/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: any) =>
    apiRequest<any>(`/api/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSummary: () => apiRequest<any>('/api/fees/summary'),
}

// Subscriptions API
export const subscriptionsApi = {
  getSchoolSubscription: () => apiRequest<any>('/api/subscriptions/school'),

  getPlans: () => apiRequest<any[]>('/api/subscriptions/plans'),

  create: (data: any) =>
    apiRequest<any>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    apiRequest<any>(`/api/subscriptions/${id}/cancel`, {
      method: 'POST',
    }),
}

// Admin API
export const adminApi = {
  getSchools: (status?: string) => {
    let url = '/api/schools'
    if (status) url += `?status=${status}`
    return apiRequest<any[]>(url)
  },

  approveSchool: (id: string) =>
    apiRequest<any>(`/api/schools/${id}/approve`, {
      method: 'POST',
    }),

  rejectSchool: (id: string, reason?: string) =>
    apiRequest<any>(`/api/schools/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getSubscriptions: () => apiRequest<any[]>('/api/subscriptions'),
}

// Export a default API object with all services
const api = {
  auth: authApi,
  classes: classesApi,
  timetable: timetableApi,
  attendance: attendanceApi,
  marks: marksApi,
  fees: feesApi,
  subscriptions: subscriptionsApi,
  admin: adminApi,
}

export default api
