import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Present Sir - School Management System',
  description:
    'A comprehensive management system for schools, colleges, and coaching centers',
}

export default function RootLayout({ children }) {
  return (
    <div className={inter.className}>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="text-2xl font-bold text-blue-600">
                  Present Sir
                </a>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/school"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  School
                </a>
                <a
                  href="/college"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  College
                </a>
                <a
                  href="/tution"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tution Center
                </a>
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a
                href="/auth"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
              >
                Login
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Present Sir</h3>
              <p className="text-gray-300 text-sm">
                A comprehensive school management system for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="/school" className="hover:text-white">
                    For Schools
                  </a>
                </li>
                <li>
                  <a href="/college" className="hover:text-white">
                    For Colleges
                  </a>
                </li>
                <li>
                  <a href="/tution" className="hover:text-white">
                    For Tution Centers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Email: info@presentsir.com</li>
                <li>Phone: +91 1234567890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Present Sir. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
