import { useState, useEffect } from "react";
import { Menu, X, Home, Edit, Settings, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLoading } from "../context/LoadingContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RefreshButton from "./RefreshButton";
import LanguageSelector from "./LanguageSelector";
import NotificationToggle from "./NotificationToggle";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";
import useNotificationToast from "../hooks/useNotificationToast";
import axios from "axios";

function Navbar({ onCreateNew }) {
  const { showLoading, hideLoading } = useLoading();
  const { user, logout, profileImage, refreshUserData } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { notification } = useNotificationToast();
  const [imageKey, setImageKey] = useState(Date.now());

  // Add useEffect to refresh the image when profileImage changes
  useEffect(() => {
    // Force re-render of the image component when profileImage changes
    setImageKey(Date.now());
  }, [profileImage, user?.profile_image]);

  // Add event listener for profile image updates
  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      console.log("Profile image updated event received");
      // Update the key to force image refresh
      setImageKey(event.detail.timestamp || Date.now());

      // Optionally refresh user data from the server
      if (refreshUserData) {
        refreshUserData().then(() => {
          console.log("User data refreshed after profile image update");
        });
      }
    };

    // Listen for the custom event
    window.addEventListener("profileImageUpdated", handleProfileImageUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        handleProfileImageUpdate
      );
    };
  }, [refreshUserData]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleRefresh = () => {
    showLoading();
    setTimeout(() => {
      hideLoading();
      notification.success(t("success"));
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Replace navigate with hard refresh
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleHomeClick = () => {
    if (onCreateNew) {
      onCreateNew();
    }
    navigate("/", { replace: true });
  };

  // Function to ensure image URL always has a cache-busting parameter
  const getProfileImageUrl = () => {
    if (profileImage) {
      // Check if it's a data URI (base64 encoded image)
      if (profileImage.startsWith("data:image/")) {
        return profileImage;
      }
      // Use the profileImage from AuthContext which already has the full URL
      return `${profileImage}${
        profileImage.includes("?") ? "&" : "?"
      }t=${imageKey}`;
    } else if (user?.profile_image) {
      // Check if it's a data URI (base64 encoded image)
      if (user.profile_image.startsWith("data:image/")) {
        return user.profile_image;
      }
      // Fallback to user.profile_image if profileImage state is not set
      const baseUrl = user.profile_image.startsWith("/")
        ? `${import.meta.env.VITE_API_URL.replace("/api/", "")}${
            user.profile_image
          }`
        : user.profile_image;
      return `${baseUrl}?t=${imageKey}`;
    } else {
      // Default avatar if no image is available
      return `https://ui-avatars.com/api/?name=${
        user?.name || "User"
      }&background=7C2AE8&color=fff`;
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-lg backdrop-filter sticky top-0 z-50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-purple-deep to-purple-main overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/assets/file.png"
                alt="2pi Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.h1
              className="text-xl md:text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              2pi {t("settings.dashboard")}
            </motion.h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 mr-4">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-purple-main">
                <img
                  key={`nav-profile-${imageKey}`}
                  src={getProfileImageUrl()}
                  alt={user?.name || "User"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${
                      user?.name || "User"
                    }&background=7C2AE8&color=fff`;
                  }}
                />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name || t("settings.teacher")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleHomeClick}
              className={`nav-link flex items-center gap-2 ${
                location.pathname === "/"
                  ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                  : ""
              }`}
            >
              <Home
                className="text-purple-main dark:text-purple-light"
                size={18}
              />
              {t("settings.home")}
            </button>
            <Link
              to="/create"
              className={`nav-link flex items-center gap-2 ${
                location.pathname === "/create"
                  ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                  : ""
              }`}
            >
              <Edit
                className="text-purple-main dark:text-purple-light"
                size={18}
              />
              {t("settings.createQuiz")}
            </Link>
            <Link
              to="/settings"
              className={`nav-link flex items-center gap-2 ${
                location.pathname === "/settings"
                  ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                  : ""
              }`}
            >
              <Settings
                className="text-purple-main dark:text-purple-light"
                size={18}
              />
              {t("settings.settings")}
            </Link>

            <LanguageSelector />
            <NotificationToggle />
            <NotificationCenter />
            <RefreshButton onRefresh={handleRefresh} />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <LanguageSelector />
            <NotificationToggle />
            <NotificationCenter />
            <RefreshButton onRefresh={handleRefresh} />
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile User Profile */}
              <div className="flex items-center gap-3 p-3 mb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-purple-main">
                  <img
                    key={`nav-mobile-profile-${imageKey}`}
                    src={getProfileImageUrl()}
                    alt={user?.name || "User"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${
                        user?.name || "User"
                      }&background=7C2AE8&color=fff`;
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || t("settings.teacher")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <Link
                to="/"
                className={`block py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-main dark:hover:text-purple-light ${
                  location.pathname === "/"
                    ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                    : ""
                }`}
                onClick={() => {
                  toggleMobileMenu();
                  handleHomeClick();
                }}
              >
                <div className="flex items-center gap-3">
                  <Home size={18} />
                  {t("settings.home")}
                </div>
              </Link>
              <Link
                to="/create"
                className={`block py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-main dark:hover:text-purple-light ${
                  location.pathname === "/create"
                    ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                    : ""
                }`}
                onClick={toggleMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Edit size={18} />
                  {t("settings.createQuiz")}
                </div>
              </Link>
              <Link
                to="/settings"
                className={`block py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-main dark:hover:text-purple-light ${
                  location.pathname === "/settings"
                    ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
                    : ""
                }`}
                onClick={toggleMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  {t("settings.settings")}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  {t("settings.logout")}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
