import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'wouter'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  Users,
  BookOpen,
  UserCheck,
  CreditCard,
} from 'lucide-react'

interface SchoolStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [, setLocation] = useLocation()

  // Always call this useEffect hook first
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth')
    }
  }, [user, authLoading, setLocation])

  // Fetch school status to check if approved
  const { data: schoolData, isLoading: statusLoading } = useQuery<SchoolStatus>(
    {
      queryKey: ['/api/schools/status'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/schools/status')
        return res.json()
      },
      enabled: !!user && ['SCHOOL', 'COACHING', 'COLLEGE'].includes(user.role),
      // Don't refetch too often
      refetchInterval: 60000, // Check every minute
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  )

  // If user is not authenticated yet, don't show anything during the redirect
  if (!user) {
    return null
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we load your dashboard
          </p>
        </div>
      </div>
    )
  }

  // Show pending approval state
  if (
    ['SCHOOL', 'COACHING', 'COLLEGE'].includes(user.role) &&
    !statusLoading &&
    schoolData?.status === 'PENDING'
  ) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Waiting for Admin Approval</CardTitle>
            <CardDescription>
              Your account is currently pending approval by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Once approved, you'll get full access to the dashboard and all
              features. You'll be notified via email when your account is
              approved. There's no need to keep checking this page - you can log
              in again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard content
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section: Quick Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-muted-foreground">+5 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Class 5 - 12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                All subjects covered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Fee Collection
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹24,000</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Section: Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for your school
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 justify-start items-center"
              onClick={() => setLocation('/dashboard/classes')}
            >
              <PlusCircle className="h-8 w-8" />
              <div className="text-sm font-medium">Add New Class</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 justify-start items-center"
              onClick={() => setLocation('/dashboard/attendance')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm font-medium">Take Attendance</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 justify-start items-center"
              onClick={() => setLocation('/dashboard/timetable')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-sm font-medium">Manage Timetable</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4 justify-start items-center"
              onClick={() => setLocation('/dashboard/fees')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <div className="text-sm font-medium">Collect Fees</div>
            </Button>
          </CardContent>
        </Card>

        {/* Section: Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions in your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  activity: 'Attendance marked for Class 10',
                  time: '10 minutes ago',
                  user: 'Amit Kumar',
                },
                {
                  activity: 'New timetable created for Class 8',
                  time: '2 hours ago',
                  user: 'Priya Sharma',
                },
                {
                  activity: 'Fee collected from 5 students',
                  time: 'Yesterday, 5:30 PM',
                  user: 'Raj Verma',
                },
                {
                  activity: 'New student added to Class 6',
                  time: 'Yesterday, 10:15 AM',
                  user: 'Neha Singh',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.activity}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        By {item.user}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
