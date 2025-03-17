import { useState } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export interface UseToastReturn {
  toast: (props: Omit<Toast, 'id'>) => void
  toasts: Toast[]
  dismiss: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({
    title,
    description,
    variant = 'default',
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, title, description, variant }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  return {
    toast,
    toasts,
    dismiss: (id: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== id)),
  }
}
