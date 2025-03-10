import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
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

interface BasicInformationProps {
  form: UseFormReturn<any>
}

export function BasicInformation({ form }: BasicInformationProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="registeredName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>School Name (as per government/board records)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter school name" />
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
              <Input {...field} placeholder="Enter registration number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="boardType"
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
    </div>
  )
}
