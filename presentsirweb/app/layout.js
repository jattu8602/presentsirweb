import './globals.css'

export const metadata = {
  title: 'Present Sir - School Management System',
  description:
    'A complete solution for managing schools, colleges, and coaching centers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
