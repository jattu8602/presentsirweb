import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Edit, Clock, Plus, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Sample data
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const TIME_SLOTS = [
  '8:00 AM - 8:45 AM',
  '8:45 AM - 9:30 AM',
  '9:30 AM - 10:15 AM',
  '10:15 AM - 10:30 AM', // Break
  '10:30 AM - 11:15 AM',
  '11:15 AM - 12:00 PM',
  '12:00 PM - 12:45 PM',
  '12:45 PM - 1:30 PM', // Lunch
  '1:30 PM - 2:15 PM',
  '2:15 PM - 3:00 PM',
]

const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Physical Education',
  'Arts',
  'Break',
  'Lunch',
]

const CLASSES = [
  'Class 5A',
  'Class 6A',
  'Class 7A',
  'Class 8A',
  'Class 9A',
  'Class 10A',
]

// Default timetable template
const createDefaultTimetable = () => {
  return DAYS.map((day) => ({
    day,
    periods: TIME_SLOTS.map((timeSlot) => {
      if (timeSlot.includes('Break')) {
        return { timeSlot, subject: 'Break', teacher: 'N/A' }
      } else if (timeSlot.includes('Lunch')) {
        return { timeSlot, subject: 'Lunch', teacher: 'N/A' }
      } else {
        return { timeSlot, subject: '', teacher: '' }
      }
    }),
  }))
}

// Define form schema for period editing
const periodFormSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required' }),
  teacher: z.string().min(1, { message: 'Teacher is required' }),
})

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0])
  const [timetable, setTimetable] = useState(createDefaultTimetable())
  const [editMode, setEditMode] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentPeriod, setCurrentPeriod] = useState<{
    day: string
    index: number
  } | null>(null)
  const { toast } = useToast()

  // Initialize form
  const form = useForm<z.infer<typeof periodFormSchema>>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      subject: '',
      teacher: '',
    },
  })

  // Open dialog to edit a period
  const openEditDialog = (day: string, index: number) => {
    const dayIndex = timetable.findIndex((d) => d.day === day)
    const period = timetable[dayIndex].periods[index]

    // Skip if it's a break or lunch
    if (period.subject === 'Break' || period.subject === 'Lunch') {
      return
    }

    form.reset({
      subject: period.subject,
      teacher: period.teacher,
    })

    setCurrentPeriod({ day, index })
    setOpenDialog(true)
  }

  // Handle form submit
  function onSubmit(values: z.infer<typeof periodFormSchema>) {
    if (!currentPeriod) return

    const { day, index } = currentPeriod
    const newTimetable = [...timetable]
    const dayIndex = newTimetable.findIndex((d) => d.day === day)

    newTimetable[dayIndex].periods[index] = {
      ...newTimetable[dayIndex].periods[index],
      subject: values.subject,
      teacher: values.teacher,
    }

    setTimetable(newTimetable)
    setOpenDialog(false)

    toast({
      title: 'Period Updated',
      description: `Subject updated for ${day}, ${newTimetable[dayIndex].periods[index].timeSlot}`,
    })
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode)

    if (editMode) {
      toast({
        title: 'Timetable Saved',
        description: `Timetable for ${selectedClass} has been saved.`,
      })
    }
  }

  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    // In a real app, you would fetch the timetable for the selected class
    // For now, just reset to default
    setTimetable(createDefaultTimetable())
    setEditMode(false)
  }

  // Set cell color based on subject
  const getCellColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-blue-50'
      case 'Science':
        return 'bg-green-50'
      case 'English':
        return 'bg-yellow-50'
      case 'Hindi':
        return 'bg-pink-50'
      case 'Social Studies':
        return 'bg-purple-50'
      case 'Computer Science':
        return 'bg-cyan-50'
      case 'Physical Education':
        return 'bg-orange-50'
      case 'Arts':
        return 'bg-violet-50'
      case 'Break':
        return 'bg-gray-100'
      case 'Lunch':
        return 'bg-gray-100'
      default:
        return ''
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Timetable</h2>
            <p className="text-muted-foreground">
              Manage class schedules and subject allocations.
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

            <Button
              onClick={toggleEditMode}
              variant={editMode ? 'default' : 'outline'}
            >
              {editMode ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Timetable
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Timetable
                </>
              )}
            </Button>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timetable for {selectedClass}</CardTitle>
            <CardDescription>
              Click on a period to edit subject and teacher allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="w-full min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50">Time / Day</th>
                    {DAYS.map((day) => (
                      <th key={day} className="border p-2 bg-gray-50">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot, timeIndex) => (
                    <tr key={timeSlot}>
                      <td className="border p-2 bg-gray-50 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 text-gray-500" />
                          {timeSlot}
                        </div>
                      </td>
                      {DAYS.map((day) => {
                        const dayData = timetable.find((d) => d.day === day)
                        const period = dayData?.periods[timeIndex]
                        const isEmpty = !period?.subject
                        const isBreakOrLunch =
                          period?.subject === 'Break' ||
                          period?.subject === 'Lunch'

                        return (
                          <td
                            key={`${day}-${timeSlot}`}
                            className={`border p-2 text-center ${getCellColor(
                              period?.subject || ''
                            )}`}
                            onClick={() =>
                              editMode && openEditDialog(day, timeIndex)
                            }
                            style={{
                              cursor:
                                editMode && !isBreakOrLunch
                                  ? 'pointer'
                                  : 'default',
                            }}
                          >
                            {isEmpty ? (
                              editMode && !isBreakOrLunch ? (
                                <div className="flex items-center justify-center text-gray-400">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </div>
                              ) : null
                            ) : (
                              <div>
                                <div className="font-medium">
                                  {period?.subject}
                                </div>
                                {period?.teacher !== 'N/A' && (
                                  <div className="text-xs text-gray-500">
                                    {period?.teacher}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Period Edit Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Period</DialogTitle>
              <DialogDescription>
                {currentPeriod && (
                  <>
                    {currentPeriod.day},{' '}
                    {
                      timetable.find((d) => d.day === currentPeriod.day)
                        ?.periods[currentPeriod.index].timeSlot
                    }
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.filter(
                            (s) => s !== 'Break' && s !== 'Lunch'
                          ).map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <FormControl>
                        <Input placeholder="Teacher's name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Assign a teacher for this subject
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
