import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useLanguage } from "../hooks/useLanguage";

function NotificationToggle() {
  const { notificationVisibility, setNotificationVisibility } =
    useNotifications();
  const { t } = useLanguage();

  // Don't render when notification visibility is disabled
  if (!notificationVisibility) {
    return null;
  }

  return (
    <motion.button
      onClick={() => setNotificationVisibility(!notificationVisibility)}
      className={`relative p-2 rounded-full transition-all duration-200 ${
        notificationVisibility
          ? "bg-purple-main/10 text-purple-main dark:bg-purple-main/20 dark:text-purple-light"
          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={
        notificationVisibility
          ? t("settings.hideNotifications")
          : t("settings.showNotifications")
      }
    >
      {notificationVisibility ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
      <motion.div
        initial={false}
        animate={{
          scale: notificationVisibility ? 1 : 0,
          opacity: notificationVisibility ? 1 : 0,
        }}
        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
      />
    </motion.button>
  );
}

export default NotificationToggle;
