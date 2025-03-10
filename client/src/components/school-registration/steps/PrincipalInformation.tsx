import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface PrincipalInformationProps {
  form: UseFormReturn<any>
}

export function PrincipalInformation({ form }: PrincipalInformationProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="principalName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Principal's Full Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter principal's name as per records"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="principalEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Principal's Email Address</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="Enter principal's email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="principalPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Principal's Mobile Number</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder="Enter principal's mobile number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
