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
  DialogTrigger,
} from '../../../../../components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../components/ui/tabs'

// Mock data for students
const mockStudents = [
  {
    id: 'student1',
    rollNumber: 1001,
    name: 'Aarav Sharma',
    class: 'Class 10-A',
    gender: 'Male',
    dob: '2005-04-12',
    parentName: 'Rajesh Sharma',
    contactNumber: '+91 9876543210',
    email: 'rajesh.sharma@example.com',
    address: '123 Park Street, New Delhi',
    status: 'active',
    fees: {
      total: 55000,
      paid: 40000,
      due: 15000,
      dueDate: '2023-10-15',
    },
    attendance: {
      present: 85,
      absent: 10,
      late: 5,
    },
  },
  {
    id: 'student2',
    rollNumber: 1002,
    name: 'Diya Patel',
    class: 'Class 10-A',
    gender: 'Female',
    dob: '2004-08-23',
    parentName: 'Amit Patel',
    contactNumber: '+91 9876543211',
    email: 'amit.patel@example.com',
    address: '456 Lake View, Mumbai',
    status: 'active',
    fees: {
      total: 55000,
      paid: 55000,
      due: 0,
      dueDate: null,
    },
    attendance: {
      present: 95,
      absent: 3,
      late: 2,
    },
  },
  {
    id: 'student3',
    rollNumber: 1003,
    name: 'Vihaan Singh',
    class: 'Class 10-B',
    gender: 'Male',
    dob: '2005-02-08',
    parentName: 'Gurpreet Singh',
    contactNumber: '+91 9876543212',
    email: 'gurpreet.singh@example.com',
    address: '789 Green Park, Chandigarh',
    status: 'active',
    fees: {
      total: 55000,
      paid: 35000,
      due: 20000,
      dueDate: '2023-09-30',
    },
    attendance: {
      present: 78,
      absent: 15,
      late: 7,
    },
  },
  {
    id: 'student4',
    rollNumber: 1004,
    name: 'Ananya Gupta',
    class: 'Class 9-B',
    gender: 'Female',
    dob: '2006-11-17',
    parentName: 'Vikram Gupta',
    contactNumber: '+91 9876543213',
    email: 'vikram.gupta@example.com',
    address: '234 River Road, Kolkata',
    status: 'inactive',
    fees: {
      total: 50000,
      paid: 25000,
      due: 25000,
      dueDate: '2023-08-30',
    },
    attendance: {
      present: 65,
      absent: 30,
      late: 5,
    },
  },
  {
    id: 'student5',
    rollNumber: 1005,
    name: 'Reyansh Kumar',
    class: 'Class 9-A',
    gender: 'Male',
    dob: '2006-05-29',
    parentName: 'Manoj Kumar',
    contactNumber: '+91 9876543214',
    email: 'manoj.kumar@example.com',
    address: '567 Hill View, Bangalore',
    status: 'active',
    fees: {
      total: 50000,
      paid: 50000,
      due: 0,
      dueDate: null,
    },
    attendance: {
      present: 90,
      absent: 5,
      late: 5,
    },
  },
  {
    id: 'student6',
    rollNumber: 1006,
    name: 'Aanya Reddy',
    class: 'Class 9-A',
    gender: 'Female',
    dob: '2006-03-14',
    parentName: 'Surya Reddy',
    contactNumber: '+91 9876543215',
    email: 'surya.reddy@example.com',
    address: '890 Temple Street, Hyderabad',
    status: 'active',
    fees: {
      total: 50000,
      paid: 40000,
      due: 10000,
      dueDate: '2023-11-10',
    },
    attendance: {
      present: 88,
      absent: 7,
      late: 5,
    },
  },
  {
    id: 'student7',
    rollNumber: 1007,
    name: 'Vivaan Joshi',
    class: 'Class 8-C',
    gender: 'Male',
    dob: '2007-09-08',
    parentName: 'Prakash Joshi',
    contactNumber: '+91 9876543216',
    email: 'prakash.joshi@example.com',
    address: '123 Valley Road, Pune',
    status: 'active',
    fees: {
      total: 45000,
      paid: 30000,
      due: 15000,
      dueDate: '2023-10-20',
    },
    attendance: {
      present: 75,
      absent: 20,
      late: 5,
    },
  },
]

