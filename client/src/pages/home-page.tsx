import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Student, Fee, Report } from "@shared/schema";

const statCards = [
  {
    title: "Total Students",
    icon: Users,
    query: "students",
    value: (data: Student[]) => data.length,
    loading: "Loading students...",
  },
  {
    title: "Today's Attendance",
    icon: Calendar,
    query: "attendance/today",
    value: (data: { present: number; total: number }) =>
      `${data.present}/${data.total}`,
    loading: "Calculating attendance...",
  },
  {
    title: "Pending Fees",
    icon: CreditCard,
    query: "fees/pending",
    value: (data: Fee[]) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(data.reduce((sum, fee) => sum + fee.amount, 0)),
    loading: "Calculating fees...",
  },
  {
    title: "Recent Reports",
    icon: FileText,
    query: "reports/recent",
    value: (data: Report[]) => data.length,
    loading: "Loading reports...",
  },
];

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Present Sir</h1>
            <span className="text-muted-foreground">
              {user?.institutionName}
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your institution</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivityList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Weekly attendance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceChart />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, icon: Icon, query, value, loading }: any) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/${query}`],
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">{value(data)}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentActivityList() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/activity/recent"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((activity: any, i: number) => (
        <div key={i} className="flex items-center gap-4 p-2 rounded hover:bg-accent">
          <div className="p-2 rounded-full bg-primary/10">
            <activity.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{activity.description}</p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/attendance/trend"],
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  return (
    <div className="h-[200px] flex items-center justify-center">
      <BarChart className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground ml-2">Chart will be displayed here</p>
    </div>
  );
}
