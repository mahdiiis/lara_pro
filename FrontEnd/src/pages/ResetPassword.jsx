import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Key, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import useNotificationToast from "../hooks/useNotificationToast";
import { authApi } from "../utils/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { system, notification } = useNotificationToast();
  
  // Parse token from URL if it exists
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const [step, setStep] = useState(token && email ? "reset" : "request");
  const [formData, setFormData] = useState({
    email: email || "",
    password: "",
    password_confirmation: "",
    token: token || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateRequestForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequestForm()) return;

    try {
      showLoading();
      
      console.log("Sending password reset request for email:", formData.email);
      
      // Call the forgotPassword API endpoint
      const response = await authApi.forgotPassword(formData.email);
      console.log("Password reset API response:", response.data);
      
      // Check if we're in development mode and have direct URL
      if (response.data.reset_url) {
        // Development mode - show direct link to reset password
        notification.success("Password reset link generated successfully!");
        
        // Create a clickable reset link for development purposes
        const resetUrl = response.data.reset_url;
        
        // Show modal with reset link
        system.success(
          <div>
            <p>Development mode: Password reset link created.</p>
            <p>Click the link below to reset your password:</p>
            <a 
              href={resetUrl}
              style={{ 
                color: '#6366f1', 
                textDecoration: 'underline',
                display: 'block',
                marginTop: '10px',
                wordBreak: 'break-all'
              }}
            >
              {resetUrl}
            </a>
          </div>
        );
      } else {
        // Normal mode - just show success message
        notification.success(
          `If an account exists with ${formData.email}, a password reset link has been sent. Please check your inbox and spam folders.`
        );
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different error cases
      if (error.response && error.response.status === 404) {
        // Don't display "email not found" - this is a security risk
        // Instead, show the same message as success to prevent email enumeration
        notification.success(
          `If an account exists with ${formData.email}, a password reset link has been sent. Please check your inbox and spam folders.`
        );
      } else if (error.response && error.response.status === 429) {
        // Too many attempts
        system.error("Too many requests. Please try again later.");
      } else {
        // Generic error - only show for non-404 errors
        system.error(
          error.response?.data?.message || 
          "There was an issue processing your request. Please try again later."
        );
      }
    } finally {
      hideLoading();
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    try {
      showLoading();
      
      console.log("Submitting password reset with data:", {
        email: formData.email,
        token: formData.token,
        password: "********" // Don't log actual password
      });
      
      // Call the resetPassword API endpoint
      const response = await authApi.resetPassword({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        token: formData.token,
      });
      
      console.log("Password reset successful:", response.data);
      
      // Display success message
      notification.success("Password has been reset successfully!");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Reset password error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different error cases
      if (error.response && error.response.status === 422) {
        // Validation errors
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const newErrors = {};
          Object.keys(validationErrors).forEach(field => {
            newErrors[field] = validationErrors[field][0];
          });
          setErrors(newErrors);
        } else {
          system.error("Please check your form inputs and try again.");
        }
      } else if (error.response && error.response.status === 400) {
        // Invalid or expired token
        system.error("The password reset link is invalid or has expired. Please request a new one.");
      } else {
        // Generic error
        system.error(
          error.response?.data?.message || 
          "Failed to reset password. Please try again later."
        );
      }
    } finally {
      hideLoading();
    }
  };

  const goBack = () => {
    if (step === "reset") {
      setStep("request");
      setFormData(prev => ({
        ...prev,
        password: "",
        password_confirmation: "",
        token: ""
      }));
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
      >
        <div className="flex items-center justify-center flex-col">
          <button 
            onClick={goBack}
            className="self-start mb-4 text-purple-main hover:text-purple-light flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          <div className="flex items-center justify-center flex-col mb-4">
            <div className="h-16 w-16 bg-purple-main rounded-full flex items-center justify-center mb-4">
              <Key className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold gradient-text">
              {step === "request" ? "Forgot Password" : "Reset Password"}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {step === "request" 
              ? "Enter your email address below and we'll send you password reset instructions" 
              : "Enter your new password below"}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestSubmit} className="space-y-6">
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

            <motion.button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} />
              Send Reset Link
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-6">
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
                  readOnly={!!email}
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
                <Key className="text-purple-main" size={18} />
                New Password
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

            <div className="group">
              <label className="form-label flex items-center gap-2">
                <Key className="text-purple-main" size={18} />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`input-field pr-10 ${
                    errors.password_confirmation ? "border-red-500 dark:border-red-400" : ""
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <input type="hidden" name="token" value={formData.token} />
            {errors.token && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.token}
              </p>
            )}

            <motion.button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Key size={18} />
              Reset Password
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default ResetPassword;
