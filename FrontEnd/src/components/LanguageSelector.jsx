import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import {
  LanguageContext,
  useLanguageContext,
} from "../context/LanguageContext";
import useNotificationToast from "../hooks/useNotificationToast";

function LanguageSelector() {
  const { t } = useLanguage();
  const { language, changeLanguage } = useLanguageContext();
  const { notification } = useNotificationToast();

  const handleLanguageChange = (value) => {
    // Change the language
    changeLanguage(value);

    // Show a notification but only if notifications are enabled
    notification.success("Language updated successfully!");
  };

  return (
    <motion.div
      className="flex items-center gap-2 language-selector-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Globe size={20} className="text-purple-main" />
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none language-selector"
      >
        <option value="en">{t("english")}</option>
        <option value="fr">{t("french")}</option>
      </select>
    </motion.div>
  );
}

export default LanguageSelector;
