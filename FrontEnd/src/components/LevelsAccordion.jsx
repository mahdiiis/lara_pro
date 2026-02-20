import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Gamepad, Check, X, Trash, ChevronDown } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { Box_Bal } from "./LevelForm_btn_inp/box_bal";

/**
 * LevelsAccordion Component
 *
 * Combines accordion UI with level editing logic
 * Props:
 *   - levels: array of level objects
 *   - onLevelChange: callback when level data changes
 */

function LevelsAccordion({ levels, onLevelChange }) {
  const { t } = useLanguage();
  const [expandedLevel, setExpandedLevel] = useState(0); // Track which level is expanded

  /**
   * Handle level accordion toggle
   */
  const handleToggleLevel = (levelIndex) => {
    setExpandedLevel(expandedLevel === levelIndex ? null : levelIndex);
  };

  /**
   * Update specific level data
   */
  const handleLevelUpdated = (levelIndex, updatedLevelData) => {
    onLevelChange(levelIndex, updatedLevelData);
  };

  return (
    <div className="space-y-3 mt-8">
      <h3 className="text-lg font-bold gradient-text mb-4">
        {t("edit_levels")} ({levels.length})
      </h3>

      <AnimatePresence>
        {levels.map((level, levelIndex) => (
          <motion.div
            key={levelIndex}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* ===== ACCORDION HEADER ===== */}
            <motion.button
              onClick={() => handleToggleLevel(levelIndex)}
              className="w-full p-4 bg-gradient-to-r from-purple-deep/10 to-purple-main/10 dark:from-purple-deep/20 dark:to-purple-main/20 rounded-lg flex items-center justify-between hover:from-purple-deep/20 hover:to-purple-main/20 transition-all duration-200 border border-purple-main/20"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <Gamepad className="text-purple-main" size={20} />
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {t("level")} {levelIndex + 1}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {level.level_type === "box" ? t("boxes") : t("balloons")}
                    {level.questions?.length > 0 || level.answers?.length > 0 ? ` • ${level.questions?.length || 1} Q` : ""}
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: expandedLevel === levelIndex ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} className="text-purple-main" />
              </motion.div>
            </motion.button>

            {/* ===== ACCORDION CONTENT ===== */}
            <AnimatePresence>
              {expandedLevel === levelIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <LevelFormContent
                    levelNumber={levelIndex + 1}
                    level={level}
                    onChange={(updatedData) =>
                      handleLevelUpdated(levelIndex, updatedData)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * LevelFormContent
 * The actual form content for editing a level
 * This contains the logic from original LevelForm
 */

function LevelFormContent({ levelNumber, level, onChange }) {
  const { t } = useLanguage();
  const [levelType, setLevelType] = useState(level.level_type || "box");
  const [questions, setQuestions] = useState(level.questions || []);
  const [singleQuestion, setSingleQuestion] = useState(level.question || "");
  const [answers, setAnswers] = useState(level.answers || []);

  // ===== Handle Level Type Change =====
  const handleLevelTypeChange = (type) => {
    setLevelType(type);
    if (type === "box") {
      onChange({
        level_number: levelNumber,
        level_stats: {
          coins: 0,
          lifes: 5,
          mistakes: 0,
          stars: 1,
          time_spent: 0,
        },
        level_type: type,
        questions: [],
      });
      setQuestions([]);
    } else {
      onChange({
        level_number: levelNumber,
        level_stats: {
          coins: 0,
          lifes: 5,
          mistakes: 0,
          stars: 1,
          time_spent: 0,
        },
        level_type: type,
        question: "",
        answers: [],
      });
      setSingleQuestion("");
      setAnswers([]);
    }
  };

  // ===== Handle Add Question =====
  const handleAddQuestion = () => {
    if (levelType === "balloon") {
      if (answers.length < 10) {
        const newAnswer = { text: "", is_true: false };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          question: singleQuestion,
          answers: newAnswers,
        });
      }
    } else {
      if (questions.length < 5) {
        const newQuestions = [...questions, { text: "", answer: "" }];
        setQuestions(newQuestions);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          questions: newQuestions,
        });
      }
    }
  };

  // ===== Handle Question Change =====
  const handleQuestionChange = (index, field, value) => {
    if (levelType === "balloon") {
      if (field === "question") {
        setSingleQuestion(value);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          question: value,
          answers,
        });
      } else {
        const newAnswers = answers.map((a, i) => {
          if (i === index) {
            return { ...a, [field === "answer" ? "text" : field]: value };
          }
          return a;
        });
        setAnswers(newAnswers);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          question: singleQuestion,
          answers: newAnswers,
        });
      }
    } else {
      const newQuestions = questions.map((q, i) => {
        if (i === index) {
          return { ...q, [field]: value };
        }
        return q;
      });
      setQuestions(newQuestions);
      onChange({
        level_number: levelNumber,
        level_stats: level.level_stats,
        level_type: levelType,
        questions: newQuestions,
      });
    }
  };

  // ===== Handle Delete Question =====
  const handleDeleteQuestion = (index) => {
    if (levelType === "balloon") {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      onChange({
        level_number: levelNumber,
        level_stats: level.level_stats,
        level_type: levelType,
        question: singleQuestion,
        answers: newAnswers,
      });
    } else {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      onChange({
        level_number: levelNumber,
        level_stats: level.level_stats,
        level_type: levelType,
        questions: newQuestions,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== Game Type Selection ===== */}
      <div className="mb-6">
        <label className="form-label">{t("game_type")}</label>
        <div className="flex gap-4">
          <Box_Bal
            levelType="box"
            handleLevelTypeChange={handleLevelTypeChange}
            curretnLevelType={levelType}
          />
          <Box_Bal
            levelType="balloon"
            handleLevelTypeChange={handleLevelTypeChange}
            curretnLevelType={levelType}
          />
        </div>
      </div>

      {/* ===== Questions/Answers Section ===== */}
      <div className="space-y-6">
        {levelType === "balloon" ? (
          <>
            {/* Balloon: Single Question */}
            <motion.div layout>
              <label className="form-label">{t("question")}</label>
              <input
                type="text"
                value={singleQuestion}
                onChange={(e) =>
                  handleQuestionChange(0, "question", e.target.value)
                }
                placeholder={t("enter_your_question")}
                className="input-field"
              />
            </motion.div>

            {/* Balloon: Answers List */}
            <AnimatePresence>
              {answers.map((answer, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex gap-4 items-center bg-white dark:bg-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-500"
                >
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) =>
                      handleQuestionChange(index, "answer", e.target.value)
                    }
                    placeholder={t("answer")}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() =>
                      handleQuestionChange(index, "is_true", !answer.is_true)
                    }
                    className={`toggle-btn ${
                      answer.is_true ? "toggle-btn-true" : "toggle-btn-false"
                    }`}
                  >
                    {answer.is_true ? <Check size={18} /> : <X size={18} />}
                    {answer.is_true ? t("true") : t("false")}
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Answer Button */}
            {answers.length < 10 && (
              <motion.button
                onClick={handleAddQuestion}
                className="btn-secondary flex items-center justify-center gap-2 w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                {t("add_answer")} ({answers.length}/10)
              </motion.button>
            )}
          </>
        ) : (
          <>
            {/* Box: Questions List */}
            <AnimatePresence>
              {questions.map((q, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex gap-4 items-center bg-white dark:bg-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-500"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-purple-main dark:text-purple-light w-24">
                        {t("question")} {index + 1}
                      </span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) =>
                          handleQuestionChange(index, "text", e.target.value)
                        }
                        placeholder={t("question")}
                        className="input-field"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-purple-main dark:text-purple-light w-24">
                        {t("answer")}
                      </span>
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) =>
                          handleQuestionChange(index, "answer", e.target.value)
                        }
                        placeholder={t("answer")}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Question Button */}
            {questions.length < 5 && (
              <motion.button
                onClick={handleAddQuestion}
                className="btn-secondary flex items-center justify-center gap-2 w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                {t("add_question")} ({questions.length}/5)
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LevelsAccordion;
