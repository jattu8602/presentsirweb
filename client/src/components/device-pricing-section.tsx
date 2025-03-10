import { motion } from "framer-motion";
import { Check, Smartphone, Wifi, Clock, Shield } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const devicePlans = [
  {
    name: "Basic Device",
    price: "$299",
    features: [
      "Quick attendance scanning",
      "Battery life: 8 hours",
      "Basic reporting",
      "USB connectivity",
      "1 year warranty"
    ],
    popular: false
  },
  {
    name: "Pro Device",
    price: "$499",
    features: [
      "Ultra-fast scanning",
      "Battery life: 12 hours",
      "Advanced analytics",
      "WiFi + USB connectivity",
      "Real-time sync",
      "Customizable buttons",
      "2 years warranty",
      "Priority support"
    ],
    popular: true
  }
];

export default function DevicePricingSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Present Sir Device</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform attendance tracking with our smart device. Choose the perfect device for your institution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {devicePlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute top-4 right-4" variant="default">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary">{plan.price}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
