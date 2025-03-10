# Present Sir - Education Management System

A modern education management platform built with Node.js, React, and MongoDB.

## Features

- School Registration and Management
- Student Attendance Tracking
- Fee Management
- Academic Reports
- Admin Dashboard with Analytics
- Google Authentication
- Payment Integration with Razorpay

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Razorpay
- **Email**: Nodemailer
- **File Storage**: Cloudinary

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/present-sir.git
cd present-sir
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="your_mongodb_url"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"

# NextAuth
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_DEFAULT_PASSWORD="default_password"

# Razorpay
RAZORPAY_KEY_ID="your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
```

4. Run the development server:

```bash
npm run dev
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
