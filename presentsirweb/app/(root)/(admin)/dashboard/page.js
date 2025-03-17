'use client'

import { useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState('week')

  const stats = [
    {
      name: 'Total Schools',
      value: '125',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Total Colleges',
      value: '58',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Total Tution Centers',
      value: '72',
      change: '+15%',
      changeType: 'increase',
    },
    {
      name: 'Active Users',
      value: '4,281',
      change: '+23%',
      changeType: 'increase',
    },
  ]

  const recentSchools = [
    {
      id: 1,
      name: 'ABC Public School',
      city: 'Delhi',
      students: 450,
      status: 'approved',
    },
    {
      id: 2,
      name: 'XYZ International School',
      city: 'Mumbai',
      students: 620,
      status: 'pending',
    },
    {
      id: 3,
      name: 'Sunshine Academy',
      city: 'Bangalore',
      students: 380,
      status: 'approved',
    },
    {
      id: 4,
      name: 'Modern High School',
      city: 'Chennai',
      students: 520,
      status: 'approved',
    },
    {
      id: 5,
      name: 'Green Valley School',
      city: 'Kolkata',
      students: 290,
      status: 'pending',
    },
  ]

  return (
    <DashboardLayout type="admin" activePath="/admin/dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.name}
                </h3>
                <div
                  className={`flex items-center text-sm ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <TrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Schools */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Institutions</h2>
            <a
              href="/admin/schools"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    City
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Students
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSchools.map((school) => (
                  <tr key={school.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {school.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{school.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {school.students}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          school.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
