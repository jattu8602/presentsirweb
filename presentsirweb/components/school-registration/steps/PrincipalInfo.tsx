import { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface PrincipalInfoProps {
  form: UseFormReturn<any>
}

export function PrincipalInfo({ form }: PrincipalInfoProps) {
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
                placeholder="Enter name as it appears on official records"
                {...field}
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
            <FormLabel>Principal's Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Enter principal's email address"
                {...field}
              />
            </FormControl>
            <FormDescription>
              This email will not be used for login purposes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="principalPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Principal's Phone Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter principal's contact number"
                {...field}
              />
            </FormControl>
            <FormDescription>
              This number will not be used for login purposes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
