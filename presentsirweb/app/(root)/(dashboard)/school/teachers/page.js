'use client'

import { useState } from 'react'
import { DashboardLayout } from '../../../../../components/layout/dashboard-layout'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu'

// Mock data for teachers
const mockTeachers = [
  {
    id: 'teacher1',
    name: 'Dr. Rajendra Kumar',
    employeeId: 'T001',
    gender: 'Male',
    qualification: 'Ph.D in Physics',
    subjects: ['Physics', 'Mathematics'],
    joiningDate: '2015-06-12',
    email: 'rajendra.kumar@example.com',
    phone: '+91 9876543210',
    address: '123 Green Park, New Delhi',
    status: 'active',
    classes: ['Class 10-A', 'Class 10-B', 'Class 9-A'],
    salary: 65000,
    attendance: {
      present: 22,
      absent: 2,
      leave: 1,
      total: 25,
    },
  },
  {
    id: 'teacher2',
    name: 'Mrs. Sunita Sharma',
    employeeId: 'T002',
    gender: 'Female',
    qualification: 'M.A. in English Literature',
    subjects: ['English', 'Hindi'],
    joiningDate: '2017-04-15',
    email: 'sunita.sharma@example.com',
    phone: '+91 9876543211',
    address: '456 Rose Avenue, Mumbai',
    status: 'active',
    classes: ['Class 9-A', 'Class 9-B', 'Class 8-C'],
    salary: 58000,
    attendance: {
      present: 24,
      absent: 0,
      leave: 1,
      total: 25,
    },
  },
  {
    id: 'teacher3',
    name: 'Mr. Vikram Mehta',
    employeeId: 'T003',
    gender: 'Male',
    qualification: 'M.Sc. in Chemistry',
    subjects: ['Chemistry', 'Biology'],
    joiningDate: '2018-07-10',
    email: 'vikram.mehta@example.com',
    phone: '+91 9876543212',
    address: '789 Lake View, Bangalore',
    status: 'active',
    classes: ['Class 10-A', 'Class 10-B'],
    salary: 60000,
    attendance: {
      present: 20,
      absent: 3,
      leave: 2,
      total: 25,
    },
  },
  {
    id: 'teacher4',
    name: 'Mrs. Priya Reddy',
    employeeId: 'T004',
    gender: 'Female',
    qualification: 'M.A. in History',
    subjects: ['History', 'Civics'],
    joiningDate: '2019-01-05',
    email: 'priya.reddy@example.com',
    phone: '+91 9876543213',
    address: '234 Mountain View, Hyderabad',
    status: 'inactive',
    classes: ['Class 9-A', 'Class 8-C'],
    salary: 55000,
    attendance: {
      present: 18,
      absent: 7,
      leave: 0,
      total: 25,
    },
  },
  {
    id: 'teacher5',
    name: 'Mr. Amit Singh',
    employeeId: 'T005',
    gender: 'Male',
    qualification: 'M.Sc. in Mathematics',
    subjects: ['Mathematics'],
    joiningDate: '2016-08-22',
    email: 'amit.singh@example.com',
    phone: '+91 9876543214',
    address: '567 Seaview Road, Chennai',
    status: 'active',
    classes: ['Class 10-A', 'Class 9-B', 'Class 8-C'],
    salary: 62000,
    attendance: {
      present: 23,
      absent: 1,
      leave: 1,
      total: 25,
    },
  },
]

