import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

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
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.log('No admin token found, redirecting to login')
      setLocation('/admin/login')
      return
    }

    fetchSchools()
  }, [setLocation])

  const fetchSchools = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch('/api/schools/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.removeItem('adminToken')
          setLocation('/admin/login')
          return
        }
        throw new Error('Failed to fetch schools')
      }

      const data = await response.json()
      setSchools(data)
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to fetch schools',
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

      // Refresh the schools list
      fetchSchools()

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setLocation('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">School Registrations</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid gap-4">
          {schools.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No pending registrations
            </Card>
          ) : (
            schools.map((school) => (
              <Card key={school.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {school.registeredName}
                    </h2>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Registration Number: {school.registrationNumber}</p>
                      <p>Type: {school.institutionType}</p>
                      <p>Principal: {school.principalName}</p>
                      <p>Email: {school.email}</p>
                      <p>
                        Registered:{' '}
                        {new Date(school.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge
                      variant={
                        school.approvalStatus === 'PENDING'
                          ? 'default'
                          : school.approvalStatus === 'APPROVED'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {school.approvalStatus}
                    </Badge>
                    {school.approvalStatus === 'PENDING' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(school.id, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(school.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
