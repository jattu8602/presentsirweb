import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface SubscriptionPlan {
  name: string;
  price: string;
  features: string[];
  duration: number;
  type: "basic" | "pro";
  popular?: boolean;
}

export default function SubscriptionCard({ plan }: { plan: SubscriptionPlan }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
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
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Link href="/auth" className="w-full">
            <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
              Get Started
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
