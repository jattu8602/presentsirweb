import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface School {
  id: string
  registeredName: string
  registrationNumber: string
  email: string
  principalName: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

interface Analytics {
  totalSchools: number
  pendingApprovals: number
  totalTeachers: number
  totalStudents: number
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [schools, setSchools] = useState<School[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSchools: 0,
    pendingApprovals: 0,
    totalTeachers: 0,
    totalStudents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setLocation('/auth')
      return
    }

    fetchData()
  }, [user, setLocation])

  const fetchData = async () => {
    try {
      const [schoolsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/schools'),
        fetch('/api/admin/analytics'),
      ])

      if (!schoolsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const schoolsData = await schoolsRes.json()
      const analyticsData = await analyticsRes.json()

      setSchools(schoolsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
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
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update school status')
      }

      // Update local state
      setSchools((prevSchools) =>
        prevSchools.map((school) =>
          school.id === schoolId
            ? { ...school, approvalStatus: status }
            : school
        )
      )

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalSchools:
          status === 'APPROVED' ? prev.totalSchools + 1 : prev.totalSchools,
      }))

      toast({
        title: 'Success',
        description: `School ${status.toLowerCase()} successfully`,
      })
    } catch (error) {
      console.error('Error updating school status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update school status',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.pendingApprovals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Registrations</CardTitle>
          <CardDescription>
            Manage and approve school registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Registration Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
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
                  <TableCell>{school.email}</TableCell>
                  <TableCell>{school.principalName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        school.approvalStatus === 'APPROVED'
                          ? 'secondary'
                          : school.approvalStatus === 'REJECTED'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {school.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(school.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {school.approvalStatus === 'PENDING' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                          onClick={() => handleApproval(school.id, 'APPROVED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                          onClick={() => handleApproval(school.id, 'REJECTED')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
