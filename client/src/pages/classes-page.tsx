import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { PlusCircle, Pencil, Users, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Define form schema for adding a class
const classFormSchema = z.object({
  name: z.string().min(1, { message: 'Class name is required' }),
  teacherName: z.string().min(1, { message: 'Teacher name is required' }),
  teacherEmail: z.string().email({ message: 'Invalid email address' }),
  teacherPhone: z
    .string()
    .min(10, { message: 'Phone number should be at least 10 digits' }),
  subject: z.string().optional(),
  totalStudents: z.coerce
    .number()
    .min(1, { message: 'Must have at least 1 student' }),
  boys: z.coerce.number().min(0),
  girls: z.coerce.number().min(0),
  startRollNumber: z.coerce.number().min(1),
  endRollNumber: z.coerce.number().min(1),
})

// Define a type for our mock class data
interface ClassData {
  id: string
  name: string
  teacherName: string
  totalStudents: number
  boys: number
  girls: number
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([
    {
      id: '1',
      name: 'Class 5A',
      teacherName: 'Amit Kumar',
      totalStudents: 25,
      boys: 12,
      girls: 13,
    },
    {
      id: '2',
      name: 'Class 6A',
      teacherName: 'Priya Sharma',
      totalStudents: 30,
      boys: 16,
      girls: 14,
    },
    {
      id: '3',
      name: 'Class 7A',
      teacherName: 'Raj Verma',
      totalStudents: 28,
      boys: 15,
      girls: 13,
    },
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const { toast } = useToast()

  // Initialize form
  const form = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      teacherName: '',
      teacherEmail: '',
      teacherPhone: '',
      subject: '',
      totalStudents: 0,
      boys: 0,
      girls: 0,
      startRollNumber: 1,
      endRollNumber: 1,
    },
  })

  function onSubmit(values: z.infer<typeof classFormSchema>) {
    // Add the new class to our state
    setClasses([
      ...classes,
      {
        id: (classes.length + 1).toString(),
        name: values.name,
        teacherName: values.teacherName,
        totalStudents: values.totalStudents,
        boys: values.boys,
        girls: values.girls,
      },
    ])

    // Close the dialog
    setOpenDialog(false)

    // Show success toast
    toast({
      title: 'Class Added',
      description: `${values.name} has been added successfully.`,
    })

    // Reset the form
    form.reset()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
            <p className="text-muted-foreground">
              Manage your school classes, teachers, and students.
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new class to your school.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 py-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Class 5A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teacherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Teacher</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Teacher's full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teacherEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher's Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teacherPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teacher's Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mathematics">
                              Mathematics
                            </SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="social_studies">
                              Social Studies
                            </SelectItem>
                            <SelectItem value="computer_science">
                              Computer Science
                            </SelectItem>
                            <SelectItem value="physical_education">
                              Physical Education
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This can also be assigned later from the timetable.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="totalStudents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Students</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="boys"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Boys</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="girls"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Girls</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startRollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Roll Number</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endRollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Roll Number</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="submit">Add Class</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="all">All Classes</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="secondary">Secondary</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <Card key={classItem.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{classItem.name}</span>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Teacher: {classItem.teacherName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Total Students:
                      </span>
                      <span>{classItem.totalStudents}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Boys:</span>
                      <span>{classItem.boys}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Girls:</span>
                      <span>{classItem.girls}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      View Students
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add Student
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="primary" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes
                .filter(
                  (c) =>
                    c.name.includes('5') ||
                    c.name.includes('6') ||
                    c.name.includes('7') ||
                    c.name.includes('8')
                )
                .map((classItem) => (
                  <Card key={classItem.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>{classItem.name}</span>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Teacher: {classItem.teacherName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          Total Students:
                        </span>
                        <span>{classItem.totalStudents}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Boys:</span>
                        <span>{classItem.boys}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Girls:</span>
                        <span>{classItem.girls}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        View Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Student
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="secondary" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes
                .filter(
                  (c) =>
                    c.name.includes('9') ||
                    c.name.includes('10') ||
                    c.name.includes('11') ||
                    c.name.includes('12')
                )
                .map((classItem) => (
                  <Card key={classItem.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>{classItem.name}</span>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Teacher: {classItem.teacherName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          Total Students:
                        </span>
                        <span>{classItem.totalStudents}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Boys:</span>
                        <span>{classItem.boys}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Girls:</span>
                        <span>{classItem.girls}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        View Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Student
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
