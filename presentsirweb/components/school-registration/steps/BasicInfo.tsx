import { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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

interface BasicInfoProps {
  form: UseFormReturn<any>
}

export function BasicInfo({ form }: BasicInfoProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="registeredName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>School Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter registered name as per government or board records"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="registrationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Registration/Affiliation Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter unique identifier issued by education board"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="educationBoard"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education Board</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select education board" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="STATE">State Board</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="institutionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Institution Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="COACHING">Coaching Institute</SelectItem>
                <SelectItem value="COLLEGE">College</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
