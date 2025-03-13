import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  Info,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface School {
  id: string
  registeredName: string
  registrationNumber: string
  email: string
  principalName: string
  principalPhone: string
  institutionType: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  streetAddress: string
  city: string
  state: string
  district: string
  pincode: string
  phoneNumber: string
  planType: string
  planDuration: number
  userId: string
}

export default function PendingSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [search, setSearch] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [emailPreview, setEmailPreview] = useState({
    subject: '',
    body: '',
  })
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

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(
        (school) =>
          school.registeredName.toLowerCase().includes(search.toLowerCase()) ||
          school.registrationNumber
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          school.email.toLowerCase().includes(search.toLowerCase()) ||
          school.principalName.toLowerCase().includes(search.toLowerCase()) ||
          school.institutionType.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredSchools(filtered)
    }
  }, [search, schools])

  const fetchSchools = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      setIsLoading(true)
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
      setFilteredSchools(data)
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

  const handleApproval = async (schoolId: string, approved: boolean) => {
    const token = localStorage.getItem('adminToken')
    const status = approved ? 'APPROVED' : 'REJECTED'
    const school = schools.find((s) => s.id === schoolId)

    if (!school) {
      toast({
        title: 'Error',
        description: 'School not found',
        variant: 'destructive',
      })
      return
    }

    try {
      // Create email template
      const emailTemplate = {
        subject: approved
          ? 'Welcome to Present Sir - Your School Registration is Approved!'
          : 'Present Sir - School Registration Update',
        body: approved
          ? `
Dear ${school.principalName},

Great news! Your school registration for ${school.registeredName} has been approved.

You can now access your school management dashboard using the following credentials:

Email: ${school.email}
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
`.trim()
          : `
Dear ${school.principalName},

We regret to inform you that your school registration for ${
              school.registeredName
            } could not be approved at this time.

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

If you would like to discuss this further or submit a new application, please contact our support team at support@presentsir.com.

Best regards,
Present Sir Team
`.trim(),
      }

      // Call API to approve/reject
      const response = await fetch(`/api/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          emailTemplate,
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

      // Reset state
      setRejectionReason('')
      setRejectionDialogOpen(false)
      setShowEmailPreview(false)

      // Show success toast
      toast({
        title: 'Success',
        description: approved
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

  const showEmailTemplate = (school: School, approved: boolean) => {
    const subject = approved
      ? 'Welcome to Present Sir - Your School Registration is Approved!'
      : 'Present Sir - School Registration Update'

    const body = approved
      ? `
Dear ${school.principalName},

Great news! Your school registration for ${school.registeredName} has been approved.

You can now access your school management dashboard using the following credentials:

Email: ${school.email}
Password: [GENERATED PASSWORD]

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
`.trim()
      : `
Dear ${school.principalName},

We regret to inform you that your school registration for ${
          school.registeredName
        } could not be approved at this time.

${
  rejectionReason
    ? `Reason: ${rejectionReason}`
    : 'No specific reason provided.'
}

If you would like to discuss this further or submit a new application, please contact our support team at support@presentsir.com.

Best regards,
Present Sir Team
`.trim()

    setEmailPreview({ subject, body })
    setShowEmailPreview(true)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <p className="text-lg">Loading schools...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pending School Approvals</h1>
            <p className="text-muted-foreground">
              Review and approve new school registrations
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                className="w-[250px] pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchSchools()}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filteredSchools.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Building className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No Pending Schools</p>
              <p className="text-muted-foreground text-center max-w-md">
                {search
                  ? 'No schools match your search criteria'
                  : 'All schools have been reviewed. Check back later for new registrations.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Pending Schools ({filteredSchools.length})
                </CardTitle>
                <Badge variant="outline" className="flex items-center">
                  <Filter className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
              <CardDescription>
                Schools waiting for your review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                          {school.registeredName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {school.institutionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{school.principalName}</span>
                            <span className="text-muted-foreground text-xs">
                              {school.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {school.city}, {school.state}
                        </TableCell>
                        <TableCell>
                          {new Date(school.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              school.planType === 'PRO'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {school.planType}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({school.planDuration} mo)
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedSchool(school)}
                                >
                                  <Info className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl flex items-center">
                                    <Building className="h-5 w-5 mr-2" />
                                    {school.registeredName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Registration details for approval review
                                  </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="details" className="mt-4">
                                  <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="details">
                                      School Details
                                    </TabsTrigger>
                                    <TabsTrigger value="contact">
                                      Contact Information
                                    </TabsTrigger>
                                    <TabsTrigger value="plan">
                                      Plan & Payment
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="details"
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Building className="h-4 w-4 mr-1" />
                                          Institution Type
                                        </p>
                                        <p className="text-sm">
                                          {school.institutionType}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Hash className="h-4 w-4 mr-1" />
                                          Registration Number
                                        </p>
                                        <p className="text-sm">
                                          {school.registrationNumber}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          Registration Date
                                        </p>
                                        <p className="text-sm">
                                          {new Date(
                                            school.createdAt
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <MapPin className="h-4 w-4 mr-1" />
                                          Location
                                        </p>
                                        <p className="text-sm">
                                          {school.city}, {school.state}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">
                                        Full Address
                                      </p>
                                      <p className="text-sm">
                                        {school.streetAddress}, {school.city},{' '}
                                        {school.district}, {school.state},{' '}
                                        {school.pincode}
                                      </p>
                                    </div>
                                  </TabsContent>

                                  <TabsContent
                                    value="contact"
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <User className="h-4 w-4 mr-1" />
                                          Principal Name
                                        </p>
                                        <p className="text-sm">
                                          {school.principalName}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Phone className="h-4 w-4 mr-1" />
                                          Principal Phone
                                        </p>
                                        <p className="text-sm">
                                          {school.principalPhone}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Mail className="h-4 w-4 mr-1" />
                                          Email Address
                                        </p>
                                        <p className="text-sm">
                                          {school.email}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center">
                                          <Phone className="h-4 w-4 mr-1" />
                                          School Phone
                                        </p>
                                        <p className="text-sm">
                                          {school.phoneNumber}
                                        </p>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent
                                    value="plan"
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                          Plan Type
                                        </p>
                                        <Badge>{school.planType}</Badge>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                          Duration
                                        </p>
                                        <p className="text-sm">
                                          {school.planDuration} months
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                          Payment Status
                                        </p>
                                        <Badge variant="secondary">Paid</Badge>
                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>

                                <DialogFooter className="mt-4 space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      showEmailTemplate(school, true)
                                    }
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Preview Approval Email
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      handleApproval(school.id, true)
                                      setSelectedSchool(null)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve School
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedSchool(school)
                                      setRejectionDialogOpen(true)
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              onClick={() => handleApproval(school.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedSchool(school)
                                setRejectionDialogOpen(true)
                              }}
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSchools.length} of {schools.length} pending
                schools
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Rejection Dialog */}
      {selectedSchool && (
        <Dialog
          open={rejectionDialogOpen}
          onOpenChange={setRejectionDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject School Registration</DialogTitle>
              <DialogDescription>
                Provide a reason why this registration is being rejected
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-medium">
                  You are rejecting {selectedSchool.registeredName}
                </p>
              </div>
              <Textarea
                placeholder="Reason for rejection (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="text-sm text-muted-foreground">
                This reason will be included in the notification email sent to
                the school.
              </div>
            </div>
            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => showEmailTemplate(selectedSchool, false)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Preview Email
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setRejectionDialogOpen(false)
                  setRejectionReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleApproval(selectedSchool.id, false)}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This email will be sent to the school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Subject:</p>
              <p className="text-sm border p-2 rounded-md bg-muted">
                {emailPreview.subject}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Body:</p>
              <div className="text-sm border p-3 rounded-md bg-muted whitespace-pre-line h-[300px] overflow-y-auto">
                {emailPreview.body}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEmailPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
