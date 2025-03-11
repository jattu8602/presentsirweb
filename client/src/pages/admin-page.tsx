import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Users,
  School,
  GraduationCap,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { apiRequest } from '@/lib/queryClient'
import { useLocation } from 'wouter'

export default function AdminPage() {
  const { toast } = useToast()
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setLocation('/auth')
    }
  }, [user, setLocation])

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/stats')
      return res.json()
    },
  })

  const { data: pendingSchools } = useQuery({
    queryKey: ['/api/admin/schools/pending'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/schools/pending')
      return res.json()
    },
  })

  const approveSchoolMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      message,
    }: {
      id: number
      status: 'APPROVED' | 'REJECTED'
      message?: string
    }) => {
      const res = await apiRequest('POST', `/api/admin/schools/${id}/approve`, {
        status,
        message,
      })
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'School status updated successfully',
      })
      setSelectedSchool(null)
      setRejectionMessage('')
    },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.schools ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingSchools ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teachers ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending School Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Registration Number</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSchools?.map((school: any) => (
                <TableRow key={school.id}>
                  <TableCell>{school.registeredName}</TableCell>
                  <TableCell>{school.registrationNumber}</TableCell>
                  <TableCell>{school.principalName}</TableCell>
                  <TableCell>
                    <div>{school.email}</div>
                    <div>{school.phoneNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          approveSchoolMutation.mutate({
                            id: school.id,
                            status: 'APPROVED',
                          })
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedSchool(school)}
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
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedSchool}
        onOpenChange={() => setSelectedSchool(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject School Registration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Please provide a reason for rejection:</p>
            <Input
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              placeholder="Enter rejection reason..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSchool(null)
                setRejectionMessage('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectionMessage) {
                  toast({
                    title: 'Error',
                    description: 'Please provide a rejection reason',
                    variant: 'destructive',
                  })
                  return
                }
                approveSchoolMutation.mutate({
                  id: selectedSchool.id,
                  status: 'REJECTED',
                  message: rejectionMessage,
                })
              }}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
