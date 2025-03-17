'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../../../components/layout/dashboard-layout'

export default function SchoolDashboardPage() {
  const [timeframe, setTimeframe] = useState('week')
  const [schoolStatus, setSchoolStatus] = useState('APPROVED')
  const [loading, setLoading] = useState(true)

  // Simulated data - in a real app, this would come from an API
  const stats = {
    students: {
      total: 450,
      change: '+12 this week',
      changeType: 'increase',
    },
    attendance: {
      percentage: '92%',
      present: 414,
      absent: 36,
      change: '+2%',
      changeType: 'increase',
    },
    teachers: {
      total: 32,
      change: '+3 this month',
      changeType: 'increase',
    },
    fees: {
      collected: '₹4.5L',
      pending: '₹1.2L',
      change: '+15%',
      changeType: 'increase',
    },
  }

  const recentActivities = [
    {
      id: 1,
      description: 'New student admission - Rahul Sharma',
      time: '2 hours ago',
    },
    {
      id: 2,
      description: 'Attendance marked for Class 10-A',
      time: '3 hours ago',
    },
    {
      id: 3,
      description: 'Fee payment received - ₹15,000',
      time: '5 hours ago',
    },
    {
      id: 4,
      description: 'New teacher onboarded - Priya Patel',
      time: '1 day ago',
    },
    { id: 5, description: 'Monthly report generated', time: '2 days ago' },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: 'March 20, 2024',
      time: '10:00 AM',
    },
    {
      id: 2,
      title: 'Annual Sports Day',
      date: 'March 25, 2024',
      time: 'All Day',
    },
    {
      id: 3,
      title: 'Science Exhibition',
      date: 'April 5, 2024',
      time: '11:00 AM',
    },
  ]

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle approval pending status
  if (schoolStatus === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-yellow-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Approval Pending
          </h1>
          <p className="text-gray-600 mb-6">
            Your school registration is currently under review. We'll notify you
            once approved.
          </p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              For any queries, please contact support at{' '}
              <a href="mailto:support@presentsir.com" className="text-blue-600">
                support@presentsir.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle rejection status
  if (schoolStatus === 'REJECTED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Rejected
          </h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but your school registration was not approved. Please
            review the feedback and reapply.
          </p>
          <div className="p-4 bg-red-50 rounded-lg mb-6">
            <p className="text-red-800 text-sm">
              Reason: Verification documents are incomplete. Please provide all
              required certification.
            </p>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Reapply with Corrections
          </button>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              For any clarifications, please contact support at{' '}
              <a href="mailto:support@presentsir.com" className="text-blue-600">
                support@presentsir.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout type="school" activePath="/school/dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">School Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === 'week'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === 'month'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === 'year'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Students Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Total Students
              </h3>
              <div
                className={`flex items-center text-sm ${
                  stats.students.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stats.students.changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {stats.students.change}
              </div>
            </div>

            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="mt-2 text-3xl font-semibold">
                {stats.students.total}
              </p>
            )}
          </div>

          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Attendance Rate
              </h3>
              <div
                className={`flex items-center text-sm ${
                  stats.attendance.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stats.attendance.changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {stats.attendance.change}
              </div>
            </div>

            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold">
                  {stats.attendance.percentage}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.attendance.present} present, {stats.attendance.absent}{' '}
                  absent
                </p>
              </>
            )}
          </div>

          {/* Teachers Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Total Teachers
              </h3>
              <div
                className={`flex items-center text-sm ${
                  stats.teachers.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stats.teachers.changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {stats.teachers.change}
              </div>
            </div>

            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="mt-2 text-3xl font-semibold">
                {stats.teachers.total}
              </p>
            )}
          </div>

          {/* Fees Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Fee Collection
              </h3>
              <div
                className={`flex items-center text-sm ${
                  stats.fees.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stats.fees.changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {stats.fees.change}
              </div>
            </div>

            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold">
                  {stats.fees.collected}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.fees.pending} pending
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white p-4 rounded-lg shadow text-center hover:bg-gray-50 transition duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <CalendarPlusIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Mark Attendance</h3>
              <p className="text-sm text-gray-500 mt-1">
                Record today's attendance
              </p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow text-center hover:bg-gray-50 transition duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <DocumentPlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">Record Fees</h3>
              <p className="text-sm text-gray-500 mt-1">Add new fee payments</p>
            </button>
            <button className="bg-white p-4 rounded-lg shadow text-center hover:bg-gray-50 transition duration-150">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Send Notice</h3>
              <p className="text-sm text-gray-500 mt-1">
                Notify parents or staff
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Activity</h2>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </a>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <ActivityIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Upcoming Events</h2>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                View calendar
              </a>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg animate-pulse"
                  >
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {event.date} • {event.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Icon components
function TrendingUpIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  )
}

function TrendingDownIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l2.199 6.588m-13.608.59l-1.892-6.144a1.06 1.06 0 00-1.18-.742 48.723 48.723 0 00-9.197 2.265 1.05 1.05 0 00-.54 1.49l9.752 14.76a1.05 1.05 0 001.61.183l3.112-2.927a1.05 1.05 0 01.68-.257z"
      />
    </svg>
  )
}

function CalendarPlusIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
      />
    </svg>
  )
}

function DocumentPlusIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function EnvelopeIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  )
}

function ActivityIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
      />
    </svg>
  )
}
