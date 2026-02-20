import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import { useNavigate } from "react-router-dom";

function RefreshButton({ onRefresh }) {
  const [isRotating, setIsRotating] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const handleRefresh = () => {
    setIsRotating(true);
    showLoading();

    // Simulate refresh with fixed duration
    setTimeout(() => {
      navigate("/");
      setIsRotating(false);
      hideLoading();
    }, 2000); //  duration for refresh animation and navigation
  };

  return (
    <motion.button
      onClick={handleRefresh}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors refresh-button"
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 12px rgba(124, 42, 232, 0.6)",
      }}
      whileTap={{ scale: 0.9 }}
      disabled={isRotating}
    >
      <motion.div
        animate={
          isRotating
            ? {
                rotate: 360,
                color: [
                  "#670099",
                  "#7C2AE8",
                  "#00C4CC",
                  "#FFCC00",
                  "#FF6501",
                  "#670099",
                ],
              }
            : { rotate: 0 }
        }
        transition={{
          rotate: {
            duration: 1.5,
            ease: "linear",
            repeat: isRotating ? Infinity : 0,
          },
          color: {
            duration: 2,
            ease: "linear",
            repeat: isRotating ? Infinity : 0,
          },
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RefreshCw size={20} />
      </motion.div>
    </motion.button>
  );
}

export default RefreshButton;
