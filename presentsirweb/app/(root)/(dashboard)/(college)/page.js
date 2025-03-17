export default function CollegeDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          College Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dashboard Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            <p className="text-gray-600 mb-4">Manage your college students</p>
            <div className="text-3xl font-bold text-blue-600">0</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Teachers</h2>
            <p className="text-gray-600 mb-4">Manage your college faculty</p>
            <div className="text-3xl font-bold text-green-600">0</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Departments</h2>
            <p className="text-gray-600 mb-4">Manage college departments</p>
            <div className="text-3xl font-bold text-purple-600">0</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Courses</h2>
            <p className="text-gray-600 mb-4">Manage college courses</p>
            <div className="text-3xl font-bold text-amber-600">0</div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Activities</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">No recent activities to display.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