// Form schema for adding/editing students
const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  rollNumber: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: 'Roll number must be a valid number.',
    }),
  class: z.string().min(1, { message: 'Please select a class.' }),
  gender: z.string().min(1, { message: 'Please select a gender.' }),
  dob: z.string().min(1, { message: 'Please enter a date of birth.' }),
  parentName: z
    .string()
    .min(2, { message: 'Parent name must be at least 2 characters.' }),
  contactNumber: z
    .string()
    .min(10, { message: 'Please enter a valid contact number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters.' }),
  status: z.string().min(1, { message: 'Please select a status.' }),
})

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Set up form with validation
  const form = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      rollNumber: '',
      class: '',
      gender: '',
      dob: '',
      parentName: '',
      contactNumber: '',
      email: '',
      address: '',
      status: 'active',
    },
  })

  // Filter students based on search term, class, and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toString().includes(searchTerm) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass = selectedClass ? student.class === selectedClass : true
    const matchesStatus = selectedStatus
      ? student.status === selectedStatus
      : true

    // Filter by active tab
    if (activeTab === 'all')
      return matchesSearch && matchesClass && matchesStatus
    if (activeTab === 'active')
      return student.status === 'active' && matchesSearch && matchesClass
    if (activeTab === 'inactive')
      return student.status === 'inactive' && matchesSearch && matchesClass
    if (activeTab === 'due')
      return (
        student.fees.due > 0 && matchesSearch && matchesClass && matchesStatus
      )

    return matchesSearch && matchesClass && matchesStatus
  })

  // Handle adding a new student
  const handleAddStudent = () => {
    setSelectedStudent(null)
    form.reset({
      name: '',
      rollNumber: '',
      class: '',
      gender: '',
      dob: '',
      parentName: '',
      contactNumber: '',
      email: '',
      address: '',
      status: 'active',
    })
    setOpenDialog(true)
  }

  // Handle editing an existing student
  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    form.reset({
      name: student.name,
      rollNumber: student.rollNumber.toString(),
      class: student.class,
      gender: student.gender,
      dob: student.dob,
      parentName: student.parentName,
      contactNumber: student.contactNumber,
      email: student.email,
      address: student.address,
      status: student.status,
    })
    setOpenDialog(true)
  }

  // Handle form submission
  const onSubmit = (data) => {
    if (selectedStudent) {
      // Update existing student
      const updatedStudents = students.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              ...data,
              rollNumber: parseInt(data.rollNumber),
            }
          : student
      )
      setStudents(updatedStudents)
    } else {
      // Add new student
      const newStudent = {
        id: `student${students.length + 1}`,
        ...data,
        rollNumber: parseInt(data.rollNumber),
        fees: {
          total: 50000,
          paid: 0,
          due: 50000,
          dueDate: '2023-12-31',
        },
        attendance: {
          present: 0,
          absent: 0,
          late: 0,
        },
      }
      setStudents([...students, newStudent])
    }
    setOpenDialog(false)
  }

  // Unique classes from students
  const classes = [...new Set(students.map((student) => student.class))]

  // Student List Content Component
  const StudentListContent = () => {
    return (
      <>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by name, roll number or parent name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
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
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fee Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.contactNumber}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.fees.due > 0 ? (
                        <span className="text-red-600">
                          ₹{student.fees.due.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-green-600">No dues</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="ml-2">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">
                No students found matching your criteria.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-md border p-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active: {students.filter((s) => s.status === 'active').length}
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
                    students.reduce((acc, s) => acc + s.attendance.present, 0) /
                      students.length
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Fees Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {students
                    .reduce((acc, s) => acc + s.fees.paid, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of ₹
                  {students
                    .reduce((acc, s) => acc + s.fees.total, 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹
                  {students
                    .reduce((acc, s) => acc + s.fees.due, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {students.filter((s) => s.fees.due > 0).length} students
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <DashboardLayout type="school" activePath="/school/students">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <Button onClick={handleAddStudent}>
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
            Add Student
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-[400px]">
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="due">Fee Due</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <StudentListContent />
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <StudentListContent />
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <StudentListContent />
          </TabsContent>
          <TabsContent value="due" className="space-y-4">
            <StudentListContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent
                ? 'Update student information'
                : 'Enter details for the new student'}
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
                        <Input placeholder="Enter student name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter roll number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Class 10-A">Class 10-A</SelectItem>
                          <SelectItem value="Class 10-B">Class 10-B</SelectItem>
                          <SelectItem value="Class 9-A">Class 9-A</SelectItem>
                          <SelectItem value="Class 9-B">Class 9-B</SelectItem>
                          <SelectItem value="Class 8-C">Class 8-C</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} />
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
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
