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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import {
  DollarSign,
  Download,
  Filter,
  Plus,
  Receipt,
  Search,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Sample class data
const CLASSES = [
  'Class 5A',
  'Class 6A',
  'Class 7A',
  'Class 8A',
  'Class 9A',
  'Class 10A',
]

// Fee types
const FEE_TYPES = [
  'Tuition Fee',
  'Admission Fee',
  'Examination Fee',
  'Library Fee',
  'Sports Fee',
  'Computer Lab Fee',
  'Transport Fee',
]

// Payment methods
const PAYMENT_METHODS = [
  'Cash',
  'Online Transfer',
  'Cheque',
  'UPI',
  'Card Payment',
]

// Mock student data
interface Student {
  id: string
  name: string
  class: string
  rollNumber: number
}

const STUDENTS: Student[] = [
  { id: '1', name: 'Rahul Sharma', class: 'Class 5A', rollNumber: 1 },
  { id: '2', name: 'Priya Singh', class: 'Class 5A', rollNumber: 2 },
  { id: '3', name: 'Amit Kumar', class: 'Class 6A', rollNumber: 1 },
  { id: '4', name: 'Neha Patel', class: 'Class 6A', rollNumber: 2 },
  { id: '5', name: 'Raj Verma', class: 'Class 7A', rollNumber: 1 },
]

// Fee record interface
interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  rollNumber: number
  feeType: string
  amount: number
  paymentDate: string
  dueDate: string
  paymentMethod: string
  receiptNumber: string
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial'
  notes?: string
}

// Fee collection schema
const feeCollectionSchema = z.object({
  studentId: z.string().min(1, { message: 'Student is required' }),
  feeType: z.string().min(1, { message: 'Fee type is required' }),
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
  paymentDate: z.string().min(1, { message: 'Payment date is required' }),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
})

// Function to submit fee data to the server
const submitFeeToServer = async (data: {
  feeType: string
  amount: number
  dueDate: string
  studentId: string
  notes?: string
}): Promise<any> => {
  try {
    const response = await fetch('/api/fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save fee record')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error submitting fee data:', error)
    throw error
  }
}

