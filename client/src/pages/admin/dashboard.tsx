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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface School {
  id: string
  registeredName: string
  registrationNumber: string
  email: string
  principalName: string
  phoneNumber: string
  institutionType: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

interface RejectionDialogProps {
  school: School | null
  isOpen: boolean
  onClose: () => void
  onReject: (schoolId: string, reason: string) => void
}

function RejectionDialog({
  school,
  isOpen,
  onClose,
  onReject,
}: RejectionDialogProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (school && reason.trim()) {
      onReject(school.id, reason.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject School Registration</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting {school?.registeredName}'s
            registration
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
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

      // Fetch schools with proper error handling for BigInt
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

      // Convert any BigInt values to strings if necessary
      const processedSchools = schoolsData.map((school: any) => ({
        ...school,
        id: String(school.id), // Convert BigInt to string if needed
        createdAt: new Date(school.createdAt).toISOString(),
      }))

      setSchools(processedSchools)

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
          totalSchools: Number(analyticsData.totalSchools) || 0,
          pendingSchools: Number(analyticsData.pendingSchools) || 0,
          approvedSchools: Number(analyticsData.approvedSchools) || 0,
          totalStudents: Number(analyticsData.totalStudents) || 0,
          totalTeachers: Number(analyticsData.totalTeachers) || 0,
          revenueThisMonth: 15800, // Placeholder for demo
          activePlan: {
            basic: Math.floor(Number(analyticsData.approvedSchools) * 0.7) || 0,
            pro: Math.floor(Number(analyticsData.approvedSchools) * 0.3) || 0,
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
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
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
          rejectionReason,
          emailTemplate:
            status === 'APPROVED'
              ? {
                  subject:
                    'Welcome to Present Sir - Your School Registration is Approved!',
                  body: `
Dear {{principalName}},

Great news! Your school registration for {{schoolName}} has been approved.

You can now access your school management dashboard using your registered email address.
For enhanced security, we recommend using Google Authentication to sign in.

Getting Started:
1. Visit: http://localhost:5173/auth
2. Log in with your email or use Google Sign-In
3. Complete your school profile and start managing your institution

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

Reason: {{rejectionReason}}

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

  const handleReject = (school: School) => {
    setSelectedSchool(school)
    setShowRejectionDialog(true)
  }

  const handleRejectionSubmit = (schoolId: string, reason: string) => {
    handleApproval(schoolId, 'REJECTED', reason)
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage school registrations and monitor system analytics
            </p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Schools
              </CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingSchools} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Across all institutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Teachers
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Active faculty members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue This Month
              </CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.revenueThisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">↑ {stats.revenueTrend}</span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending School Approvals</CardTitle>
            <CardDescription>
              Review and manage new school registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <div className="text-center py-6">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Pending Approvals
                </h3>
                <p className="text-muted-foreground">
                  All school registration requests have been processed
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.registeredName}
                      </TableCell>
                      <TableCell>{school.registrationNumber}</TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {school.institutionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{school.email}</div>
                          <div className="text-muted-foreground">
                            {school.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            school.approvalStatus === 'PENDING'
                              ? 'outline'
                              : school.approvalStatus === 'APPROVED'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {school.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="h-8"
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
                            className="h-8"
                            onClick={() => handleReject(school)}
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
            )}
          </CardContent>
        </Card>
      </div>

      <RejectionDialog
        school={selectedSchool}
        isOpen={showRejectionDialog}
        onClose={() => {
          setShowRejectionDialog(false)
          setSelectedSchool(null)
        }}
        onReject={handleRejectionSubmit}
      />
    </AdminLayout>
  )
}
