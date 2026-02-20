import { motion } from "framer-motion";
import { useEffect } from "react";

function LoadingSpinner() {
  // Prevent scrolling when loading is active
  useEffect(() => {
    // Save the current overflow value
    //const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling
    document.body.style.overflow = "hidden";

    // Restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md z-50">
      <div className="flex flex-col items-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer spinning ring with gradient colors */}
          <motion.div
            className="w-40 h-40 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #670099, #7C2AE8, #ADA6F8, #990099, #87F0F4, #00C4CC, #0BB3C5, #FFCC00, #FD9400, #FF6501, #670099)",
              backgroundSize: "150% 150%",
              boxShadow: "0 0 30px rgba(124, 42, 232, 0.3)",
            }}
            animate={{
              rotate: 360,
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              backgroundPosition: {
                duration: 5,
                repeat: Infinity,
                ease: "linear",
                repeatType: "reverse",
              },
            }}
          >
            {/* Inner white/dark circle */}
            <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              {/* Purple circle + logo container */}
              <motion.div
                className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-deep to-purple-main overflow-hidden"
                initial={{ rotate: 0 }}
                animate={{
                  rotate: [0, -5, 5, -5, 0],
                  boxShadow: [
                    "0 0 10px rgba(124, 42, 232, 0.5)",
                    "0 0 20px rgba(124, 42, 232, 0.7)",
                    "0 0 10px rgba(124, 42, 232, 0.5)",
                  ],
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
              >
                <motion.img
                  src="/assets/file.png"
                  alt="2pi Logo"
                  className="h-full w-full object-cover"
                  animate={{
                    scale: [1, 1.1, 1],
                    filter: [
                      "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                      "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
                      "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.h3
            className="text-2xl font-bold mb-3"
            style={{
              background: "linear-gradient(to right, #670099, #7C2AE8)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            animate={{
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Loading 2pi Dashboard
          </motion.h3>

          <motion.div
            className="flex space-x-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    dot === 0
                      ? "#670099"
                      : dot === 1
                      ? "#00C4CC"
                      : dot === 2
                      ? "#FFCC00"
                      : "#FF6501",
                }}
                initial={{ opacity: 0.3, y: 0 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  y: [0, -5, 0],
                  boxShadow: [
                    "0 0 0px rgba(124, 42, 232, 0)",
                    "0 0 10px rgba(124, 42, 232, 0.5)",
                    "0 0 0px rgba(124, 42, 232, 0)",
                  ],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: dot * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
