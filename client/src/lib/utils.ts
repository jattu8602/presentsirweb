import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names and merges them according to Tailwind's rules
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
