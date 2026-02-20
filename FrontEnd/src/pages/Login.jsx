import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";
import useNotificationToast from "../hooks/useNotificationToast";
import { authApi } from "../utils/api";

function Login({ setIsAuthenticated, userLoading }) {
  // Get the base URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { system, notification } = useNotificationToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      showLoading();

      // Log the request data for debugging
      console.log("Login request data:", {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Use authApi.login instead of direct axios call
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (response.status !== 200) {
        throw new Error(
          `Server responded with status: ${response.status}, message: ${
            response.data?.message || "Unknown error"
          }`
        );
      }

      const { user, token, message } = response.data;

      // Store authentication data based on "Remember me" choice
      if (formData.rememberMe) {
        // If "Remember me" is checked, use localStorage (persists across browser sessions)
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "true");
      } else {
        // If "Remember me" is not checked, use sessionStorage (cleared when browser is closed)
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);
        localStorage.removeItem("rememberMe");
      }
      
      setIsAuthenticated(true);

      const redirectPath = localStorage.getItem("redirectPath") || "/";
      localStorage.removeItem("redirectPath");

      notification.success(message || "Login successful!");

      sessionStorage.setItem("pageRefreshed", "true");
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      system.error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      hideLoading();
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter your email first",
      }));
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    try {
      showLoading();
      
      // Call the forgotPassword API endpoint
      const response = await authApi.forgotPassword(formData.email);
      
      // Display success message
      notification.success(
        `Password reset instructions have been sent to ${formData.email}. Please check your inbox.`
      );
      
      console.log("Password reset request sent successfully:", response.data);
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // Handle different error cases
      if (error.response && error.response.status === 404) {
        // Email not found
        system.error("No account found with this email address.");
      } else if (error.response && error.response.status === 429) {
        // Too many attempts
        system.error("Too many requests. Please try again later.");
      } else {
        // Generic error
        system.error(
          error.response?.data?.message || 
          "Failed to send password reset link. Please try again later."
        );
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-deep to-purple-main flex items-center justify-center shadow-lg shadow-purple-deep/20 hover-glow">
              <img
                src="./assets/file.png"
                alt="Logo"
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
          <div className="group">
            <label className="form-label flex items-center gap-2">
              <Mail className="text-purple-main" size={18} />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${
                  errors.email ? "border-red-500 dark:border-red-400" : ""
                }`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="group">
            <label className="form-label flex items-center gap-2">
              <Lock className="text-purple-main" size={18} />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pr-10 ${
                  errors.password ? "border-red-500 dark:border-red-400" : ""
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-purple-main focus:ring-purple-light border-gray-300 rounded cursor-pointer checkbox-custom"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/reset-password"
                className="font-medium text-purple-main hover:text-purple-light dark:text-purple-light dark:hover:text-purple-main"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={18} />
            Sign In
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-purple-main hover:text-purple-light dark:text-purple-light dark:hover:text-purple-main"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
