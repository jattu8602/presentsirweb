import { motion } from 'framer-motion'
import HeroSection from '@/components/hero-section'
import FeaturesSection from '@/components/features-section'
import SubscriptionCard from '@/components/subscription-card'
import DevicePricingSection from '@/components/device-pricing-section'
import DownloadSection from '@/components/download-section'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import TestimonialsSection from '@/components/testimonials-section'
import { useEffect } from 'react'

// Define the type to match what SubscriptionCard expects
type PlanType = 'basic' | 'pro'

interface SubscriptionPlan {
  name: string
  price: string
  features: string[]
  duration: number
  type: PlanType
  popular?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Basic Plan - 1 Year',
    price: '$99/year',
    features: ['Attendance Management', 'Basic Reports', 'Email Support'],
    duration: 1,
    type: 'basic',
  },
  {
    name: 'Basic Plan - 3 Years',
    price: '$89/year',
    features: ['Attendance Management', 'Basic Reports', 'Email Support'],
    duration: 3,
    type: 'basic',
  },
  {
    name: 'Pro Plan',
    price: '$199/year',
    features: [
      'Everything in Basic',
      'Fee Management',
      'Advanced Reports',
      '24/7 Support',
      'Student Performance Analytics',
    ],
    duration: 1,
    type: 'pro',
    popular: true,
  },
]

export default function LandingPage() {
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setLocation('/admin/dashboard')
      } else {
        setLocation('/dashboard')
      }
    }
  }, [user, setLocation])

  return (
    <div className="min-h-screen">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/logo.png" alt="Present Sir Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Present Sir</h1>
          </motion.div>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button>Login / Register</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      <HeroSection />
      <FeaturesSection />
      <DevicePricingSection />
      <TestimonialsSection />
      <DownloadSection />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your institution. All plans include
              access to our upcoming attendance device integration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <SubscriptionCard key={index} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p>Email: support@presentsir.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
