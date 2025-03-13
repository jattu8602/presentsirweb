import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from '@/hooks/use-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setToastFunction } from './lib/api'
import { useToast } from './components/ui/use-toast'

const queryClient = new QueryClient()

// Create a component to initialize the toast function
function ToastInitializer() {
  const { toast } = useToast()

  // Set the toast function for the API service
  React.useEffect(() => {
    setToastFunction(toast)
  }, [toast])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
    <ToastInitializer />
  </React.StrictMode>
)
