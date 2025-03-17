import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const imageVariants = {
  hover: {
    scale: 1.05,
    rotate: "2deg",
    transition: { duration: 0.3 }
  }
};

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-primary/5 to-primary/10 pt-16 overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Transform Your Institution's Management
            </h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-8"
              variants={itemVariants}
            >
              Streamline attendance tracking, manage student records, and generate
              comprehensive reports with our all-in-one platform.
            </motion.p>
            <motion.div 
              className="flex gap-4"
              variants={itemVariants}
            >
              <Link href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                  Get Started
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative perspective-1000"
          >
            <motion.div
              className="relative z-10"
              animate={{ 
                rotateY: [-5, 5, -5],
                rotateX: [2, -2, 2] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 6,
                ease: "easeInOut" 
              }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6"
                alt="Education Management"
                className="rounded-lg shadow-2xl"
                variants={imageVariants}
                whileHover="hover"
                style={{ transformStyle: "preserve-3d" }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-lg"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -right-4 -bottom-4 w-full h-full bg-primary/5 rounded-lg"
              animate={{
                rotate: [0, 2, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -left-4 -top-4 w-full h-full bg-primary/5 rounded-lg"
              animate={{
                rotate: [0, -2, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
    </div>
  );
}