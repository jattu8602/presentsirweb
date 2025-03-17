'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, subDays } from 'date-fns'
import { DashboardLayout } from '../../../../../components/layout/dashboard-layout'

// UI Components
import { Button } from '../../../../../components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../../../../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select'
import { Input } from '../../../../../components/ui/input'
import { Calendar } from '../../../../../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table'

// Mock data
const mockClasses = [
  { id: 'class1', name: 'Class 10-A' },
  { id: 'class2', name: 'Class 9-B' },
  { id: 'class3', name: 'Class 8-C' },
  { id: 'class4', name: 'Class 7-A' },
]

const mockStudents = {
  class1: [
    { id: 'student1', rollNumber: 1, name: 'Aarav Sharma', gender: 'Male' },
    { id: 'student2', rollNumber: 2, name: 'Diya Patel', gender: 'Female' },
    { id: 'student3', rollNumber: 3, name: 'Vihaan Singh', gender: 'Male' },
    { id: 'student4', rollNumber: 4, name: 'Ananya Gupta', gender: 'Female' },
    { id: 'student5', rollNumber: 5, name: 'Reyansh Kumar', gender: 'Male' },
  ],
  class2: [
    { id: 'student6', rollNumber: 1, name: 'Aanya Reddy', gender: 'Female' },
    { id: 'student7', rollNumber: 2, name: 'Vivaan Joshi', gender: 'Male' },
    { id: 'student8', rollNumber: 3, name: 'Ishaan Mehta', gender: 'Male' },
    { id: 'student9', rollNumber: 4, name: 'Pari Malhotra', gender: 'Female' },
  ],
  class3: [
    { id: 'student10', rollNumber: 1, name: 'Kabir Khanna', gender: 'Male' },
    { id: 'student11', rollNumber: 2, name: 'Myra Shah', gender: 'Female' },
    { id: 'student12', rollNumber: 3, name: 'Dhruv Verma', gender: 'Male' },
  ],
  class4: [
    { id: 'student13', rollNumber: 1, name: 'Anika Saxena', gender: 'Female' },
    { id: 'student14', rollNumber: 2, name: 'Atharv Chauhan', gender: 'Male' },
    { id: 'student15', rollNumber: 3, name: 'Kiara Singh', gender: 'Female' },
    { id: 'student16', rollNumber: 4, name: 'Arnav Yadav', gender: 'Male' },
    {
      id: 'student17',
      rollNumber: 5,
      name: 'Shanaya Kapoor',
      gender: 'Female',
    },
  ],
}

// Schema for form validation
const formSchema = z.object({
  class: z.string().min(1, { message: 'Please select a class' }),
  date: z.date(),
})

// Helper function to generate last five days
const getLastFiveDays = (today) => {
  const days = []
  for (let i = 0; i < 5; i++) {
    days.push(subDays(today, i))
  }
  return days
}

