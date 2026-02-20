import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash2, Search, X, Eye } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../hooks/useLanguage";
import { useNotifications } from "../context/NotificationContext";
import useNotificationToast from "../hooks/useNotificationToast";
import { Link } from "react-router-dom";

function Games() {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGames, setFilteredGames] = useState([]);
  const { user } = useAuth();
  // Merge both notifications approaches
  const { addNotification, notificationsEnabled } = useNotifications();
  const { system, notification } = useNotificationToast();
  const { t } = useLanguage();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchAllQuizzes = async () => {
    try {
      if (!user) return;
      const userId = user?.id;
      const response = await axios.get(`${apiUrl}select`, {
        params: {
          user_id: userId,
        },
      });
      if (response.status === 200) {
        setGames(response.data.data || []);
        setFilteredGames(response.data.data || []);
      } else {
        console.error("Failed to fetch all quizzes");
        // Show notification error
        addNotification(
          t("games.fetchError") || "Error",
          t("games.fetchErrorMessage") || "Failed to fetch quizzes",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching all quizzes:", error);
      // Show notification error
      addNotification(
        t("games.fetchError") || "Error",
        t("games.fetchErrorMessage") || "Failed to fetch quizzes",
        "error"
      );
    }
  };

  useEffect(() => {
    console.log("Fetching quizzes...");
    fetchAllQuizzes();
  }, []);

 useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGames(games);
    } else {
      const filtered = games.filter((game) =>
        game.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered);
    }
  }, [searchTerm, games]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleDelete = async (game_id, courseName = "") => {
    try {
      const response = await axios.delete(`${apiUrl}delete`, {
        params: {
          game_id: game_id,
          user_id: user.id,
        },
      });
      if (response.status === 200) {
        // Find the game to be deleted to get additional details if not provided
        const deletedGame =
          courseName || games.find((game) => game.game_id === game_id)?.course;
        setGames(games.filter((game) => game.game_id !== game_id));

        // Add detailed notification for game deletion
        addNotification(
          t("games.deleteSuccess") || "Game Deleted",
          `${t("games.course") || "Course"}: ${deletedGame}, ${
            t("games.topic") || "Topic"
          }: ${games.find((game) => game.game_id === game_id)?.topic}, ${
            t("games.gameNumber") || "Game Number"
          }: ${games.find((game) => game.game_id === game_id)?.game_number} ${
            t("games.wasDeleted") || "was deleted successfully"
          }`,
          "success"
        );

        // System-level success message for immediate feedback
        system.success(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      // Add notification for deletion error with specific context
      addNotification(
        t("games.deleteError") || "Delete Failed",
        `${
          t("games.failedToDelete") || "Failed to delete"
        } "${courseName}" (ID: ${game_id})`,
        "error"
      );

      // Determine if this is a system-critical error or just a notification error
      if (error.response?.status >= 500) {
        system.error("Failed to delete quiz data");
      } else {
        notification.error("Failed to delete quiz");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {t("games.manageGames")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              {t("games.viewAndDelete")}
            </p>
          </div>

          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("games.searchPlaceholder")}
                className="input-field pr-24 pl-10"
                aria-label={t("games.searchLabel")}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={t("games.clearSearch")}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
            {searchTerm ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t("games.noGamesFound")}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {t("games.noGamesAvailable")}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("games.course")}
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("games.topic")}
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("games.gameNumber")}
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("games.numberOfLevels")}
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("games.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGames.map((game) => (
                  <tr
                    key={game.game_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-800 dark:text-white">
                      <Link
                        to={`/game/${game.game_id}`}
                        className="hover:underline"
                      >
                        {game.course}
                      </Link>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {game.topic}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {game.game_number}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {game.number_of_levels}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/game/${game.game_id}`}
                          className="text-cyan-main hover:text-cyan-600 dark:hover:text-cyan-400 p-1 rounded transition-colors duration-150"
                          aria-label={t("games.view")}
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(game.game_id, game.course)
                          }
                          className="text-red-600 hover:text-red-800 dark:hover:text-red-400 p-1 rounded transition-colors duration-150"
                          aria-label={t("games.delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Games;
