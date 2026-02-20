import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Moon,
  Sun,
  Bell,
  BellOff,
  Globe,
  User,
  Lock,
  Mail,
  Edit,
  LogOut,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import toast from "react-hot-toast";
import useNotificationToast from "../hooks/useNotificationToast";
import { useNavigate } from "react-router-dom";
import { compressImage } from "../utils/imageUtils";

function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const {
    user,
    updateUserProfile,
    updateUserPassword,
    updateProfileImage,
    userLoading,
    logout,
  } = useAuth();
  const { notificationVisibility, setNotificationVisibility, addNotification } =
    useNotifications();
  const { system, notification } = useNotificationToast();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    role: "Teacher",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [lastUpdateAttempt, setLastUpdateAttempt] = useState({
    profile: 0,
    password: 0,
    photo: 0,
  });

  const canAttemptUpdate = (type) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastUpdateAttempt[type];
    const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds
    return timeSinceLastAttempt >= twoMinutesInMs;
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        role: "Teacher",
      });
    } else {
      setProfileForm({
        name: "",
        email: "",
        role: "Teacher",
      });
    }
  }, [user]);

  // Add this function to force image refresh
  const forceImageRefresh = (src) => {
    // Add a cache-busting parameter to the image URL
    if (!src) return "";

    // Handle data URLs (base64 encoded images)
    if (src.startsWith("data:image/")) {
      return src;
    }

    // Handle regular URLs with cache busting
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}t=${new Date().getTime()}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Always ensure loading state is cleared, even if there's an uncaught error
      let loadingToastId = null;

      try {
        // Check if 2 minutes have passed since last attempt
        if (!canAttemptUpdate("photo")) {
          const waitTimeRemaining = Math.ceil(
            (2 * 60 * 1000 - (Date.now() - lastUpdateAttempt.photo)) / 1000 / 60
          );
          throw new Error(
            `Please wait approximately ${waitTimeRemaining} more minute(s) before trying again.`
          );
        }

        // Show loading notification and keep the ID to dismiss it later
        loadingToastId = system.loading("Processing profile image...");

        // Use a very small image dimension for profile pics to ensure it works reliably
        const compressedFile = await compressImage(file, {
          maxWidth: 200, // Even smaller dimensions
          maxHeight: 200, // Even smaller dimensions
          quality: 0.4, // Very low quality for profile pics is fine
        });

        console.log(
          "Compressed size:",
          Math.round(compressedFile.size / 1024),
          "KB"
        );

        // Update the profile image
        const result = await updateProfileImage(compressedFile);

        // Update last attempt timestamp on success
        setLastUpdateAttempt((prev) => ({ ...prev, photo: Date.now() }));

        // Clear the loading notification
        if (loadingToastId) toast.dismiss(loadingToastId);

        // Show success notification that auto-dismisses after 3 seconds
        system.success("Profile image updated successfully!", {
          duration: 3000,
          position: "top-center",
        });

        // Add a notification to the notification center
        addNotification(
          "Profile Photo Updated",
          "Your profile photo has been successfully updated.",
          "success",
          true,
          30000
        );

        // Force a visual refresh of the component and tell browsers to reload the image
        setTimeout(() => {
          // Dispatch a custom event to notify navbar of the image change
          window.dispatchEvent(
            new CustomEvent("profileImageUpdated", {
              detail: { timestamp: Date.now() },
            })
          );

          // Trigger a state update to refresh this component
          setProfileForm({ ...profileForm });

          // Force browser cache refresh
          window.dispatchEvent(new Event("resize"));
        }, 300);
      } catch (error) {
        console.error("Profile image upload error:", error);

        // If this is a 401 error, update last attempt timestamp
        if (error.response && error.response.status === 401) {
          setLastUpdateAttempt((prev) => ({ ...prev, photo: Date.now() }));
        }

        // Ensure we always close the loading indicator
        if (loadingToastId) toast.dismiss(loadingToastId);

        // Custom error message for 401 error
        let errorMessage = error.message || "Failed to update profile image";

        // Check if it's a 401 status code
        if (error.response && error.response.status === 401) {
          errorMessage =
            "You can't do modifications more than one time! Try again after 2 minutes.";
        }

        // Show error message that auto-dismisses after 5 seconds
        system.error(errorMessage, {
          duration: 5000,
          position: "top-center",
        });

        // Add a notification to the notification center
        addNotification(
          "Profile Photo Error",
          errorMessage,
          "error",
          true,
          30000
        );

        // Force UI refresh even on error
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 500);
      }
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Check if 2 minutes have passed since last attempt
      if (!canAttemptUpdate("profile")) {
        const waitTimeRemaining = Math.ceil(
          (2 * 60 * 1000 - (Date.now() - lastUpdateAttempt.profile)) / 1000 / 60
        );
        throw new Error(
          `Please wait approximately ${waitTimeRemaining} more minute(s) before trying again.`
        );
      }

      await updateUserProfile({
        name: formData.name,
        email: formData.email,
      });

      // Update last attempt timestamp on success
      setLastUpdateAttempt((prev) => ({ ...prev, profile: Date.now() }));

      // Set success message for the form
      setSuccessMessage("Profile details updated successfully");

      // Use auto-dismiss for the notification
      addNotification(
        "Profile Updated",
        `Your profile information has been successfully updated with name: ${formData.name} and email: ${formData.email}`,
        "success",
        true,
        30000
      );

      // Also show a toast notification
      system.success("Profile updated successfully", {
        duration: 3000,
        position: "top-center",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      // If this is a 401 error, update last attempt timestamp
      if (error.response && error.response.status === 401) {
        setLastUpdateAttempt((prev) => ({ ...prev, profile: Date.now() }));
      }

      // Custom error message for 401 error (too many profile updates)
      let errorMessage = error.message || "Failed to update profile";

      // Check if it's a 401 status code
      if (error.response && error.response.status === 401) {
        errorMessage =
          "You can't do modifications more than one time! Try again after 2 minutes.";
      }

      setErrors({
        profile: errorMessage,
      });

      // Use auto-dismiss for the notification
      addNotification(
        "Profile Update Failed",
        errorMessage,
        "error",
        true,
        30000
      );

      // Also show a toast notification
      system.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match",
      });

      // Use auto-dismiss for the notification
      addNotification(
        "Password Mismatch",
        "The new password and confirmation password do not match. Please try again.",
        "error",
        true,
        30000
      );

      // Also show a toast notification
      system.error("New passwords do not match", {
        duration: 5000,
        position: "top-center",
      });

      setIsLoading(false);
      return;
    }

    // Validate password is not empty
    if (!formData.currentPassword || !formData.newPassword) {
      setErrors({
        password: "All password fields are required",
      });

      system.error("All password fields are required", {
        duration: 5000,
        position: "top-center",
      });

      setIsLoading(false);
      return;
    }

    try {
      // Check if 2 minutes have passed since last attempt
      if (!canAttemptUpdate("password")) {
        const waitTimeRemaining = Math.ceil(
          (2 * 60 * 1000 - (Date.now() - lastUpdateAttempt.password)) /
            1000 /
            60
        );
        throw new Error(
          `Please wait approximately ${waitTimeRemaining} more minute(s) before trying again.`
        );
      }

      await updateUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      // Update last attempt timestamp on success
      setLastUpdateAttempt((prev) => ({ ...prev, password: Date.now() }));

      // Set success message for the form
      setSuccessMessage("Password updated successfully");

      // Use auto-dismiss for the notification
      addNotification(
        "Password Updated",
        "Your password has been successfully changed. You'll use your new password the next time you log in.",
        "success",
        true,
        30000
      );

      // Also show a toast notification
      system.success("Password updated successfully", {
        duration: 3000,
        position: "top-center",
      });

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);

      // If this is a 401 error, update last attempt timestamp
      if (error.response && error.response.status === 401) {
        setLastUpdateAttempt((prev) => ({ ...prev, password: Date.now() }));
      }

      // Custom error message for 401 error (too many password updates)
      let errorMessage = error.message || "Failed to update password";

      // Check if it's a 401 status code
      if (error.response && error.response.status === 401) {
        errorMessage =
          "You can't do modifications more than one time! Try again after 2 minutes.";
      }

      setErrors({
        password: errorMessage,
      });

      // Use auto-dismiss for the notification
      addNotification(
        "Password Update Failed",
        errorMessage,
        "error",
        true,
        30000
      );

      // Also show a toast notification
      system.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value) => {
    changeLanguage(value);

    // Language name mapping
    const languageNames = {
      en: "English",
      fr: "French",
    };

    // Add notification for language change with specific details
    addNotification(
      "Language Changed",
      `Your display language has been changed to ${
        languageNames[value] || value
      }.`,
      "success",
      true,
      30000
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirmation(false);
      // Use notification toast for logout instead of system
      notification.success("Logged out successfully!");
      // Replace navigation with hard refresh and redirect
      window.location.href = "/login";
    } catch (error) {
      system.error("Failed to log out");
    }
  };

  const handleNotificationVisibilityChange = (e) => {
    const newValue = e.target.checked;
    setNotificationVisibility(newValue);
    localStorage.setItem("notificationVisibility", newValue);

    addNotification(
      "Notification Settings Updated",
      `Notifications are now ${
        newValue ? "visible" : "hidden"
      } in the interface.`,
      "info",
      true,
      30000
    );
  };

  return (
    <>
      {userLoading ? (
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      ) : (
        <div
          key={user?.email}
          className="max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]"
          ref={containerRef}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 space-y-8 p-4"
          >
            <div className="glass-card p-8">
              <h1 className="text-3xl font-bold gradient-text mb-6">
                {t("settings.settings")}
              </h1>

              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-purple-main" />
                    {t("settings.profileSettings")}
                  </h2>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-purple-main/20">
                        <img
                          key={`profile-img-${Date.now()}`}
                          src={
                            user?.profile_image
                              ? forceImageRefresh(
                                  user.profile_image.startsWith("data:image/")
                                    ? user.profile_image
                                    : user.profile_image.startsWith("/")
                                    ? `${import.meta.env.VITE_API_URL.replace(
                                        "/api/",
                                        ""
                                      )}${user.profile_image}`
                                    : user.profile_image
                                )
                              : `https://ui-avatars.com/api/?name=${
                                  user?.name || "User"
                                }&background=7C2AE8&color=fff`
                          }
                          alt={user?.name || "User"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${
                              user?.name || "User"
                            }&background=7C2AE8&color=fff`;
                          }}
                        />
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-main text-white hover:bg-purple-light transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        {t("settings.profilePhoto")}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("settings.uploadPhoto")}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          {t("settings.fullName")}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          {t("settings.email")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">
                          {t("settings.role")}
                        </label>
                        <input
                          type="text"
                          value={t("settings.teacher")}
                          className="input-field"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <motion.button
                        type="submit"
                        className="btn-primary flex items-center gap-2 mt-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save size={18} />
                        {t("settings.saveProfile")}
                      </motion.button>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-purple-main" />
                    {t("settings.security")}
                  </h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          {t("settings.currentPassword")}
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">
                            {t("settings.newPassword")}
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                newPassword: e.target.value,
                              })
                            }
                            className="input-field"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">
                            {t("settings.confirmPassword")}
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="input-field"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <motion.button
                        type="submit"
                        className="btn-primary flex items-center gap-2 mt-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save size={18} />
                        {t("settings.updatePassword")}
                      </motion.button>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-purple-main" />
                    {t("settings.preferences")}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <Moon size={20} className="text-purple-light" />
                        ) : (
                          <Sun size={20} className="text-yellow-main" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {t("settings.darkMode")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("settings.darkModeDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer toggle-switch">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={() => toggleDarkMode()}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-purple-main"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        {notificationVisibility ? (
                          <Bell size={20} className="text-purple-main" />
                        ) : (
                          <BellOff size={20} className="text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {t("settings.notificationVisibility")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("settings.notificationVisibilityDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationVisibility}
                          onChange={handleNotificationVisibilityChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-purple-main"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail size={20} className="text-yellow-main" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {t("settings.language")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("settings.languageDesc")}
                          </p>
                        </div>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="input-field"
                      >
                        <option value="en">{t("settings.english")}</option>
                        <option value="fr">{t("settings.french")}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => setShowLogoutConfirmation(true)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    <div className="flex items-center justify-center">
                      <LogOut size={20} className="mr-2" />
                      <span>{t("settings.logout")}</span>
                    </div>
                  </button>
                </div>

                {showLogoutConfirmation && (
                  <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-10 w-full max-w-md">
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        {t("settings.logoutConfirmation")}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowLogoutConfirmation(false)}
                          className="mr-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          {t("settings.cancel")}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          {t("settings.confirm")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default Settings;