// Mock function to simulate API call
const submitAttendanceToServer = async (data) => {
  console.log('Submitting attendance:', data)
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [students, setStudents] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(true)
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    unrecorded: 0,
  })

  // Set up form with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: '',
      date: new Date(),
    },
  })

  // Handle class change
  const handleClassChange = (value) => {
    setSelectedClass(value)
    form.setValue('class', value)
    // Reset attendance records when class changes
    const studentList = mockStudents[value] || []
    setStudents(studentList)

    // Initialize attendance records for all students as 'unrecorded'
    const initialRecords = {}
    studentList.forEach((student) => {
      initialRecords[student.id] = 'unrecorded'
    })
    setAttendanceRecords(initialRecords)
    updateStats(initialRecords)
  }

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date)
    form.setValue('date', date)

    // In a real app, we would fetch attendance records for this date
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      // For demo, let's randomize the attendance status
      const statuses = ['present', 'absent', 'late', 'unrecorded']
      const records = {}
      students.forEach((student) => {
        records[student.id] = statuses[Math.floor(Math.random() * 3)] // Mostly present, absent, or late
      })
      setAttendanceRecords(records)
      updateStats(records)
      setIsLoading(false)
    }, 1000)
  }

  // Update attendance status for a student
  const updateAttendance = (studentId, status) => {
    if (!editMode) return

    const newRecords = { ...attendanceRecords }
    newRecords[studentId] = status
    setAttendanceRecords(newRecords)
    updateStats(newRecords)
  }

  // Mark all students as present
  const markAllPresent = () => {
    if (!editMode) return

    const newRecords = {}
    students.forEach((student) => {
      newRecords[student.id] = 'present'
    })
    setAttendanceRecords(newRecords)
    updateStats(newRecords)
  }

  // Mark all students as absent
  const markAllAbsent = () => {
    if (!editMode) return

    const newRecords = {}
    students.forEach((student) => {
      newRecords[student.id] = 'absent'
    })
    setAttendanceRecords(newRecords)
    updateStats(newRecords)
  }

  // Save attendance records
  const saveAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const records = Object.entries(attendanceRecords).map(
        ([studentId, status]) => ({
          studentId,
          status,
          remark: status === 'late' ? 'Arrived 15 minutes late' : undefined,
        })
      )

      const data = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        classId: selectedClass,
        records,
      }

      // Submit to server
      await submitAttendanceToServer(data)

      // Success message
      console.log('Attendance saved successfully!')

      // Set to view mode after saving
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save attendance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate statistics from attendance records
  const calculateStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      unrecorded: 0,
    }

    Object.values(attendanceRecords).forEach((status) => {
      if (stats[status] !== undefined) {
        stats[status]++
      }
    })

    return stats
  }

  // Update statistics when attendance records change
  const updateStats = (records) => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      unrecorded: 0,
    }

    Object.values(records).forEach((status) => {
      if (stats[status] !== undefined) {
        stats[status]++
      }
    })

    setStats(stats)
  }

  // Get icon for attendance status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return (
          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case 'absent':
        return (
          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-red-600"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </div>
        )
      case 'late':
        return (
          <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-yellow-600"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
    }
  }

  return (
    <DashboardLayout type="school" activePath="/school/attendance">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <Button
            variant={editMode ? 'outline' : 'default'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </Button>
        </div>

        <Form {...form}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Class selection */}
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={(value) => handleClassChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date selection */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="ml-auto h-4 w-4 opacity-50"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                            />
                          </svg>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => handleDateChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        {/* Quick select buttons */}
        {selectedClass && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllPresent}
              disabled={!editMode || isLoading}
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAbsent}
              disabled={!editMode || isLoading}
            >
              Mark All Absent
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveAttendance}
              disabled={!editMode || isSubmitting || isLoading}
            >
              {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        )}

        {/* Stats */}
        {selectedClass && students.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-700">Present</h3>
              <p className="text-2xl font-bold text-green-700">
                {stats.present}
              </p>
              <p className="text-xs text-green-600">
                {students.length > 0
                  ? Math.round((stats.present / students.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-700">Absent</h3>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
              <p className="text-xs text-red-600">
                {students.length > 0
                  ? Math.round((stats.absent / students.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-700">Late</h3>
              <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
              <p className="text-xs text-yellow-600">
                {students.length > 0
                  ? Math.round((stats.late / students.length) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">
                Not Recorded
              </h3>
              <p className="text-2xl font-bold text-gray-700">
                {stats.unrecorded}
              </p>
              <p className="text-xs text-gray-600">
                {students.length > 0
                  ? Math.round((stats.unrecorded / students.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        )}

        {/* Students attendance table */}
        {selectedClass && students.length > 0 ? (
          <div className="border rounded-md">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell className="flex items-center">
                        {getStatusIcon(attendanceRecords[student.id])}
                        <span className="ml-2 capitalize">
                          {attendanceRecords[student.id]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {editMode && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={
                                attendanceRecords[student.id] === 'present'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="h-8"
                              onClick={() =>
                                updateAttendance(student.id, 'present')
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                attendanceRecords[student.id] === 'absent'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="h-8"
                              onClick={() =>
                                updateAttendance(student.id, 'absent')
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                attendanceRecords[student.id] === 'late'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="h-8"
                              onClick={() =>
                                updateAttendance(student.id, 'late')
                              }
                            >
                              Late
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ) : selectedClass ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No students found for this class.</p>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">
              Please select a class to view attendance.
            </p>
          </div>
        )}

        {/* Recent attendance history */}
        {selectedClass && students.length > 0 && !isLoading && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">
              Recent Attendance History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {getLastFiveDays(new Date()).map((day, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-2">
                    {format(day, 'EEEE')}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {format(day, 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-700">
                          {Math.floor(Math.random() * (students.length + 1))}
                        </span>
                      </div>
                      <span className="text-xs mt-1">Present</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-red-700">
                          {Math.floor(Math.random() * (students.length / 2))}
                        </span>
                      </div>
                      <span className="text-xs mt-1">Absent</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-yellow-700">
                          {Math.floor(Math.random() * 3)}
                        </span>
                      </div>
                      <span className="text-xs mt-1">Late</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
