import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "John Smith",
    role: "School Principal",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    content: "Present Sir has revolutionized how we track attendance. The smart device integration is fantastic!",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    role: "College Administrator",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    content: "The analytics and reporting features have made our administrative tasks so much easier.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Coaching Center Director",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    content: "The fee management system is exactly what we needed. Highly recommended!",
    rating: 5
  }
];

const appScreenshots = [
  "/screenshots/WhatsApp Image 2025-03-09 at 10.07.37 AM.jpeg",
  "/screenshots/WhatsApp Image 2025-03-09 at 10.07.37 AM (1).jpeg",
  "/screenshots/WhatsApp Image 2025-03-09 at 10.07.37 AM (2).jpeg",
  "/screenshots/WhatsApp Image 2025-03-09 at 10.07.38 AM (1).jpeg",
  "/screenshots/WhatsApp Image 2025-03-09 at 10.07.38 AM.jpeg"
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.3
    }
  }
};

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied institutions using Present Sir
          </p>
        </motion.div>

        {/* App Screenshots Showcase */}
        <div className="relative h-[600px] mb-12">
          <div className="max-w-[1200px] mx-auto relative">
            {appScreenshots.map((screenshot, index) => (
              <motion.div
                key={index}
                className="absolute transform-gpu"
                style={{
                  left: `${(100 / (appScreenshots.length + 1)) * (index + 1)}%`,
                  transform: 'translateX(-50%)',
                  width: "200px",
                  height: "400px",
                  perspective: "1000px",
                  zIndex: index === Math.floor(appScreenshots.length / 2) ? 5 : 1,
                  transformStyle: "preserve-3d"
                }}
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, index % 2 === 0 ? 5 : -5, 0],
                  opacity: 1,
                  scale: index === Math.floor(appScreenshots.length / 2) ? 1.2 : 1
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 10 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    src={screenshot}
                    alt="Present Sir App Screenshot"
                    className="w-full h-full object-cover"
                  />
                  {/* Reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile-responsive layout */}
        <div className="hidden md:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 space-x-4">
            {appScreenshots.map((screenshot, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 w-64 h-[500px]"
              >
                <img
                  src={screenshot}
                  alt="Present Sir App Screenshot"
                  className="w-full h-full object-cover rounded-3xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}