// Form schema for adding/editing teachers
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  employeeId: z.string().min(1, { message: 'Employee ID is required.' }),
  gender: z.string().min(1, { message: 'Please select a gender.' }),
  qualification: z.string().min(2, { message: 'Qualification is required.' }),
  subjects: z
    .string()
    .min(1, { message: 'Please enter at least one subject.' }),
  joiningDate: z.string().min(1, { message: 'Joining date is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters.' }),
  classes: z.string().min(1, { message: 'Please enter at least one class.' }),
  salary: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: 'Salary must be a valid number.',
    }),
  status: z.string().min(1, { message: 'Please select a status.' }),
})

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Set up form with validation
  const form = useForm({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      employeeId: '',
      gender: '',
      qualification: '',
      subjects: '',
      joiningDate: '',
      email: '',
      phone: '',
      address: '',
      classes: '',
      salary: '',
      status: 'active',
    },
  })

  // Filter teachers based on search term, subject, and status
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = selectedSubject
      ? teacher.subjects.includes(selectedSubject)
      : true
    const matchesStatus = selectedStatus
      ? teacher.status === selectedStatus
      : true

    // Filter by active tab
    if (activeTab === 'all')
      return matchesSearch && matchesSubject && matchesStatus
    if (activeTab === 'active')
      return teacher.status === 'active' && matchesSearch && matchesSubject
    if (activeTab === 'inactive')
      return teacher.status === 'inactive' && matchesSearch && matchesSubject

    return matchesSearch && matchesSubject && matchesStatus
  })

  // All unique subjects
  const subjects = [...new Set(teachers.flatMap((teacher) => teacher.subjects))]

  // Handle adding a new teacher
  const handleAddTeacher = () => {
    setSelectedTeacher(null)
    form.reset({
      name: '',
      employeeId: '',
      gender: '',
      qualification: '',
      subjects: '',
      joiningDate: '',
      email: '',
      phone: '',
      address: '',
      classes: '',
      salary: '',
      status: 'active',
    })
    setOpenDialog(true)
  }

  // Handle editing an existing teacher
  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    form.reset({
      name: teacher.name,
      employeeId: teacher.employeeId,
      gender: teacher.gender,
      qualification: teacher.qualification,
      subjects: teacher.subjects.join(', '),
      joiningDate: teacher.joiningDate,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      classes: teacher.classes.join(', '),
      salary: teacher.salary.toString(),
      status: teacher.status,
    })
    setOpenDialog(true)
  }

  // Handle form submission
  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      subjects: data.subjects.split(',').map((s) => s.trim()),
      classes: data.classes.split(',').map((c) => c.trim()),
      salary: parseInt(data.salary),
    }

    if (selectedTeacher) {
      // Update existing teacher
      const updatedTeachers = teachers.map((teacher) =>
        teacher.id === selectedTeacher.id
          ? {
              ...teacher,
              ...formattedData,
            }
          : teacher
      )
      setTeachers(updatedTeachers)
    } else {
      // Add new teacher
      const newTeacher = {
        id: `teacher${teachers.length + 1}`,
        ...formattedData,
        attendance: {
          present: 0,
          absent: 0,
          leave: 0,
          total: 0,
        },
      }
      setTeachers([...teachers, newTeacher])
    }
    setOpenDialog(false)
  }

  // Teacher List Content Component
  const TeacherListContent = () => {
    return (
      <>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by name, ID or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          {filteredTeachers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {teacher.employeeId}
                    </TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.subjects.join(', ')}</TableCell>
                    <TableCell>{teacher.classes.join(', ')}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.status.charAt(0).toUpperCase() +
                          teacher.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (teacher.attendance.present /
                                  teacher.attendance.total) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">
                          {Math.round(
                            (teacher.attendance.present /
                              teacher.attendance.total) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Schedule</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">
                No teachers found matching your criteria.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-md border p-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teachers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active: {teachers.filter((t) => t.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    teachers.reduce(
                      (acc, t) =>
                        acc + (t.attendance.present / t.attendance.total) * 100,
                      0
                    ) / teachers.length
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Subjects Taught
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all classes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Salary Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {teachers
                    .reduce((acc, t) => acc + t.salary, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Per month</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <DashboardLayout type="school" activePath="/school/teachers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Management</h1>
          <Button onClick={handleAddTeacher}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Teacher
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-[300px]">
            <TabsTrigger value="all">All Teachers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <TeacherListContent />
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <TeacherListContent />
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <TeacherListContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </DialogTitle>
            <DialogDescription>
              {selectedTeacher
                ? 'Update teacher information'
                : 'Enter details for the new teacher'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter teacher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter employee ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter qualification" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter subjects (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter classes (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter salary amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedTeacher ? 'Update Teacher' : 'Add Teacher'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
