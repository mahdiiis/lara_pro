import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Edit, Clock, BookOpen, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";
import useNotificationToast from "../hooks/useNotificationToast";
import { useLoading } from "../context/LoadingContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

function Dashboard({ onCreateNew }) {
  const { user, getQuizCount, setAllQuizzes } = useAuth();
  const [quizzes, setQuizzes] = useState([]); // Keep this for displaying recent quizzes
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { notification, system } = useNotificationToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user) {
      fetchLastQuizzes();
    }
  }, [user]);

  const fetchLastQuizzes = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await axios.get(`${apiUrl}lastGames`, {
        params: {
          user_id: userId,
        },
      });

      if (response.status === 200) {
        setQuizzes(response.data.data);
      } else {
        notification.error("Failed to fetch last games");
      }
    } catch (error) {
      notification.error("Failed to fetch last games");
      console.error("Error fetching last games:", error);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew(); // Reset the quiz form data
    }
    navigate("/create", { replace: true });
  };

  const stats = [
    {
      label: t("total_quizzes"),
      value: getQuizCount(),
      icon: <BookOpen size={20} className="text-purple-main" />,
    },
  ];

  useEffect(() => {
    // Component initialization
  }, []);

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mb-8">
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-purple-light/30 to-transparent rounded-full -mr-20 -mt-20 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-cyan-light/30 to-transparent rounded-full -ml-20 -mb-20 blur-2xl" />

          <div className="relative z-10">
            <motion.h1
              className="text-3xl font-bold gradient-text mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {t("welcome").replace("hassan hachami", user?.name || "Teacher")}
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t("create_quiz_description")}
            </motion.p>
            <motion.button
              onClick={handleCreateNew}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Plus size={18} />
              {t("create_new_quiz")}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 dashboard-stats-grid"
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="glass-card p-6 hover-glow"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              </div>
              <motion.div
                className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                {stat.icon}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold gradient-text">
              {t("recent_quizzes")}
            </h2>
            <Link
              to="/games"
              className="text-purple-main dark:text-purple-light hover:underline text-sm"
            >
              {t("view_all")}
            </Link>
          </div>

          <motion.div
            key={quizzes.length} // Add key prop here
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {quizzes.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
              >
                <p className="text-gray-500 dark:text-gray-400">
                  {t("no_quizzes")}
                </p>
                <button
                  onClick={handleCreateNew}
                  className="text-purple-main dark:text-purple-light hover:underline mt-2 inline-block"
                >
                  {t("create_first_quiz")}
                </button>
              </motion.div>
            ) : (
              quizzes.map((quiz) => (
                <motion.div
                  key={quiz.quiz_id}
                  variants={itemVariants}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  whileHover={{
                    scale: 1.02,
                    boxShadow:
                      "0 10px 25px -5px rgba(124, 42, 232, 0.1), 0 10px 10px -5px rgba(124, 42, 232, 0.04)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers size={14} />
                          {quiz.number_of_levels || 0} Levels
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Game #{quiz.title.split("Game #")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
