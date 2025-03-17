import { useState, ReactNode } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import {
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Home,
  School,
  Users,
  BookOpen,
  Settings,
  DollarSign,
  BarChart,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setLocation] = useLocation()
  const { user, logoutMutation } = useAuth()
  const { toast } = useToast()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    {
      name: 'Pending Schools',
      href: '/admin/schools/pending',
      icon: AlertCircle,
    },
    {
      name: 'Approved Schools',
      href: '/admin/schools/approved',
      icon: CheckCircle,
    },
    { name: 'All Schools', href: '/admin/schools', icon: School },
    { name: 'Users Management', href: '/admin/users', icon: Users },
    { name: 'Pricing Plans', href: '/admin/pricing', icon: DollarSign },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Support', href: '/admin/support', icon: HelpCircle },
  ]

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminToken')
      setLocation('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Get initials for avatar
  const getInitials = (name?: string): string => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center">
              <img
                src="/present-sir-logo.png"
                alt="Present Sir Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'%3E%3C/path%3E%3Cpolyline points='22 4 12 14.01 9 11.01'%3E%3C/polyline%3E%3C/svg%3E"
                }}
              />
              <span className="ml-2 text-lg font-semibold">Admin Panel</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                {item.name === 'Pending Schools' && (
                  <Badge className="ml-auto" variant="destructive">
                    New
                  </Badge>
                )}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 md:ml-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          {/* User tools */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">Notifications</span>
                  <Button variant="ghost" size="sm">
                    Mark all as read
                  </Button>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-3">
                  <div>
                    <p className="font-medium">New School Registration</p>
                    <p className="text-xs text-muted-foreground">
                      A new school "ABC Public School" has registered and is
                      awaiting approval.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-3">
                  <div>
                    <p className="font-medium">Subscription Renewed</p>
                    <p className="text-xs text-muted-foreground">
                      XYZ International School has renewed their PRO
                      subscription.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-3">
                  <div>
                    <p className="font-medium">Payment Failed</p>
                    <p className="text-xs text-muted-foreground">
                      Payment for Little Angels School failed. Action required.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">{children}</main>
      </div>
    </div>
  )
}
