import Link from 'next/link'
import { Button } from '../ui/button'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Present Sir</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/school"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            School
          </Link>
          <Link
            href="/college"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            College
          </Link>
          <Link
            href="/tution"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Tution
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Register</Button>
          </Link>
          <Button className="md:hidden" variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
