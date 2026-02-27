import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  FileJson,
  Plus,
  Package,
  Layers,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import toast from "react-hot-toast";
import useNotificationToast from "../hooks/useNotificationToast";
import axios from "axios";
import { useLanguage } from "../hooks/useLanguage";

function Preview({ data, onDataChange, onCreateNew }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [isSent, setIsSent] = useState("");
  const [hasModifications, setHasModifications] = useState(false);
  const navigate = useNavigate();
  const { addQuiz } = useAuth();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const { notification, system } = useNotificationToast();

  // Update editedData when data prop changes
  useEffect(() => {
    console.log("👁️ [Preview] Received data:", data);
    console.log("👁️ [Preview] Levels count:", data?.levels?.length);
    data?.levels?.forEach((level, idx) => {
      console.log(`  Level ${idx + 1}:`, {
        level_type: level.level_type,
        questionsCount: level.questions?.length || 0,
        question: level.question || "N/A",
        answersCount: level.answers?.length || 0,
      });
    });
    setEditedData(data);
  }, [data]);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (levelIndex, questionIndex, field, value) => {  //handleQuestionChange(index, 0,"question",e.target.value)
    const newLevels = [...editedData.levels];
    const level = newLevels[levelIndex]; // here i'm targeting the level  

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

    setEditedData((prev) => ({
      ...prev,
      levels: newLevels,
    }));
  };

  // NOUVEAU : Supprimer une question Box
  const handleDeleteQuestion = (levelIndex, questionIndex) => {
    const newLevels = [...editedData.levels];
    const level = newLevels[levelIndex];

    // Empêcher suppression si dernière question
    if (level.questions.length <= 1) {
      notification.error("Il doit rester au moins 1 question par niveau !");
      return;
    }

    // Supprimer la question
    level.questions.splice(questionIndex, 1); // here i'm targeting the question to delete delate 1 question with index questionIndex

    setEditedData((prev) => ({
      ...prev,
      levels: newLevels,
    }));
    setHasModifications(true);
    notification.success("Question supprimée");
  };

  // NOUVEAU : Supprimer une suggestion Balloon
  const handleDeleteAnswer = (levelIndex, answerIndex) => {
    const newLevels = [...editedData.levels];
    const level = newLevels[levelIndex];

    // Empêcher suppression si moins de 2 suggestions
    if (level.answers.length <= 2) {
      notification.error("Il doit rester au moins 2 suggestions !");
      return;
    }

    // Supprimer la suggestion
    level.answers.splice(answerIndex, 1);

    setEditedData((prev) => ({
      ...prev,
      levels: newLevels,
    }));
    setHasModifications(true);
    notification.success("Suggestion supprimée");
  };

  const handleSave = () => {
    onDataChange(editedData);
    setIsEditing(false);
    setHasModifications(false);
    // Save quiz to context
    addQuiz(editedData);

    // Add notification for saving quiz with specific details 
    addNotification(
      t("preview.quizSaved") || "Quiz Saved",
      `${t("course_name") || "Course"}: ${editedData.course}, ${t("topic") || "Topic"
      }: ${editedData.topic}, ${t("game_number") || "Game"}: ${editedData.gameNumber
      } - ${t("preview.savedSuccessfully") || "saved successfully"}`,
      "success"
    );

    // For immediate feedback
    notification.success(t("quiz_saved_successfully"));
  };

  const handleExportJSON = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      const jsonData = JSON.stringify(
        { ...editedData, game_id: isSent, user_id: userId },
        null,
        2
      );
      const response = await axios.post(`${apiUrl}game`, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // Add notification for quiz creation with specific details
        addNotification(
          t("preview.quizCreated") || "Quiz Created",
          `${t("course_name") || "Course"}: ${editedData.course}, ${t("topic") || "Topic"
          }: ${editedData.topic}, ${t("game_number") || "Game"}: ${editedData.gameNumber
          } - ${t("preview.createdSuccessfully") ||
          "created and exported successfully"
          }`,
          "success"
        );

        // Show immediate toast feedback
        notification.success(t("quiz_exported_successfully"));
        setIsSent(response.data.game_id);
      } else {
        // Add notification for export failure with specific details
        addNotification(
          t("preview.exportFailed") || "Export Failed",
          `${t("course_name") || "Course"}: ${editedData.course} - ${t("preview.exportFailedMessage") ||
          "Failed to export quiz data to the server"
          }`,
          "error"
        );

        // Show immediate toast feedback
        notification.error(t("failed_to_send_quiz_data"));
      }
    } catch (error) {
      // Add notification for export error with specific details
      addNotification(
        t("preview.exportError") || "Export Error",
        `${t("course_name") || "Course"}: ${editedData.course} - ${t("preview.exportErrorMessage") ||
        "An error occurred while exporting the quiz"
        }`,
        "error"
      );

      // Show immediate toast feedback
      notification.error(t("failed_to_export_quiz"));
    }
  };

  const handleCreateNew = () => {
    onCreateNew();

    // Add notification for creating a new quiz
    addNotification(
      t("preview.newQuizStarted") || "New Quiz Started",
      t("preview.newQuizStartedMessage") ||
      "You've started creating a new quiz. Fill in all required fields to complete the quiz.",
      "info"
    );

    navigate("/create", { replace: true }); // Navigate to create page
  };

  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-deep to-purple-main flex items-center justify-center shadow-md hover-glow">
            <Eye className="text-xl text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">
            {t("preview_quiz") || "Preview"}
          </h2>
        </div>
        <div className="flex gap-3">
          <motion.button  
            onClick={handleExportJSON}                                                // =====
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileJson size={18} />
            {t("export_json")}
          </motion.button>

          <motion.button
            onClick={handleCreateNew}                                               // =====
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            {t("create_new_quiz")}
          </motion.button>
          <motion.button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}         // =====
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${isEditing
              ? "bg-yellow-main text-gray-900 hover:bg-yellow-main/80"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEditing ? (
              <>
                <Save size={18} />
                {t("save_changes")}
              </>
            ) : (
              <>
                <Edit size={18} />
                {t("edit")}
              </>
            )}
          </motion.button>
        </div>
      </div>

      {
        hasModifications && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ {t("preview.unsavedChanges") || "Vous avez modifié le quiz généré. N'oubliez pas de sauvegarder !"}
              </p>
            </div>
          </div>
        )
      }

      <div className="mb-6 p-4 bg-yellow-main/10 border-l-4 border-yellow-main rounded-r-lg">
        <p className="text-yellow-main/90 font-medium">
          ⚠️ {t("important")}: {t("please_review_all_content")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover-glow"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("course_name")}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}                 // =====
                className="input-field mt-1"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedData.course || "-"}
              </p>
            )}
          </motion.div>
          <motion.div
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover-glow"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("topic")}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={editedData.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}            // =====
                className="input-field mt-1"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedData.topic || "-"}
              </p>
            )}
          </motion.div>
          <motion.div
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover-glow"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("game_number")}
            </span>
            {isEditing ? (
              <input
                type="number"
                value={editedData.gameNumber}
                onChange={(e) =>
                  handleInputChange("gameNumber", e.target.value)
                } // =====
                className="input-field mt-1"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedData.gameNumber || "-"}
              </p>
            )}
          </motion.div>
          <motion.div
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover-glow"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-purple-main dark:text-purple-light">
              {t("number_of_levels")}
            </span>
            {isEditing ? (
              <select
                value={editedData.numLevels}
                onChange={(e) => handleInputChange("numLevels", e.target.value)}
                className="input-field mt-1"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {editedData.levels?.length || 0}
              </p>
            )}
          </motion.div>
          <input
            type="hidden"
            value={isSent}
            onChange={(e) => setIsSent(e.target.value)}
          />
        </div>

        {editedData.levels?.map((level, index) => (
          <motion.div
            key={index}
            className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                  {t("level")} {level.level_number}
                </h3>
              </div>
              <span className="px-3 py-1 bg-purple-light/20 dark:bg-purple-main/30 text-purple-main dark:text-purple-light rounded-full text-sm font-medium">
                {level.level_type === "box" ? t("boxes") : t("balloons")}
              </span>
            </div>
            <div className="space-y-4">
              {level.level_type === "balloon" ? (
                <div>
                  <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                    {t("question")}:
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={level.question}
                      onChange={(e) =>
                        handleQuestionChange(                                   // =====
                          index, 
                          0,
                          "question",
                          e.target.value
                        )
                      }
                      className="input-field mb-4"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      {level.question || "-"}
                    </p>
                  )}
                  <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                    {t("answer")}s:
                  </div>
                  <div className="space-y-2">
                    {level.answers?.map((answer, aIndex) => (
                      <motion.div
                        key={aIndex}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        whileHover={{ scale: 1.01 }}
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
                            className="input-field"
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
                          className={`ml-4 ${isEditing ? "cursor-pointer" : "cursor-default"
                            }`}
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
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteAnswer(index, aIndex)}                                       // =====
                            className="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title={t("delete_option") || "Delete option"}
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-purple-main dark:text-purple-light mb-2">
                    {t("question")}s:
                  </div>
                  <div className="space-y-2">
                    {level.questions?.map((q, qIndex) => (
                      <motion.div
                        key={qIndex}
                        className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 preview-box-qa"
                        whileHover={{ scale: 1.01 }}
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
                                className="input-field"
                                placeholder={t("question")}
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
                                className="input-field"
                                placeholder={t("answer")}
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
                        {isEditing && (
                          <div className="flex flex-col justify-center">
                            <button
                              onClick={() => handleDeleteQuestion(index, qIndex)}
                              className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title={t("delete_question") || "Delete question"}
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div >
  );
}

export default Preview;


