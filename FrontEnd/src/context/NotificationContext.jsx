import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Always keep notifications enabled
  const notificationsEnabled = true;

  // State for notification visibility with localStorage persistence
  const [notificationVisibility, setNotificationVisibility] = useState(() => {
    return localStorage.getItem("notificationVisibility") !== "false";
  });

  // State for current notifications
  const [notifications, setNotifications] = useState([]);

  // Persist notification visibility changes
  useEffect(() => {
    localStorage.setItem("notificationVisibility", notificationVisibility);
  }, [notificationVisibility]);

  const requestNotificationPermission = async () => {
    try {
      if (!("Notification" in window)) {
        return;
      }

      await Notification.requestPermission();
    } catch (error) {
      // Silent error handling
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();

    // Load existing notifications from localStorage or API if needed
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        // Silent error handling
      }
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Add a new notification
  const addNotification = (
    title,
    message,
    type = "info",
    autoDismiss = false,
    duration = 5000
  ) => {
    // Prevent displaying translation keys directly
    const cleanTitle =
      title && title.includes(".") && !title.includes(" ")
        ? `Action Completed` // Fallback for untranslated keys
        : title;

    const cleanMessage =
      message && message.includes(".") && !message.includes(" ")
        ? `The operation was completed successfully` // Fallback for untranslated keys
        : message;

    // Create well-structured notification object with specific information
    const newNotification = {
      id: Date.now(), // Use timestamp as ID
      title: cleanTitle,
      message: cleanMessage,
      type, // info, success, warning, error
      read: false,
      created_at: new Date().toISOString(),
      source: "dashboard", // Add source to help with filtering
      category: getCategoryFromType(type), // Add category based on type
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Also trigger browser notification if enabled
    if (Notification.permission === "granted") {
      try {
        new Notification(cleanTitle, {
          body: cleanMessage,
          icon: "/assets/file.png",
          badge: "/assets/file.png",
          tag: `dashboard-${type}`, // Add tag for grouping similar notifications
        });
      } catch (error) {
        // Silent error handling
      }
    }

    // Auto-dismiss notification if enabled
    if (autoDismiss) {
      setTimeout(() => {
        // Mark as read instead of removing, so notifications stay in the center
        markAsRead(newNotification.id);
      }, duration);
    }

    return newNotification.id;
  };

  // Helper function to get category from notification type
  const getCategoryFromType = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
      default:
        return "info";
    }
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Remove a notification
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        notificationVisibility,
        setNotificationVisibility,
        notifications,
        setNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
