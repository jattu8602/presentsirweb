import { motion } from "framer-motion";
import { 
  UserCheck, 
  CalendarCheck, 
  FileText, 
  CreditCard,
  AlertTriangle,
  BarChart,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart Attendance",
    description: "Take attendance quickly with our upcoming smart device integration",
    color: "from-blue-500/20 to-blue-500/10"
  },
  {
    icon: FileText,
    title: "Comprehensive Reports",
    description: "Generate detailed reports for students' attendance and performance",
    color: "from-green-500/20 to-green-500/10"
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    description: "Track and manage student fee payments efficiently",
    color: "from-purple-500/20 to-purple-500/10"
  },
  {
    icon: AlertTriangle,
    title: "Incident Reporting",
    description: "Record and track student behavioral incidents",
    color: "from-yellow-500/20 to-yellow-500/10"
  },
  {
    icon: UserCheck,
    title: "Student Profiles",
    description: "Maintain detailed student records and academic history",
    color: "from-red-500/20 to-red-500/10"
  },
  {
    icon: BarChart,
    title: "Analytics",
    description: "Get insights into attendance patterns and student performance",
    color: "from-indigo-500/20 to-indigo-500/10"
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Your data is encrypted and securely stored",
    color: "from-teal-500/20 to-teal-500/10"
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant notifications and live attendance updates",
    color: "from-orange-500/20 to-orange-500/10"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const cardVariants = {
  hover: {
    scale: 1.05,
    rotateX: 5,
    rotateY: 5,
    transition: {
      duration: 0.3
    }
  }
};

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Powerful Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your institution efficiently
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="perspective-1000"
            >
              <motion.div
                variants={cardVariants}
                className={`p-6 rounded-lg border bg-gradient-to-br ${feature.color} backdrop-blur-sm 
                  hover:shadow-xl transition-shadow duration-300 h-full 
                  relative overflow-hidden`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  animate={{
                    opacity: [0.5, 0.3, 0.5],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />

                <feature.icon className="h-12 w-12 text-primary mb-4 relative z-10" />
                <h3 className="text-xl font-semibold mb-2 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground relative z-10">{feature.description}</p>

                {/* Decorative corner */}
                <motion.div
                  className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}