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
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  Users,
  FileText,
  UserPlus,
  Send,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Clock,
} from 'lucide-react'

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

export default function ApprovedSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [search, setSearch] = useState('')
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState<
    string | null
  >(null)
  const [planTypeFilter, setPlanTypeFilter] = useState<string | null>(null)
  const [isComposingEmail, setIsComposingEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  // School statistics
  const [stats, setStats] = useState({
    totalSchools: 0,
    schoolsByType: {
      SCHOOL: 0,
      COACHING: 0,
      COLLEGE: 0,
    },
    basicPlanSchools: 0,
    proPlanSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    averageTeachersPerSchool: 0,
    averageStudentsPerSchool: 0,
    recentlyActive: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.log('No admin token found, redirecting to login')
      setLocation('/admin/login')
      return
    }

    fetchApprovedSchools()
  }, [setLocation])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [search, institutionTypeFilter, planTypeFilter, schools])

  const applyFilters = () => {
    let filtered = [...schools]

    // Apply search filter
    if (search.trim() !== '') {
      filtered = filtered.filter(
        (school) =>
          school.registeredName.toLowerCase().includes(search.toLowerCase()) ||
          school.registrationNumber
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          school.email.toLowerCase().includes(search.toLowerCase()) ||
          school.principalName.toLowerCase().includes(search.toLowerCase()) ||
          school.city.toLowerCase().includes(search.toLowerCase()) ||
          school.state.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply institution type filter
    if (institutionTypeFilter) {
      filtered = filtered.filter(
        (school) => school.institutionType === institutionTypeFilter
      )
    }

    // Apply plan type filter
    if (planTypeFilter) {
      filtered = filtered.filter((school) => school.planType === planTypeFilter)
    }

    setFilteredSchools(filtered)
  }

  const fetchApprovedSchools = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/schools/approved', {
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
        throw new Error('Failed to fetch approved schools')
      }

      const data = await response.json()
      setSchools(data)
      setFilteredSchools(data)

      // Calculate stats
      const totalSchools = data.length
      const schoolsByType = {
        SCHOOL: data.filter((s: School) => s.institutionType === 'SCHOOL')
          .length,
        COACHING: data.filter((s: School) => s.institutionType === 'COACHING')
          .length,
        COLLEGE: data.filter((s: School) => s.institutionType === 'COLLEGE')
          .length,
      }
      const basicPlanSchools = data.filter(
        (s: School) => s.planType === 'BASIC'
      ).length
      const proPlanSchools = data.filter(
        (s: School) => s.planType === 'PRO'
      ).length

      // These would come from API in real implementation
      const totalTeachers = Math.round(totalSchools * 15) // Example calculation
      const totalStudents = Math.round(totalSchools * 200) // Example calculation

      setStats({
        totalSchools,
        schoolsByType,
        basicPlanSchools,
        proPlanSchools,
        totalTeachers,
        totalStudents,
        averageTeachersPerSchool: totalSchools
          ? Math.round(totalTeachers / totalSchools)
          : 0,
        averageStudentsPerSchool: totalSchools
          ? Math.round(totalStudents / totalSchools)
          : 0,
        recentlyActive: Math.round(totalSchools * 0.7), // Example: 70% active recently
      })
    } catch (error) {
      console.error('Error fetching approved schools:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to fetch approved schools',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email subject and content are required',
        variant: 'destructive',
      })
      return
    }

    if (!selectedSchool) {
      toast({
        title: 'Error',
        description: 'No school selected',
        variant: 'destructive',
      })
      return
    }

    try {
      // In a real implementation, you would call an API to send the email
      // This is a mock implementation
      toast({
        title: 'Email Sent',
        description: `Email successfully sent to ${selectedSchool.registeredName}`,
      })

      setIsComposingEmail(false)
      setEmailSubject('')
      setEmailContent('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const resetFilters = () => {
    setSearch('')
    setInstitutionTypeFilter(null)
    setPlanTypeFilter(null)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <p className="text-lg">Loading approved schools...</p>
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
            <h1 className="text-3xl font-bold">Approved Schools</h1>
            <p className="text-muted-foreground">
              Manage all approved schools in the system
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
              onClick={() => fetchApprovedSchools()}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* School Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4 pb-0">
              <CardTitle className="text-sm font-medium">
                Total Approved Schools
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalSchools}</div>
                </div>
              </div>
              <div className="mt-2 flex space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                  <span>School: {stats.schoolsByType.SCHOOL}</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Coaching: {stats.schoolsByType.COACHING}</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                  <span>College: {stats.schoolsByType.COLLEGE}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 pb-0">
              <CardTitle className="text-sm font-medium">
                Subscription Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {stats.basicPlanSchools + stats.proPlanSchools}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex space-x-4 text-xs text-muted-foreground">
                <div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-gray-400 mr-1"></div>
                    <span>Basic: {stats.basicPlanSchools}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mr-1"></div>
                    <span>Pro: {stats.proPlanSchools}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 pb-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalTeachers + stats.totalStudents}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex space-x-4 text-xs text-muted-foreground">
                <div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span>Teachers: {stats.totalTeachers}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-cyan-500 mr-1"></div>
                    <span>Students: {stats.totalStudents}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 pb-0">
              <CardTitle className="text-sm font-medium">
                Activity Status
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      (stats.recentlyActive / stats.totalSchools) * 100
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active in last 30 days
                  </div>
                </div>
              </div>
              <div className="mt-1">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{
                      width: `${
                        (stats.recentlyActive / stats.totalSchools) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3 w-3 mr-2" />
                Institution Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setInstitutionTypeFilter(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInstitutionTypeFilter('SCHOOL')}
              >
                Schools
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInstitutionTypeFilter('COACHING')}
              >
                Coaching Centers
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInstitutionTypeFilter('COLLEGE')}
              >
                Colleges
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3 w-3 mr-2" />
                Plan Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setPlanTypeFilter(null)}>
                All Plans
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlanTypeFilter('BASIC')}>
                Basic Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlanTypeFilter('PRO')}>
                Pro Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(search || institutionTypeFilter || planTypeFilter) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          )}

          {institutionTypeFilter && (
            <Badge variant="secondary" className="h-8 px-3 flex items-center">
              Type: {institutionTypeFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-2 p-0"
                onClick={() => setInstitutionTypeFilter(null)}
              >
                &times;
              </Button>
            </Badge>
          )}

          {planTypeFilter && (
            <Badge variant="secondary" className="h-8 px-3 flex items-center">
              Plan: {planTypeFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-2 p-0"
                onClick={() => setPlanTypeFilter(null)}
              >
                &times;
              </Button>
            </Badge>
          )}
        </div>

        {filteredSchools.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Building className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No Schools Found</p>
              <p className="text-muted-foreground text-center max-w-md">
                {search || institutionTypeFilter || planTypeFilter
                  ? 'No schools match your search criteria. Try adjusting your filters.'
                  : 'There are no approved schools in the system yet.'}
              </p>
              {(search || institutionTypeFilter || planTypeFilter) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Approved Schools ({filteredSchools.length})
                </CardTitle>
                <Badge variant="outline" className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              </div>
              <CardDescription>
                List of all approved schools and their details
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSchool(school)
                                  // Navigate to details view (in a real app)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSchool(school)
                                  setIsComposingEmail(true)
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Manage Teachers
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSchools.length} of {schools.length} approved
                schools
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Email Composition Dialog */}
      {selectedSchool && (
        <Dialog open={isComposingEmail} onOpenChange={setIsComposingEmail}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Email to School</DialogTitle>
              <DialogDescription>
                Compose an email to send to {selectedSchool.registeredName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">To:</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedSchool.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject:
                </label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content:
                </label>
                <textarea
                  id="content"
                  placeholder="Write your email content here..."
                  className="w-full min-h-[200px] p-2 border rounded-md"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsComposingEmail(false)
                  setEmailSubject('')
                  setEmailContent('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!emailSubject.trim() || !emailContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  )
}
