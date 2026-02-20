import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Edit,
  Save,
  FileJson,
  Package,
  Layers,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import useNotificationToast from "../hooks/useNotificationToast";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../context/ThemeContext";

const Game = () => {
  const { game_id } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedGame, setEditedGame] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { addQuiz } = useAuth();
  const { t, language } = useLanguage();
  const { notification } = useNotificationToast();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const user_id = user?.id;
        if (!user_id) {
          setError("User ID not found in local storage.");
          return;
        }
        const response = await axios.get(`${apiUrl}getGameById`, {
          params: { user_id, game_id },
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          setGame(response.data);
          console.log(response.data);
          setEditedGame(response.data);
        } else {
          setError(response.data.message || "Failed to fetch game.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred.");
      }
    };

    fetchGame();
  }, [game_id]);

  const handleInputChange = (field, value) => {
    setEditedGame((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (levelIndex, questionIndex, field, value) => {
    const newLevels = [...editedGame.levels];
    const level = newLevels[levelIndex];

    if (level.level_type === "balloon") {
      if (field === "question") {
        level.question = value;
      } else if (field === "answer") {
        level.answers[questionIndex].text = value;
      } else if (field === "is_true") {
        level.answers[questionIndex].is_true = value;
      }
    } else {
      if (field === "text") {
        level.questions[questionIndex].text = value;
      } else if (field === "answer") {
        level.questions[questionIndex].answer = value;
      }
    }

    setEditedGame((prev) => ({
      ...prev,
      levels: newLevels,
    }));
  };

  const handleSave = () => {
    setGame(editedGame);
    setIsEditing(false);
    addQuiz(editedGame);
    notification.success(t("game_saved_successfully"));
  };

  const handleCancel = () => {
    setEditedGame(game);
    setIsEditing(false);
    notification.info(t("edit_cancelled") || "Changes discarded");
  };

  const handleExportJSON = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const jsonData = JSON.stringify(
        { ...editedGame, game_id: game_id, user_id: userId },
        null,
        2
      );
      const response = await axios.post(`${apiUrl}game`, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        notification.success(t("game_exported_successfully"));
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        notification.error(
          t("failed_to_send_game_data") || "Failed to send game data"
        );
      }
    } catch (error) {
      notification.error(t("failed_to_export_game") || "Failed to export game");
      console.error("Export error:", error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      className={`glass-card p-8 ${isEditing ? "editing-mode" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background:
          isEditing && theme === "light" ? "rgba(255, 255, 255, 0.95)" : "",
        boxShadow: isEditing ? "0 8px 32px rgba(124, 42, 232, 0.15)" : "",
      }}
    >
      {isEditing && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-deep via-purple-main to-cyan-main"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Editing Mode Header */}
      {isEditing ? (
        <motion.div
          className="flex items-center justify-between mb-6 py-2 px-4 -mx-4 -mt-4 mb-8 bg-gradient-to-r from-purple-50/80 to-purple-100/50 dark:from-gray-800/60 dark:to-gray-700/60 border-b border-purple-100 dark:border-gray-700 rounded-t-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Edit
                className="text-purple-main dark:text-purple-light"
                size={18}
              />
            </div>
            <h2 className="text-lg font-semibold text-purple-deep dark:text-purple-light">
              {t("editing_mode") || "Editing Mode"}
            </h2>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 shadow-sm"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <X size={16} />
              {t("cancel") || "Cancel"}
            </motion.button>
            <motion.button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-deep to-purple-main text-white shadow-md"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(124, 42, 232, 0.3)",
                background: "linear-gradient(to right, #7C2AE8, #00C4CC)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              {t("save_changes") || "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-deep to-purple-main flex items-center justify-center shadow-md hover-glow">
              <Eye className="text-xl text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">
              {t("game_details")}
            </h2>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleExportJSON}
              className="btn-secondary flex items-center justify-center gap-2 px-4 py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileJson size={18} />
              {t("export_json") || "Export JSON"}
            </motion.button>
            <motion.button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-deep to-purple-main text-white shadow-md"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(124, 42, 232, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              aria-label={t("edit_game") || "Edit game"}
              title={t("edit_game") || "Edit game"}
            >
              <Edit size={18} />
              {t("edit") || "Edit"}
            </motion.button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Name Field */}
          <motion.div
            className={`p-4 rounded-xl border ${
              isEditing
                ? "bg-white dark:bg-gray-900 border-purple-200 shadow-lg dark:border-purple-800/30"
                : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"
            } hover-glow transition-all duration-300`}
            whileHover={{ scale: isEditing ? 1.01 : 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("course_name") || "Course Name"}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedGame.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                className="input-field mt-1 w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder={t("enter_course_name") || "Enter course name"}
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedGame.course || "-"}
              </p>
            )}
          </motion.div>

          {/* Topic Field */}
          <motion.div
            className={`p-4 rounded-xl border ${
              isEditing
                ? "bg-white dark:bg-gray-900 border-purple-200 shadow-lg dark:border-purple-800/30"
                : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"
            } hover-glow transition-all duration-300`}
            whileHover={{ scale: isEditing ? 1.01 : 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("topic") || "Topic"}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedGame.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                className="input-field mt-1 w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder={t("enter_topic") || "Enter topic"}
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedGame.topic || "-"}
              </p>
            )}
          </motion.div>

          {/* Game Number Field */}
          <motion.div
            className={`p-4 rounded-xl border ${
              isEditing
                ? "bg-white dark:bg-gray-900 border-purple-200 shadow-lg dark:border-purple-800/30"
                : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"
            } hover-glow transition-all duration-300`}
            whileHover={{ scale: isEditing ? 1.01 : 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("game_number") || "Game Number"}
            </span>
            {isEditing ? (
              <input
                type="number"
                value={editedGame.gameNumber}
                onChange={(e) =>
                  handleInputChange("gameNumber", e.target.value)
                }
                className="input-field mt-1 w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder={t("enter_game_number") || "Enter game number"}
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedGame.gameNumber || "-"}
              </p>
            )}
          </motion.div>

          {/* Number of Levels Field */}
          <motion.div
            className={`p-4 rounded-xl border ${
              isEditing
                ? "bg-white dark:bg-gray-900 border-purple-200 shadow-lg dark:border-purple-800/30"
                : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"
            } hover-glow transition-all duration-300`}
            whileHover={{ scale: isEditing ? 1.01 : 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("number_of_levels") || "Number of Levels"}
            </span>
            {isEditing ? (
              <select
                value={editedGame.numLevels}
                onChange={(e) => handleInputChange("numLevels", e.target.value)}
                className="input-field mt-1 w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedGame.numLevels || 0}
              </p>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {editedGame.levels?.map((level, index) => (
            <motion.div
              key={index}
              className={`mt-6 p-6 rounded-xl border ${
                isEditing
                  ? "bg-white dark:bg-gray-900 border-purple-200 shadow-lg dark:border-purple-800/30"
                  : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"
              } hover-glow transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-deep to-purple-main flex items-center justify-center shadow-sm">
                    {level.level_type === "box" ? (
                      <Package className="text-sm text-white" size={14} />
                    ) : (
                      <Layers className="text-sm text-white" size={14} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold gradient-text">
                    {t("level") || "Level"} {level.level_number}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-purple-light/20 dark:bg-purple-main/30 text-purple-main dark:text-purple-light rounded-full text-sm font-medium">
                  {level.level_type === "box"
                    ? t("boxes") || "Boxes"
                    : t("balloons") || "Balloons"}
                </span>
              </div>
              <div className="space-y-4">
                {level.level_type === "balloon" ? (
                  <div>
                    <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                      {t("question") || "Question"}:
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={level.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            0,
                            "question",
                            e.target.value
                          )
                        }
                        className="input-field mb-4 w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        placeholder={t("enter_question") || "Enter question"}
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        {level.question || "-"}
                      </p>
                    )}
                    <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                      {t("answers") || "Answers"}:
                    </div>
                    <div className="space-y-2">
                      {level.answers?.map((answer, aIndex) => (
                        <motion.div
                          key={aIndex}
                          className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border ${
                            isEditing
                              ? "border-purple-light/30 dark:border-purple-900/30"
                              : "border-gray-200 dark:border-gray-600"
                          } ${
                            answer.is_true && isEditing
                              ? "ring-2 ring-yellow-main/50 dark:ring-yellow-500/50"
                              : ""
                          }`}
                          whileHover={{ scale: isEditing ? 1.01 : 1.0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={answer.text}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  aIndex,
                                  "answer",
                                  e.target.value
                                )
                              }
                              className="input-field w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                              placeholder={t("enter_answer") || "Enter answer"}
                            />
                          ) : (
                            <p className="text-gray-800 dark:text-gray-200">
                              {answer.text || "-"}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              if (isEditing) {
                                handleQuestionChange(
                                  index,
                                  aIndex,
                                  "is_true",
                                  !answer.is_true
                                );
                              }
                            }}
                            className={`ml-4 ${
                              isEditing ? "cursor-pointer" : "cursor-default"
                            }`}
                            title={
                              isEditing
                                ? answer.is_true
                                  ? t("mark_as_incorrect") ||
                                    "Mark as incorrect"
                                  : t("mark_as_correct") || "Mark as correct"
                                : ""
                            }
                          >
                            {answer.is_true ? (
                              <CheckCircle
                                className="text-yellow-main text-xl"
                                size={20}
                              />
                            ) : (
                              <XCircle
                                className="text-magenta-deep text-xl"
                                size={20}
                              />
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                      {t("questions") || "Questions"}:
                    </div>
                    <div className="space-y-2">
                      {level.questions?.map((q, qIndex) => (
                        <motion.div
                          key={qIndex}
                          className={`flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border ${
                            isEditing
                              ? "border-purple-light/30 dark:border-purple-900/30"
                              : "border-gray-200 dark:border-gray-600"
                          } preview-box-qa`}
                          whileHover={{ scale: isEditing ? 1.01 : 1.0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={q.text}
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      index,
                                      qIndex,
                                      "text",
                                      e.target.value
                                    )
                                  }
                                  className="input-field w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                  placeholder={t("question") || "Question"}
                                />
                                <input
                                  type="text"
                                  value={q.answer}
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      index,
                                      qIndex,
                                      "answer",
                                      e.target.value
                                    )
                                  }
                                  className="input-field w-full px-3 py-2 border border-purple-light/30 rounded-lg focus:ring-2 focus:ring-purple-main focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                  placeholder={t("answer") || "Answer"}
                                />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  <span className="text-purple-main dark:text-purple-light">
                                    Q{qIndex + 1}:
                                  </span>{" "}
                                  {q.text || "-"}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="text-purple-main dark:text-purple-light">
                                    A:
                                  </span>{" "}
                                  {q.answer || "-"}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Game;
