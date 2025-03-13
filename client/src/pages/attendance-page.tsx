import { useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Check, X, Clock, DownloadIcon, Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Sample class and student data
const CLASSES = [
  'Class 5A',
  'Class 6A',
  'Class 7A',
  'Class 8A',
  'Class 9A',
  'Class 10A',
]

interface Student {
  id: string
  rollNumber: number
  name: string
  gender: 'Male' | 'Female'
}

// Mock students for each class
const STUDENTS: Record<string, Student[]> = {
  'Class 5A': Array.from({ length: 20 }, (_, i) => ({
    id: `5A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
  'Class 6A': Array.from({ length: 25 }, (_, i) => ({
    id: `6A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
  'Class 7A': Array.from({ length: 22 }, (_, i) => ({
    id: `7A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
  'Class 8A': Array.from({ length: 18 }, (_, i) => ({
    id: `8A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
  'Class 9A': Array.from({ length: 15 }, (_, i) => ({
    id: `9A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
  'Class 10A': Array.from({ length: 17 }, (_, i) => ({
    id: `10A-${i + 1}`,
    rollNumber: i + 1,
    name: `Student ${i + 1}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  })),
}

// Attendance status options
type AttendanceStatus = 'present' | 'absent' | 'late' | 'unrecorded'

// Color codes for attendance status
const statusColors: Record<AttendanceStatus, string> = {
  present: 'text-green-500',
  absent: 'text-red-500',
  late: 'text-amber-500',
  unrecorded: 'text-gray-300',
}

// Function to get last 5 days (excluding weekends for simplicity)
const getLastFiveDays = (today: Date): Date[] => {
  const days: Date[] = []
  let currentDay = new Date(today)

  // Set to today
  days.push(new Date(currentDay))

  // Go back 5 more days
  for (let i = 0; i < 5; i++) {
    currentDay = new Date(currentDay)
    currentDay.setDate(currentDay.getDate() - 1)
    days.push(new Date(currentDay))
  }

  return days.reverse()
}

// Function to submit attendance to the server
const submitAttendanceToServer = async (data: {
  date: string
  classId: string
  records: Array<{
    studentId: string
    status: AttendanceStatus
    remark?: string
  }>
}) => {
  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save attendance records')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error submitting attendance data:', error)
    throw error
  }
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [editMode, setEditMode] = useState(true) // Start in edit mode for today
  const [attendanceData, setAttendanceData] = useState<
    Record<string, Record<string, AttendanceStatus>>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Initialize the attendance data if it doesn't exist for the selected date
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  if (!attendanceData[dateStr]) {
    const initialData: Record<string, AttendanceStatus> = {}
    STUDENTS[selectedClass].forEach((student) => {
      initialData[student.id] = 'unrecorded'
    })
    setAttendanceData((prev) => ({ ...prev, [dateStr]: initialData }))
  }

  // Get students for the selected class
  const students = STUDENTS[selectedClass] || []

  // Last 5 days for the attendance view
  const last5Days = getLastFiveDays(new Date())

  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClass(value)

    // Initialize attendance data for the selected class if needed
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    if (!attendanceData[dateStr]) {
      const initialData: Record<string, AttendanceStatus> = {}
      STUDENTS[value].forEach((student) => {
        initialData[student.id] = 'unrecorded'
      })
      setAttendanceData((prev) => ({ ...prev, [dateStr]: initialData }))
    }
  }

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDay = new Date(date)
    selectedDay.setHours(0, 0, 0, 0)

    setSelectedDate(date)

    // Only allow editing for today or past dates
    setEditMode(selectedDay.getTime() <= today.getTime())

    // Initialize attendance data for the selected date if needed
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!attendanceData[dateStr]) {
      const initialData: Record<string, AttendanceStatus> = {}
      students.forEach((student) => {
        initialData[student.id] = 'unrecorded'
      })
      setAttendanceData((prev) => ({ ...prev, [dateStr]: initialData }))
    }
  }

  // Update attendance for a student
  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    setAttendanceData((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [studentId]: status,
      },
    }))
  }

  // Mark all students as present
  const markAllPresent = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const newData: Record<string, AttendanceStatus> = {}

    students.forEach((student) => {
      newData[student.id] = 'present'
    })

    setAttendanceData((prev) => ({
      ...prev,
      [dateStr]: newData,
    }))

    toast({
      title: 'Attendance Updated',
      description: 'All students marked as present.',
    })
  }

  // Save attendance records
  const saveAttendance = async () => {
    try {
      setIsLoading(true)

      // Prepare data for submission
      const submitData = {
        date: selectedDate.toISOString(),
        classId: selectedClass,
        records: Object.entries(
          attendanceData[format(selectedDate, 'yyyy-MM-dd')] || {}
        ).map(([studentId, status]) => ({
          studentId,
          status,
          remark:
            status === 'absent'
              ? 'Absent without notice'
              : status === 'late'
              ? 'Arrived late'
              : undefined,
        })),
      }

      // Submit to server
      const result = await submitAttendanceToServer(submitData)

      // Update editing state
      setEditMode(false)

      toast({
        title: 'Attendance saved',
        description: `Attendance for ${selectedDate.toLocaleDateString()} has been recorded.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast({
        title: 'Error saving attendance',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate attendance statistics
  const calculateStats = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const data = attendanceData[dateStr] || {}
    const total = students.length
    const present = Object.values(data).filter(
      (status) => status === 'present'
    ).length
    const absent = Object.values(data).filter(
      (status) => status === 'absent'
    ).length
    const late = Object.values(data).filter(
      (status) => status === 'late'
    ).length
    const unrecorded = Object.values(data).filter(
      (status) => status === 'unrecorded'
    ).length

    return { total, present, absent, late, unrecorded }
  }

  const stats = calculateStats()
  const presentPercentage = Math.round((stats.present / stats.total) * 100) || 0

  // Get icon for attendance status
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-500" />
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />
      case 'late':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'unrecorded':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
            <p className="text-muted-foreground">
              Mark and track student attendance records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {editMode && (
              <>
                <Button variant="outline" onClick={markAllPresent}>
                  Mark All Present
                </Button>

                <Button
                  onClick={saveAttendance}
                  disabled={!editMode || isLoading}
                  className="ml-2"
                >
                  {isLoading ? 'Saving...' : 'Save Attendance'}
                </Button>
              </>
            )}

            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Attendance Statistics */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>{format(selectedDate, 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">
                    Attendance Rate
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {presentPercentage}%
                    </span>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center border-8"
                      style={{
                        borderColor: `${
                          presentPercentage >= 90
                            ? '#22c55e'
                            : presentPercentage >= 75
                            ? '#eab308'
                            : '#ef4444'
                        }`,
                      }}
                    >
                      <span className="text-sm font-semibold">
                        {stats.present}/{stats.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-xs text-green-500 uppercase font-semibold mb-1">
                      Present
                    </div>
                    <div className="text-xl font-bold">{stats.present}</div>
                  </div>

                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-xs text-red-500 uppercase font-semibold mb-1">
                      Absent
                    </div>
                    <div className="text-xl font-bold">{stats.absent}</div>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-3">
                    <div className="text-xs text-amber-500 uppercase font-semibold mb-1">
                      Late
                    </div>
                    <div className="text-xl font-bold">{stats.late}</div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Unrecorded
                    </div>
                    <div className="text-xl font-bold">{stats.unrecorded}</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="text-xs text-muted-foreground mt-4 space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>Late</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Sheet */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Attendance Sheet</CardTitle>
              <CardDescription>
                {editMode
                  ? 'Click to toggle attendance status'
                  : 'Viewing historic attendance data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Roll</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-16">Gender</TableHead>
                      {last5Days.map((day, index) => (
                        <TableHead
                          key={format(day, 'yyyy-MM-dd')}
                          className={cn(
                            'text-center w-16',
                            format(day, 'yyyy-MM-dd') ===
                              format(selectedDate, 'yyyy-MM-dd')
                              ? 'bg-primary/10'
                              : ''
                          )}
                        >
                          <div className="flex flex-col items-center">
                            <span>{format(day, 'dd')}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(day, 'E')}
                            </span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        {last5Days.map((day) => {
                          const dayStr = format(day, 'yyyy-MM-dd')
                          const isSelectedDay =
                            dayStr === format(selectedDate, 'yyyy-MM-dd')
                          const status = (attendanceData[dayStr]?.[
                            student.id
                          ] || 'unrecorded') as AttendanceStatus

                          return (
                            <TableCell
                              key={`${student.id}-${dayStr}`}
                              className={cn(
                                'text-center p-0 h-12',
                                isSelectedDay ? 'bg-primary/10' : ''
                              )}
                            >
                              {editMode && isSelectedDay ? (
                                <div className="flex justify-center items-center h-full">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Cycle through attendance statuses
                                      const nextStatus: Record<
                                        AttendanceStatus,
                                        AttendanceStatus
                                      > = {
                                        unrecorded: 'present',
                                        present: 'absent',
                                        absent: 'late',
                                        late: 'present',
                                      }
                                      updateAttendance(
                                        student.id,
                                        nextStatus[status]
                                      )
                                    }}
                                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/20"
                                  >
                                    {getStatusIcon(status)}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center h-full">
                                  {getStatusIcon(status)}
                                </div>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
