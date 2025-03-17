export const siteConfig = {
  name: 'Present Sir',
  description:
    'A comprehensive school management system for schools, colleges, and coaching centers.',
  url: 'https://presentsir.com',
  ogImage: 'https://presentsir.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/presentsir',
    github: 'https://github.com/presentsir',
  },
  contactEmail: 'info@presentsir.com',
  supportPhone: '+91 1234567890',
}

export const features = [
  {
    title: 'Attendance Management',
    description:
      'Track student attendance efficiently, generate reports, and send notifications to parents.',
    icon: 'calendar',
  },
  {
    title: 'Fee Management',
    description:
      'Manage student fees, generate invoices, and keep track of payments.',
    icon: 'credit-card',
  },
  {
    title: 'Performance Tracking',
    description:
      'Record and analyze student performance, generate report cards, and identify improvement areas.',
    icon: 'bar-chart',
  },
  {
    title: 'Timetable Management',
    description:
      'Create and manage class timetables, assign teachers, and handle schedule changes.',
    icon: 'clock',
  },
]

export const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small coaching centers and tutors',
    price: '₹999',
    duration: 'per month',
    features: [
      'Up to 100 students',
      'Basic attendance tracking',
      'Fee management',
      'Email support',
      '1 admin account',
    ],
    highlighted: false,
    button: {
      text: 'Get Started',
      href: '/auth/register',
    },
  },
  {
    name: 'Professional',
    description: 'Ideal for medium-sized schools and colleges',
    price: '₹2,499',
    duration: 'per month',
    features: [
      'Up to 500 students',
      'Advanced attendance with biometrics',
      'Complete fee management',
      'Performance analytics',
      'Email and phone support',
      '5 admin accounts',
    ],
    highlighted: true,
    button: {
      text: 'Get Started',
      href: '/auth/register',
    },
  },
  {
    name: 'Enterprise',
    description: 'For large educational institutions',
    price: '₹4,999',
    duration: 'per month',
    features: [
      'Unlimited students',
      'Advanced attendance with biometrics',
      'Complete fee management',
      'Advanced analytics and reporting',
      'Priority support 24/7',
      'Unlimited admin accounts',
      'Custom integrations',
    ],
    highlighted: false,
    button: {
      text: 'Contact Sales',
      href: '/contact',
    },
  },
]
