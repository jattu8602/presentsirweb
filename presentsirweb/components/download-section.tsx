import { motion } from "framer-motion";
import { Phone, Info, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DownloadSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Present Sir Mobile App</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access your attendance and academic information on the go
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <School className="h-6 w-6 text-primary" />
                <CardTitle>Download Present Sir App</CardTitle>
              </div>
              <CardDescription>
                Access features for both students and teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">For Students</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your attendance and academic progress. Sign up using your mobile number and verify with OTP.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">For Teachers</h3>
                    <p className="text-sm text-muted-foreground">
                      Take attendance and manage your classes. Login with your institution email or mobile number.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="flex-1 sm:flex-initial" variant="outline">
                    <img src="/google-play.svg" alt="Google Play" className="h-5 mr-2" />
                    Download for Android
                  </Button>
                  <Button className="flex-1 sm:flex-initial" variant="outline">
                    <img src="/app-store.svg" alt="App Store" className="h-5 mr-2" />
                    Download for iOS
                  </Button>
                </div>

                <div className="flex items-start gap-2 bg-primary/5 p-4 rounded-lg">
                  <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm">
                    Note: Only students from registered institutions can access the app. Teachers need to verify their identity through secure authentication.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}