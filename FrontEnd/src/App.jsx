import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  LanguageProvider,
  useLanguageContext,
} from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import Navbar from "./components/Navbar";

// ======
import InitialForm from "./components/InitialForm";
import Preview from "./components/Preview";
// ======

import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PageTransition from "./components/PageTransition";

// ======
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// ======

import AuthRoute from "./components/AuthRoute";
import Games from "./components/Games";
import Game from "./components/Game";
import ResetPassword from "./pages/ResetPassword"; // Added import for ResetPassword component
import TermsOfService from "./pages/TermsOfService"; // Added import for TermsOfService component
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Added import for PrivacyPolicy component
import { useLanguage } from "./hooks/useLanguage"; // Add import for useLanguage

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function AppContent({ userLoading }) {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage(); // t function for translations
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setAllQuizzes } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Set authentication state based on token and user existence
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token && !!user);
  }, [user]);

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || location.pathname !== "/") return;
        const userId = user?.id;
        const response = await axios.get(`${apiUrl}select`, {
          params: { user_id: userId },
        });
        if (response.status === 200) {
          setAllQuizzes(response.data.data);
        } else {
          console.error("Failed to fetch all quizzes");
        }
      } catch (error) {
        console.error("Error fetching all quizzes:", error);
      }
    };

    fetchAllQuizzes();
  }, [location.pathname]);

  const [quizData, setQuizData] = useState(() => {
    const savedData = localStorage.getItem("quizFormData");
    return savedData
      ? JSON.parse(savedData)
      : {
          course: "",
          topic: "",
          gameNumber: "",
          numLevels: "2",
          levels: [],
          player_info: {
            current_level: 1,
            lives: 3,
            score: 0,
          },
        };
  });

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    localStorage.setItem("quizFormData", JSON.stringify(quizData));
  }, [quizData]);

  const handleQuizDataChange = (newData) => {
    setQuizData(newData);
  };

  const resetQuizForm = () => {
    setQuizData({
      course: "",
      topic: "",
      gameNumber: "",
      numLevels: "2",
      levels: [],
      player_info: {
        current_level: 1,
        lives: 3,
        score: 0,
      },
    });
    setCurrentStep(0);
    localStorage.removeItem("quizFormData");
  };

  const handleGoToPreview = () => {
    setCurrentStep(1);
  };

  const handleBackToInitial = () => {
    setCurrentStep(0);
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <InitialForm
          onDataChange={handleQuizDataChange}
          onGoToPreview={handleGoToPreview}
        />
      );
    }
    return (
      <div className="space-y-4">
        <Preview
          data={quizData}
          onDataChange={handleQuizDataChange}
          onCreateNew={resetQuizForm}
        />
        <div className="flex justify-start items-center mt-6">
          <motion.button
            onClick={handleBackToInitial}
            className="btn-secondary flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} /> {t("back_to_levels")}
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-deep/10 via-purple-main/5 to-cyan-main/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200 overflow-auto">
      {isAuthenticated &&
        location.pathname !== "/login" &&
        location.pathname !== "/signup" && (
          <Navbar onCreateNew={resetQuizForm} />
        )}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  userLoading={userLoading}
                />
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/reset-password"
              element={<ResetPassword />} // Added route for ResetPassword component
            />
            <Route
              path="/"
              element={
                <AuthRoute isAuthenticated={isAuthenticated}>
                  {/* Pass resetQuizForm to Dashboard so its "Create New Quiz" button works like Preview */}
                  <PageTransition>
                    <Dashboard onCreateNew={resetQuizForm} />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/create"
              element={
                <AuthRoute isAuthenticated={isAuthenticated}>
                  <motion.div
                    key={currentStep}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                    className="max-w-4xl mx-auto"
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AuthRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthRoute isAuthenticated={isAuthenticated}>
                  <PageTransition>
                    <Settings />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/games"
              element={
                <AuthRoute isAuthenticated={isAuthenticated}>
                  <PageTransition>
                    <Games />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/game/:game_id"
              element={
                <AuthRoute isAuthenticated={isAuthenticated}>
                  <PageTransition>
                    <Game />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/terms-of-service"
              element={
                <PageTransition>
                  <TermsOfService />
                </PageTransition>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PageTransition>
                  <PrivacyPolicy />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
            />
          </Routes>
        </AnimatePresence>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "16px",
            border: "1px solid #eee",
          },
          success: {
            iconTheme: {
              primary: "#00C4CC",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#990099",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  const { userLoading } = useAuth(); // Remove loading from the destructuring
  return (
    <NotificationProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Always render AppContent without the loading condition */}
        <AppContent userLoading={userLoading} />
      </Router>
    </NotificationProvider>
  );
}

export default App;
