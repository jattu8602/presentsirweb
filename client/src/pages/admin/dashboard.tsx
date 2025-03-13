import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  School,
  Users,
  GraduationCap,
  BadgeDollarSign,
  BarChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Building,
  FileCheck,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface School {
  id: string
  registeredName: string
  registrationNumber: string
  email: string
  principalName: string
  institutionType: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSchools: 0,
    pendingSchools: 0,
    approvedSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    revenueThisMonth: 0,
    revenueTrend: '8.2%',
    activePlan: {
      basic: 0,
      pro: 0,
    },
  })
  const [timeFilter, setTimeFilter] = useState('week')
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.log('No admin token found, redirecting to login')
      setLocation('/admin/login')
      return
    }

    fetchData()
  }, [setLocation])

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      setIsLoading(true)

      // Fetch schools
      const schoolsResponse = await fetch('/api/schools/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!schoolsResponse.ok) {
        if (schoolsResponse.status === 403) {
          localStorage.removeItem('adminToken')
          setLocation('/admin/login')
          return
        }
        throw new Error('Failed to fetch schools')
      }

      const schoolsData = await schoolsResponse.json()
      setSchools(schoolsData)

      // Fetch analytics data
      const analyticsResponse = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setStats({
          ...stats,
          totalSchools: analyticsData.totalSchools || 0,
          pendingSchools: analyticsData.pendingSchools || 0,
          approvedSchools: analyticsData.approvedSchools || 0,
          totalStudents: analyticsData.totalStudents || 0,
          totalTeachers: analyticsData.totalTeachers || 0,
          revenueThisMonth: 15800, // Placeholder for demo
          activePlan: {
            basic: Math.floor(analyticsData.approvedSchools * 0.7) || 0, // Example calculation
            pro: Math.floor(analyticsData.approvedSchools * 0.3) || 0,
          },
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to fetch data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (
    schoolId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch(`/api/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          emailTemplate:
            status === 'APPROVED'
              ? {
                  subject:
                    'Welcome to Present Sir - Your School Registration is Approved!',
                  body: `
Dear {{principalName}},

Great news! Your school registration for {{schoolName}} has been approved.

You can now access your school management dashboard using the following credentials:

Email: {{email}}
Password: {{password}}

For enhanced security, you can also log in using Google Authentication.

Getting Started:
1. Visit: http://localhost:5173/auth
2. Log in with your email and password or use Google Sign-In
3. We recommend changing your password after your first login

Your school dashboard provides access to:
- Attendance Management
- Student Records
- Fee Management
- Performance Analytics
- Communication Tools

If you need any assistance, our support team is here to help at support@presentsir.com.

Welcome to the Present Sir community!

Best regards,
Present Sir Team
            `.trim(),
                }
              : {
                  subject: 'Present Sir - School Registration Update',
                  body: `
Dear {{principalName}},

We regret to inform you that your school registration for {{schoolName}} could not be approved at this time.

If you would like to discuss this further or submit a new application, please contact our support team at support@presentsir.com.

Best regards,
Present Sir Team
            `.trim(),
                },
        }),
      })

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.removeItem('adminToken')
          setLocation('/admin/login')
          return
        }
        throw new Error('Failed to update school status')
      }

      // Refresh the data
      fetchData()

      toast({
        title: 'Success',
        description:
          status === 'APPROVED'
            ? 'School approved successfully. Welcome email sent!'
            : 'School rejected. Notification email sent.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update school status',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg">Loading dashboard data...</p>
        </div>
      </AdminLayout>
    )
  }

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      activity: 'New school registration',
      details: 'XYZ Public School has registered',
      time: '10 minutes ago',
      icon: Building,
    },
    {
      id: 2,
      activity: 'School approved',
      details: 'ABC International School was approved by admin',
      time: '1 hour ago',
      icon: CheckCircle2,
    },
    {
      id: 3,
      activity: 'Payment received',
      details: 'Royal Academy paid ₹12,500 for PRO plan',
      time: '3 hours ago',
      icon: BadgeDollarSign,
    },
    {
      id: 4,
      activity: 'Subscription renewed',
      details: 'Little Stars School renewed PRO plan for 12 months',
      time: 'Yesterday',
      icon: FileCheck,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Schools
              </CardTitle>
              <School className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="flex items-center text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5.2%
                </span>
                <span className="ml-1">from last {timeFilter}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="flex items-center text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5%
                </span>
                <span className="ml-1">from last {timeFilter}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Teachers
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="flex items-center text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +7.8%
                </span>
                <span className="ml-1">from last {timeFilter}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.revenueThisMonth.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="flex items-center text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stats.revenueTrend}
                </span>
                <span className="ml-1">from last {timeFilter}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>School Registrations</CardTitle>
              <CardDescription>Registration trend over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex items-center justify-center h-full border border-dashed rounded-md">
                <div className="text-center">
                  <BarChart className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-muted-foreground">Registration Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schools by Plan</CardTitle>
              <CardDescription>Distribution of active plans</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Basic Plan</div>
                      <div className="text-sm font-medium">
                        {stats.activePlan.basic} schools
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 w-full">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.activePlan.basic /
                              (stats.activePlan.basic + stats.activePlan.pro)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Pro Plan</div>
                      <div className="text-sm font-medium">
                        {stats.activePlan.pro} schools
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 w-full">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.activePlan.pro /
                              (stats.activePlan.basic + stats.activePlan.pro)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Approval Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                      <div className="text-2xl font-bold">
                        {stats.pendingSchools}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                      <div className="text-2xl font-bold">
                        {stats.approvedSchools}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Approved
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending approvals and activities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Schools waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No pending schools to approve
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools.slice(0, 5).map((school) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">
                            {school.registeredName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {school.institutionType}
                            </Badge>
                          </TableCell>
                          <TableCell>{school.principalName}</TableCell>
                          <TableCell>
                            {new Date(school.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleApproval(school.id, 'APPROVED')
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleApproval(school.id, 'REJECTED')
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {schools.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/admin/schools/pending')}
                  >
                    View All Pending Schools
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                      <activity.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
