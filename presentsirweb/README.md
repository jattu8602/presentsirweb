# Present Sir - School Management System

Present Sir is a comprehensive school management system designed to help schools, colleges, and coaching centers manage their operations efficiently.

## Features

- **User Management**: Different user roles including admin, school, teacher, and student
- **Institution Management**: Register and manage schools, colleges, and coaching centers
- **Attendance Tracking**: Track student attendance efficiently
- **Fee Management**: Manage fee collection and generate reports
- **Performance Tracking**: Monitor student performance with comprehensive mark sheets
- **Timetable Management**: Create and manage class timetables

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Payments**: Razorpay integration
- **Email**: Resend for email notifications

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/presentsirweb.git
   cd presentsirweb
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your database credentials and other configuration.

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app`: Next.js app directory with pages and API routes
- `/components`: Reusable React components
- `/constants`: Application constants
- `/libs`: Utility functions and libraries
- `/middleware`: Custom middleware
- `/prisma`: Prisma schema and migrations
- `/public`: Static assets
- `/script`: Utility scripts
- `/store`: State management

## API Routes

- `/api/auth`: Authentication endpoints
- `/api/register`: Registration endpoints
- `/api/admin`: Admin-specific endpoints
- `/api/school`: School-specific endpoints

## Deployment

The application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please contact [your-email@example.com](mailto:your-email@example.com).
