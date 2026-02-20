import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";

function NotificationCenter() {
  const {
    notifications,
    notificationVisibility,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const notificationRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);

    // Auto-mark as read when opening the notification center
    if (!isOpen && notifications.some((n) => !n.read)) {
      setTimeout(() => {
        markAllAsRead();
        // Don't show toast for automatic marking as read
      }, 30000); // Auto-mark all as read after 30 seconds of opening
    }
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    // Use a more subtle toast
    toast.success("Notification marked as read", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleRemoveNotification = (id) => {
    removeNotification(id);
    // Use a more subtle toast
    toast.success("Notification removed", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    // Use a more subtle toast
    toast.success("All notifications marked as read", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    // Use a more subtle toast
    toast.success("All notifications cleared", {
      duration: 2000,
      position: "bottom-right",
    });
    // Close notification center after clearing
    setIsOpen(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Format timestamp to human-readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHour < 24)
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

    // For older notifications, show a full date
    return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide read notifications after 7 days instead of 24 hours
  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter out read notifications older than 7 days
    const filteredNotifications = notifications.filter((notification) => {
      if (!notification.read) return true;
      const notificationDate = new Date(notification.created_at);
      return notificationDate > sevenDaysAgo;
    });

    // Update notifications if any were removed
    if (filteredNotifications.length < notifications.length) {
      setNotifications(filteredNotifications);
    }
  }, [notifications]);

  // Don't render anything if notification visibility is disabled
  if (!notificationVisibility) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50"
          >
            <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Notifications
              </h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Mark all read
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                    className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !notification.read ? "bg-gray-50 dark:bg-gray-700/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <button
                            onClick={() =>
                              handleRemoveNotification(notification.id)
                            }
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
