import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";

/**
 * Custom hook that wraps toast notifications to respect user notification settings
 * This ensures toast notifications are only shown when appropriate based on user preferences
 */
export function useNotificationToast() {
  const { notificationsEnabled } = useNotifications();

  // System toasts - always shown regardless of notification settings
  // Used for critical system information, authentication, etc.
  const systemToast = {
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    loading: (message, options = {}) => toast.loading(message, options),
    custom: (message, options = {}) => toast.custom(message, options),
    dismiss: (id) => toast.dismiss(id),
    close: () => toast.dismiss(),
  };

  // Notification toasts - only shown when notifications are enabled
  // Used for general app notifications that are non-critical
  const notificationToast = {
    success: (message, options = {}) => {
      if (notificationsEnabled) {
        return toast.success(message, options);
      }
      // Still log to console when suppressed for debugging
      console.log("Notification toast suppressed (success):", message);
      return null;
    },
    error: (message, options = {}) => {
      if (notificationsEnabled) {
        return toast.error(message, options);
      }
      // Still log to console when suppressed for debugging
      console.log("Notification toast suppressed (error):", message);
      return null;
    },
    loading: (message, options = {}) => {
      if (notificationsEnabled) {
        return toast.loading(message, options);
      }
      console.log("Notification toast suppressed (loading):", message);
      return null;
    },
    custom: (message, options = {}) => {
      if (notificationsEnabled) {
        return toast.custom(message, options);
      }
      console.log("Notification toast suppressed (custom):", message);
      return null;
    },
    dismiss: (id) => toast.dismiss(id),
    close: () => toast.dismiss(),
  };

  return {
    // Raw toast object for backward compatibility
    toast,

    // System-level toasts - always shown
    system: systemToast,

    // Notification toasts - only shown when notifications are enabled
    notification: notificationToast,

    // Helper function to determine the right toast type to use
    showToast: (isSystemCritical = false) => {
      return isSystemCritical ? systemToast : notificationToast;
    },
  };
}

export default useNotificationToast;
