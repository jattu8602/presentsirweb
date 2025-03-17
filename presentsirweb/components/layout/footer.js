import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-12 px-4 md:px-6">
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
                <Link href="/school" className="hover:text-white">
                  For Schools
                </Link>
              </li>
              <li>
                <Link href="/college" className="hover:text-white">
                  For Colleges
                </Link>
              </li>
              <li>
                <Link href="/tution" className="hover:text-white">
                  For Tution Centers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link href="/docs" className="hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white">
                  Support
                </Link>
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
  )
}
