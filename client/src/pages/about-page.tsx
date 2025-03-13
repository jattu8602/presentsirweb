import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Mail,
  Phone,
  Globe,
  FileText,
  HelpCircle,
  Book,
  Video,
  LifeBuoy,
  Users,
  Headset,
  CheckCircle2,
} from 'lucide-react'

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              About PresentSir
            </h2>
            <p className="text-muted-foreground">
              Learn more about our platform and get help
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to PresentSir</CardTitle>
                <CardDescription>
                  The ultimate school management solution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Our Story</h3>
                    <p className="text-muted-foreground">
                      PresentSir was founded in 2022 with a simple mission: to
                      transform the way educational institutions manage their
                      day-to-day operations. We wanted to create a comprehensive
                      yet easy-to-use platform that would free educators from
                      administrative burdens, allowing them to focus on what
                      matters most - teaching and learning.
                    </p>
                    <p className="text-muted-foreground mt-4">
                      Today, PresentSir is serving hundreds of schools across
                      India, helping school administrators, teachers, and
                      parents collaborate seamlessly to provide the best
                      educational experience for students.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="p-6 rounded-lg bg-muted w-full max-w-xs text-center">
                      <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-medium mb-2">Our Impact</h4>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold">500+</p>
                        <p className="text-sm text-muted-foreground">
                          Schools using PresentSir
                        </p>
                      </div>
                      <div className="space-y-1 mt-4">
                        <p className="text-3xl font-bold">50,000+</p>
                        <p className="text-sm text-muted-foreground">
                          Students managed
                        </p>
                      </div>
                      <div className="space-y-1 mt-4">
                        <p className="text-3xl font-bold">5,000+</p>
                        <p className="text-sm text-muted-foreground">
                          Teachers empowered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground">
                    At PresentSir, we believe that every educational institution
                    deserves access to powerful, intuitive management tools. Our
                    mission is to streamline administrative tasks, enhance
                    communication between schools and families, and ultimately
                    improve educational outcomes through technology that's
                    accessible to all.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="bg-primary/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">
                        Simplify Administration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Reduce paperwork and manual processes with our
                        comprehensive school management tools.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="bg-primary/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">
                        Enhance Communication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Foster better collaboration between teachers, students,
                        and parents through integrated communication channels.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="bg-primary/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">
                        Drive Better Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Use data-driven insights to make informed decisions that
                        improve educational quality and student success.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          support@presentsir.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          +91 98765 43210
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <p className="text-sm text-muted-foreground">
                          www.presentsir.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Office</p>
                        <p className="text-sm text-muted-foreground">
                          PresentSir Headquarters, Bangalore, India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
                <CardDescription>
                  Discover all the powerful tools PresentSir offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Class Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Organize students by class and section</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Assign teachers to specific classes</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Track class-wise performance metrics</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Manage student records efficiently</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Attendance Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Mark daily attendance with ease</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Generate detailed attendance reports</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Track attendance patterns over time</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Notify parents of absences</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Timetable Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Create class-specific timetables</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Assign subjects and teachers to periods</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Handle special schedules and events</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>View teacher workload distribution</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Examination & Grading
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Record and manage student marks</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Generate report cards and transcripts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Analyze performance with visual charts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Track subject-wise progress</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Fee Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Generate fee schedules & invoices</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Track payments and dues</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Support multiple payment methods</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Generate financial reports</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Communication Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Send announcements and notices</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Parent-teacher messaging system</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Event calendar and reminders</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>Email and SMS notifications</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>
                  Get help and learn how to use PresentSir effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Book className="h-5 w-5 mr-2" />
                        Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comprehensive guides and tutorials to help you make the
                        most of PresentSir
                      </p>
                      <Button variant="outline" className="w-full">
                        View Documentation
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        Video Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Step-by-step video guides covering all features of the
                        platform
                      </p>
                      <Button variant="outline" className="w-full">
                        Watch Tutorials
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2" />
                        Knowledge Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find answers to common questions and troubleshooting
                        guides
                      </p>
                      <Button variant="outline" className="w-full">
                        Browse Knowledge Base
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Headset className="h-5 w-5 mr-2" />
                        Customer Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Contact our dedicated support team for personalized
                        assistance
                      </p>
                      <Button className="w-full">Contact Support</Button>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Support Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Standard Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday
                      </p>
                      <p className="text-sm text-muted-foreground">
                        9:00 AM - 6:00 PM IST
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Email and chat support for all customers
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Premium Support</h4>
                      <p className="text-sm text-muted-foreground">
                        24/7 Support
                      </p>
                      <p className="text-sm text-muted-foreground">
                        All days including holidays
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Email, chat, and phone support for Premium plan
                        subscribers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about PresentSir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      What types of institutions can use PresentSir?
                    </h3>
                    <p className="text-muted-foreground">
                      PresentSir is designed for K-12 schools, colleges, and
                      coaching institutes of all sizes. Our platform is flexible
                      enough to accommodate various educational settings, from
                      small private schools to large educational networks.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      How secure is my institution's data?
                    </h3>
                    <p className="text-muted-foreground">
                      Data security is our top priority. PresentSir employs
                      industry-standard encryption protocols, regular security
                      audits, and strict access controls. We are compliant with
                      relevant data protection regulations and never share your
                      data with third parties without explicit permission.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      Can I customize PresentSir to match my institution's
                      needs?
                    </h3>
                    <p className="text-muted-foreground">
                      Yes, PresentSir offers various customization options. You
                      can configure modules based on your requirements, set up
                      custom roles and permissions, and even customize reports
                      and forms. For more extensive customizations, our Premium
                      plan includes API access and dedicated implementation
                      support.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      What kind of training and onboarding support do you
                      provide?
                    </h3>
                    <p className="text-muted-foreground">
                      We offer comprehensive onboarding support to ensure a
                      smooth transition to PresentSir. This includes initial
                      setup assistance, data migration help, and training
                      sessions for administrators and staff. Our Standard and
                      Premium plans also include dedicated onboarding
                      specialists to guide you through the process.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      Can PresentSir integrate with other software we currently
                      use?
                    </h3>
                    <p className="text-muted-foreground">
                      PresentSir offers integration capabilities with common
                      educational tools and systems. We support integration with
                      payment gateways, SMS services, email providers, and
                      learning management systems. Premium plan users get access
                      to our API for custom integrations with specialized
                      software.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      What if I need help or encounter issues while using
                      PresentSir?
                    </h3>
                    <p className="text-muted-foreground">
                      Our support team is always ready to help. All users have
                      access to our extensive knowledge base, video tutorials,
                      and email support. Standard and Premium plan users also
                      get chat support, while Premium users enjoy priority 24/7
                      support including phone assistance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