// Function to update fee status on the server
const updateFeeStatusOnServer = async (
  feeId: string,
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL',
  paymentDetails: {
    paymentDate: string
    paymentMethod: string
    receiptNumber: string
  }
): Promise<any> => {
  try {
    const response = await fetch(`/api/fees/${feeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        ...paymentDetails,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update fee status')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error updating fee status:', error)
    throw error
  }
}

export default function FeesPage() {
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Rahul Sharma',
      studentClass: 'Class 5A',
      rollNumber: 1,
      feeType: 'Tuition Fee',
      amount: 5000,
      paymentDate: '2023-04-10',
      dueDate: '2023-04-15',
      paymentMethod: 'Cash',
      receiptNumber: 'RCPT-001',
      status: 'Paid',
      notes: 'Monthly fee for April',
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Priya Singh',
      studentClass: 'Class 5A',
      rollNumber: 2,
      feeType: 'Library Fee',
      amount: 1000,
      paymentDate: '',
      dueDate: '2023-04-20',
      paymentMethod: '',
      receiptNumber: '',
      status: 'Pending',
    },
    {
      id: '3',
      studentId: '3',
      studentName: 'Amit Kumar',
      studentClass: 'Class 6A',
      rollNumber: 1,
      feeType: 'Tuition Fee',
      amount: 5500,
      paymentDate: '2023-03-18',
      dueDate: '2023-03-15',
      paymentMethod: 'Online Transfer',
      receiptNumber: 'RCPT-002',
      status: 'Paid',
      notes: 'Monthly fee for March',
    },
    {
      id: '4',
      studentId: '4',
      studentName: 'Neha Patel',
      studentClass: 'Class 6A',
      rollNumber: 2,
      feeType: 'Examination Fee',
      amount: 2000,
      paymentDate: '',
      dueDate: '2023-02-28',
      paymentMethod: '',
      receiptNumber: '',
      status: 'Overdue',
    },
    {
      id: '5',
      studentId: '5',
      studentName: 'Raj Verma',
      studentClass: 'Class 7A',
      rollNumber: 1,
      feeType: 'Tuition Fee',
      amount: 6000,
      paymentDate: '2023-04-05',
      dueDate: '2023-04-15',
      paymentMethod: 'UPI',
      receiptNumber: 'RCPT-003',
      status: 'Paid',
      notes: 'Monthly fee for April',
    },
  ])
  const [openFeeDialog, setOpenFeeDialog] = useState(false)
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<FeeRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filter students by class for the dropdown
  const filteredStudents =
    selectedClass === 'All Classes'
      ? STUDENTS
      : STUDENTS.filter((student) => student.class === selectedClass)

  // Initialize form
  const form = useForm<z.infer<typeof feeCollectionSchema>>({
    resolver: zodResolver(feeCollectionSchema),
    defaultValues: {
      studentId: '',
      feeType: '',
      amount: 0,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      receiptNumber: `RCPT-${String(feeRecords.length + 1).padStart(3, '0')}`,
      notes: '',
    },
  })

  // Submit handler for fee collection
  const onSubmit = async (values: z.infer<typeof feeCollectionSchema>) => {
    try {
      setIsLoading(true)
      const result = await submitFeeToServer({
        feeType: values.feeType,
        amount: parseFloat(values.amount.toString()),
        dueDate: values.dueDate,
        studentId: values.studentId,
        notes: values.notes,
      })

      // Update local state with new fee record
      const student = STUDENTS.find((s) => s.id === values.studentId)
      if (!student) {
        throw new Error('Student not found')
      }

      const newRecord: FeeRecord = {
        id: String(feeRecords.length + 1),
        studentId: values.studentId,
        studentName: student.name,
        studentClass: student.class,
        rollNumber: student.rollNumber,
        feeType: values.feeType,
        amount: values.amount,
        paymentDate: values.paymentDate,
        dueDate: values.dueDate,
        paymentMethod: values.paymentMethod,
        receiptNumber:
          values.receiptNumber ||
          `RCPT-${String(feeRecords.length + 1).padStart(3, '0')}`,
        status: 'Paid',
        notes: values.notes,
      }
      setFeeRecords([...feeRecords, newRecord])

      toast({
        title: 'Fee record created successfully',
        description: `Fee record for ${values.feeType} has been created.`,
        variant: 'default',
      })

      // Close dialog and reset form
      setOpenFeeDialog(false)
      form.reset()
    } catch (error) {
      console.error('Error creating fee record:', error)
      toast({
        title: 'Error creating fee record',
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

  // Calculate totals
  const totalCollected = feeRecords
    .filter((record) => record.status === 'Paid')
    .reduce((sum, record) => sum + record.amount, 0)

  const totalPending = feeRecords
    .filter(
      (record) => record.status === 'Pending' || record.status === 'Overdue'
    )
    .reduce((sum, record) => sum + record.amount, 0)

  // Filter records by class
  const filteredRecords =
    selectedClass === 'All Classes'
      ? feeRecords
      : feeRecords.filter((record) => record.studentClass === selectedClass)

  // Show receipt for a specific payment
  const showReceipt = (record: FeeRecord) => {
    setSelectedReceipt(record)
    setOpenReceiptDialog(true)
  }

  const markAsPaid = async (record: FeeRecord) => {
    try {
      setIsLoading(true)

      // Prepare payment details
      const paymentDetails = {
        paymentDate: new Date().toISOString(),
        paymentMethod: 'Cash', // Default to cash, could be made selectable
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      }

      // Update on server
      const result = await updateFeeStatusOnServer(
        record.id,
        'PAID' as const,
        paymentDetails
      )

      // Update local state
      const updatedRecords = feeRecords.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: 'Paid' as const,
              paymentDate: paymentDetails.paymentDate,
              paymentMethod: paymentDetails.paymentMethod,
            }
          : r
      ) as FeeRecord[]
      setFeeRecords(updatedRecords)

      toast({
        title: 'Payment recorded successfully',
        description: `Fee payment for ${record.feeType} has been recorded.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: 'Error recording payment',
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Fee Management
            </h2>
            <p className="text-muted-foreground">
              Collect and track student fees and generate receipts
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Classes">All Classes</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={openFeeDialog} onOpenChange={setOpenFeeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Collect Fee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Collect Student Fee</DialogTitle>
                  <DialogDescription>
                    Enter payment details to collect fee from a student
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 py-4"
                  >
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredStudents.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.rollNumber} - {student.name} (
                                  {student.class})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="feeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fee Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fee type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FEE_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem key={method} value={method}>
                                    {method}
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
                        name="receiptNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receipt Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Auto-generated if left empty
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Fee Record'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Records
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Collected
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalCollected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {feeRecords.filter((record) => record.status === 'Paid').length}{' '}
                payments received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {
                  feeRecords.filter(
                    (record) =>
                      record.status === 'Pending' || record.status === 'Overdue'
                  ).length
                }{' '}
                pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feeRecords.length > 0
                  ? `${Math.round(
                      (feeRecords.filter((record) => record.status === 'Paid')
                        .length /
                        feeRecords.length) *
                        100
                    )}%`
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall fee collection success rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <div className="mt-4 mb-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student or receipt..."
              className="max-w-xs"
            />
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Receipt</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.receiptNumber || '-'}
                        </TableCell>
                        <TableCell>
                          {record.studentName} ({record.rollNumber})
                        </TableCell>
                        <TableCell>{record.studentClass}</TableCell>
                        <TableCell>{record.feeType}</TableCell>
                        <TableCell className="text-right">
                          ₹{record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{record.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === 'Paid'
                                ? 'default'
                                : record.status === 'Pending'
                                ? 'outline'
                                : 'destructive'
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {record.status === 'Paid' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showReceipt(record)}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(record)}
                              disabled={
                                isLoading ||
                                (record.status as string) === 'Paid'
                              }
                            >
                              {isLoading ? 'Processing...' : 'Mark as Paid'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Receipt</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords
                      .filter((record) => record.status === 'Paid')
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.receiptNumber}
                          </TableCell>
                          <TableCell>
                            {record.studentName} ({record.rollNumber})
                          </TableCell>
                          <TableCell>{record.studentClass}</TableCell>
                          <TableCell>{record.feeType}</TableCell>
                          <TableCell className="text-right">
                            ₹{record.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.paymentDate}</TableCell>
                          <TableCell>{record.paymentMethod}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showReceipt(record)}
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords
                      .filter(
                        (record) =>
                          record.status === 'Pending' ||
                          record.status === 'Overdue'
                      )
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {record.studentName} ({record.rollNumber})
                          </TableCell>
                          <TableCell>{record.studentClass}</TableCell>
                          <TableCell>{record.feeType}</TableCell>
                          <TableCell className="text-right">
                            ₹{record.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.dueDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === 'Overdue'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(record)}
                              disabled={
                                isLoading ||
                                (record.status as string) === 'Paid'
                              }
                            >
                              {isLoading ? 'Processing...' : 'Mark as Paid'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Receipt Dialog */}
        <Dialog open={openReceiptDialog} onOpenChange={setOpenReceiptDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>
                Receipt for {selectedReceipt?.feeType} payment
              </DialogDescription>
            </DialogHeader>

            {selectedReceipt && (
              <div className="space-y-4 border-2 border-dashed p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-bold">Present Sir School</h3>
                  <p className="text-muted-foreground">Payment Receipt</p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Receipt No:</p>
                    <p className="font-medium">
                      {selectedReceipt.receiptNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date:</p>
                    <p className="font-medium">{selectedReceipt.paymentDate}</p>
                  </div>
                </div>

                <div className="border-t border-b py-4 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Student Name:
                    </p>
                    <p className="font-medium">{selectedReceipt.studentName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Class:</p>
                      <p>{selectedReceipt.studentClass}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Roll Number:
                      </p>
                      <p>{selectedReceipt.rollNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 font-medium">
                    <div>Fee Type</div>
                    <div>Amount</div>
                    <div>Due Date</div>
                    <div>Payment Method</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>{selectedReceipt.feeType}</div>
                    <div>₹{selectedReceipt.amount.toLocaleString()}</div>
                    <div>{selectedReceipt.dueDate}</div>
                    <div>{selectedReceipt.paymentMethod}</div>
                  </div>

                  <div className="border-t pt-2 flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Notes: {selectedReceipt.notes || 'N/A'}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount:
                      </p>
                      <p className="font-bold">
                        ₹{selectedReceipt.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  <p>Thank you for your payment!</p>
                  <p>
                    This is a computer generated receipt and does not require
                    signature.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setOpenReceiptDialog(false)}>Close</Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

// Helper icon for the Clock used in the statistics card
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
