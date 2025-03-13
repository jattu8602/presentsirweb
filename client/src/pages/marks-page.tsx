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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import {
  Download,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

// Sample data for classes
const CLASSES = [
  { id: 'class-1', name: 'Class 1' },
  { id: 'class-2', name: 'Class 2' },
  { id: 'class-3', name: 'Class 3' },
  { id: 'class-4', name: 'Class 4' },
  { id: 'class-5', name: 'Class 5' },
]

// Sample data for subjects
const SUBJECTS = [
  { id: 'subject-1', name: 'Mathematics' },
  { id: 'subject-2', name: 'Science' },
  { id: 'subject-3', name: 'English' },
  { id: 'subject-4', name: 'History' },
  { id: 'subject-5', name: 'Geography' },
]

// Sample data for students
const STUDENTS: Student[] = [
  {
    id: 'student-1',
    rollNumber: 1,
    name: 'John Doe',
    gender: 'Male',
  },
  {
    id: 'student-2',
    rollNumber: 2,
    name: 'Jane Smith',
    gender: 'Female',
  },
  {
    id: 'student-3',
    rollNumber: 3,
    name: 'Alice Johnson',
    gender: 'Female',
  },
  {
    id: 'student-4',
    rollNumber: 4,
    name: 'Bob Brown',
    gender: 'Male',
  },
  {
    id: 'student-5',
    rollNumber: 5,
    name: 'Charlie Davis',
    gender: 'Male',
  },
]

// Define Student interface for type safety
interface Student {
  id: string
  rollNumber: number
  name: string
  gender: 'Male' | 'Female'
}

// Form schema for adding marks
const marksFormSchema = z.object({
  examType: z.string().min(1, { message: 'Exam type is required' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  uploadMarks: z.record(
    z.string(),
    z.object({
      marks: z.string().min(1, { message: 'Marks are required' }),
      totalMarks: z.string().default('100'),
      grade: z.string().optional(),
      remarks: z.string().optional(),
    })
  ),
})

// Define MarkRecord interface
interface MarkRecord {
  id: string
  studentId: string
  studentName: string
  subject: string
  examType: string
  marksObtained: number
  totalMarks: number
  percentage: number
  grade: string
  remarks?: string
  date: string
}

// Function to submit marks to the server
const submitMarksToServer = async (data: {
  classId: string
  examType: string
  subject: string
  date: string
  uploadMarks: Record<string, any>
}) => {
  try {
    const response = await fetch(`/api/marks/class/${data.classId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examType: data.examType,
        subject: data.subject,
        date: new Date(data.date),
        marks: Object.entries(data.uploadMarks).map(
          ([studentId, marksData]: [string, any]) => ({
            studentId,
            marksObtained: parseFloat(marksData.marks),
            totalMarks: parseFloat(marksData.totalMarks),
            grade: marksData.grade,
            remarks: marksData.remarks,
          })
        ),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit marks')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting marks:', error)
    throw error
  }
}

export default function MarksPage() {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedExam, setSelectedExam] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const { toast } = useToast()

  // Store marks data per class, exam, subject
  const [marksData, setMarksData] = useState<Record<string, any>>({})

  // Create a form for submitting marks
  const form = useForm<z.infer<typeof marksFormSchema>>({
    resolver: zodResolver(marksFormSchema),
    defaultValues: {
      examType: '',
      subject: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      uploadMarks: {},
    },
  })

  // Handle mark submission
  const onSubmit = async (values: z.infer<typeof marksFormSchema>) => {
    try {
      setIsLoading(true)
      // Modified to use the server submission function
      const data = {
        classId: selectedClass,
        examType: values.examType,
        subject: values.subject,
        date: values.date,
        uploadMarks: values.uploadMarks,
      }

      await submitMarksToServer(data)

      // Update local state
      const examKey = `${values.examType}_${values.subject}_${format(
        new Date(values.date),
        'yyyy-MM-dd'
      )}`
      const newMarks = { ...marksData }

      newMarks[examKey] = {
        examType: values.examType,
        subject: values.subject,
        date: values.date,
        classId: selectedClass,
        students: Object.entries(values.uploadMarks).map(
          ([studentId, data]: [string, any]) => ({
            studentId,
            marks: parseFloat(data.marks),
            totalMarks: parseFloat(data.totalMarks),
            grade: data.grade,
            remarks: data.remarks || '',
          })
        ),
      }

      setMarksData(newMarks)
      setOpenDialog(false)
      form.reset()

      toast({
        title: 'Marks saved successfully',
        description: 'The marks have been saved for the selected class.',
      })
    } catch (error: any) {
      toast({
        title: 'Error saving marks',
        description:
          error.message ||
          'An unexpected error occurred while saving marks. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get students for selected class
  const getStudentsForClass = (classId: string) => {
    // In real app, this would filter students by class
    return STUDENTS
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Student Marks</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>Add Marks</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Student Marks</DialogTitle>
                <DialogDescription>
                  Enter marks for students in the selected class.
                </DialogDescription>
              </DialogHeader>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="class-select"
                >
                  Select Class
                </label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => setSelectedClass(value)}
                >
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClass && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="examType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select exam type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UNIT_TEST">
                                  Unit Test
                                </SelectItem>
                                <SelectItem value="MIDTERM">Midterm</SelectItem>
                                <SelectItem value="FINAL">
                                  Final Exam
                                </SelectItem>
                                <SelectItem value="ASSIGNMENT">
                                  Assignment
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUBJECTS.map((subject) => (
                                  <SelectItem
                                    key={subject.id}
                                    value={subject.id}
                                  >
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Enter Student Marks
                      </h3>
                      <div className="border rounded-md p-3 space-y-4">
                        {getStudentsForClass(selectedClass).map((student) => (
                          <div
                            key={student.id}
                            className="grid grid-cols-3 gap-2 items-center"
                          >
                            <div className="text-sm">
                              {student.rollNumber}. {student.name}
                            </div>
                            <FormField
                              control={form.control}
                              name={`uploadMarks.${student.id}.marks`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Marks"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`uploadMarks.${student.id}.grade`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Grade" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Marks'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>View Marks</CardTitle>
              <CardDescription>
                Select a class, subject, and exam to view marks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="view-class"
                  >
                    Class
                  </label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger id="view-class">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="view-exam"
                  >
                    Exam
                  </label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger id="view-exam">
                      <SelectValue placeholder="Select an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                      <SelectItem value="MIDTERM">Midterm</SelectItem>
                      <SelectItem value="FINAL">Final Exam</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="view-subject"
                  >
                    Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger id="view-subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClass && (
                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="table">Table View</TabsTrigger>
                    <TabsTrigger value="student">Student View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="table">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.keys(marksData).length > 0 ? (
                          Object.keys(marksData)
                            .filter((key) => {
                              const item = marksData[key]
                              return (
                                (selectedExam === 'all' ||
                                  item.examType === selectedExam) &&
                                (selectedSubject === 'all' ||
                                  item.subject === selectedSubject) &&
                                item.classId === selectedClass
                              )
                            })
                            .flatMap((key) => {
                              const item = marksData[key]
                              return item.students.map(
                                (studentMark: any, index: number) => {
                                  const student = STUDENTS.find(
                                    (s) => s.id === studentMark.studentId
                                  )
                                  const subject = SUBJECTS.find(
                                    (s) => s.id === item.subject
                                  )
                                  return (
                                    <TableRow key={`${key}-${index}`}>
                                      <TableCell>
                                        {student?.rollNumber}
                                      </TableCell>
                                      <TableCell>{student?.name}</TableCell>
                                      <TableCell>{subject?.name}</TableCell>
                                      <TableCell>
                                        {item.examType === 'UNIT_TEST'
                                          ? 'Unit Test'
                                          : item.examType === 'MIDTERM'
                                          ? 'Midterm'
                                          : item.examType === 'FINAL'
                                          ? 'Final Exam'
                                          : 'Assignment'}
                                      </TableCell>
                                      <TableCell>
                                        {studentMark.marks}/
                                        {studentMark.totalMarks}
                                      </TableCell>
                                      <TableCell>{studentMark.grade}</TableCell>
                                      <TableCell>
                                        {format(
                                          new Date(item.date),
                                          'dd/MM/yyyy'
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                }
                              )
                            })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-gray-500"
                            >
                              No marks data available. Add marks to see them
                              here.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="student">
                    <div className="space-y-6">
                      {STUDENTS.filter((_) => true).map((student) => (
                        <Card key={student.id}>
                          <CardHeader>
                            <CardTitle className="text-base font-medium">
                              {student.rollNumber}. {student.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead>Exam</TableHead>
                                  <TableHead>Marks</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.keys(marksData).length > 0 ? (
                                  Object.keys(marksData)
                                    .filter((key) => {
                                      const item = marksData[key]
                                      return (
                                        (selectedExam === 'all' ||
                                          item.examType === selectedExam) &&
                                        (selectedSubject === 'all' ||
                                          item.subject === selectedSubject) &&
                                        item.classId === selectedClass
                                      )
                                    })
                                    .flatMap((key) => {
                                      const item = marksData[key]
                                      const studentMark = item.students.find(
                                        (m: any) => m.studentId === student.id
                                      )
                                      if (!studentMark) return []

                                      const subject = SUBJECTS.find(
                                        (s) => s.id === item.subject
                                      )
                                      return (
                                        <TableRow key={`${key}-${student.id}`}>
                                          <TableCell>{subject?.name}</TableCell>
                                          <TableCell>
                                            {item.examType === 'UNIT_TEST'
                                              ? 'Unit Test'
                                              : item.examType === 'MIDTERM'
                                              ? 'Midterm'
                                              : item.examType === 'FINAL'
                                              ? 'Final Exam'
                                              : 'Assignment'}
                                          </TableCell>
                                          <TableCell>
                                            {studentMark.marks}/
                                            {studentMark.totalMarks}
                                          </TableCell>
                                          <TableCell>
                                            {studentMark.grade}
                                          </TableCell>
                                          <TableCell>
                                            {format(
                                              new Date(item.date),
                                              'dd/MM/yyyy'
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center py-4 text-gray-500"
                                    >
                                      No marks data available for this student.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
