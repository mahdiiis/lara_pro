import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X, Loader, Package, Layers } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";
import axios from "axios";

/**
 * AIQuestionGenerator Component - REDESIGNED
 *
 * Generates questions for ALL levels at once based on selected game types and ONE prompt
 * Props:
 *   - isOpen: boolean - Control visibility
 *   - onClose: function - Close the panel
 *   - numLevels: number - Total levels in quiz
 *   - onQuestionsGenerated: function - Callback when all questions are generated
 */

function AIQuestionGenerator({ isOpen, onClose, numLevels, onQuestionsGenerated }) {
  const { t } = useLanguage();

  // Form state: game types for each level + shared prompt
  const [levelGameTypes, setLevelGameTypes] = useState(
    Array(numLevels)
      .fill()
      .reduce((acc, _, i) => {
        acc[i + 1] = "box"; // Default to "box"
        return acc;
      }, {})
  );

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle game type change for a specific level
   */
  const handleGameTypeChange = (levelNumber, gameType) => {
    setLevelGameTypes((prev) => ({
      ...prev,
      [levelNumber]: gameType,
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setPrompt("");
    setLevelGameTypes(
      Array(numLevels)
        .fill()
        .reduce((acc, _, i) => {
          acc[i + 1] = "box";
          return acc;
        }, {})
    );
  };

  /**
   * Handle close with form reset
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Generate questions for ALL levels at once
   */
  const handleGenerateAllQuestions = async () => {
    // Validation
    if (!prompt.trim()) {
      toast.error(t("enter_prompt") || "Please enter a prompt");
      return;
    }

    // Check if all levels have game types selected
    const allLevelsConfigured = Array.from({ length: numLevels }, (_, i) => i + 1).every(
      (levelNum) => levelGameTypes[levelNum]
    );

    if (!allLevelsConfigured) {
      toast.error("Please select a game type for all levels");
      return;
    }

    setIsGenerating(true);
    console.log("🚀 [AIQuestionGenerator] Generating for all levels...");
    console.log("📊 Level Game Types:", levelGameTypes);
    console.log("📝 Prompt:", prompt);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please log in.");
        setIsGenerating(false);
        return;
      }

      // Generate questions for each level
      const generatedQuestionsPerLevel = {};
      let successCount = 0;

      for (let levelNumber = 1; levelNumber <= numLevels; levelNumber++) {
        const gameType = levelGameTypes[levelNumber];

        console.log(`🔄 [AIQuestionGenerator] Generating Level ${levelNumber} (${gameType})...`);

        try {
          const response = await axios.post(
            `${apiUrl}generate-questions`,
            {
              prompt: prompt,
              game_type: gameType,
              level: levelNumber,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200 && response.data.success) {
            console.log(`✅ [AIQuestionGenerator] Level ${levelNumber} generated successfully`);
            generatedQuestionsPerLevel[levelNumber] = {
              gameType,
              questions: response.data.questions,
            };
            successCount++;
          } else {
            console.error(
              `❌ [AIQuestionGenerator] Level ${levelNumber} failed:`,
              response.data
            );
            toast.error(`Failed to generate questions for Level ${levelNumber}`);
          }
        } catch (error) {
          console.error(`❌ [AIQuestionGenerator] Error generating Level ${levelNumber}:`, error);
          toast.error(`Error generating questions for Level ${levelNumber}`);
        }
      }

      // Check results
      if (successCount === numLevels) {
        console.log("🎉 [AIQuestionGenerator] All levels generated successfully!");
        console.log("📦 Generated Questions:", generatedQuestionsPerLevel);

        // Call parent callback with all generated data
        onQuestionsGenerated(generatedQuestionsPerLevel);

        toast.success(
          t("questions_generated") || `All ${numLevels} levels generated successfully!`
        );
        handleClose();
      } else {
        console.warn(
          `⚠️ [AIQuestionGenerator] Only ${successCount}/${numLevels} levels were generated`
        );
        toast.error(`Only ${successCount} out of ${numLevels} levels were generated`);
      }
    } catch (error) {
      console.error("❌ [AIQuestionGenerator] Unexpected error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="glass-card p-6 h-full flex flex-col"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-main" size={20} />
          <h3 className="font-bold gradient-text">
            {t("ai_question_generator")}
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* ===== BODY (Scrollable) ===== */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* STEP 1: Configure Game Types for Each Level */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="form-label mb-3">Configure Levels</label>
          <div className="space-y-2">
            {Array.from({ length: numLevels }, (_, i) => i + 1).map((levelNumber) => (
              <motion.div
                key={levelNumber}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: levelNumber * 0.05 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-purple-main" />
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      {t("level")} {levelNumber}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Box Type Button */}
                    <motion.button
                      type="button"
                      onClick={() => handleGameTypeChange(levelNumber, "box")}
                      className={`px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium ${
                        levelGameTypes[levelNumber] === "box"
                          ? "bg-gradient-to-r from-purple-deep to-purple-main text-white shadow-md"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Package size={12} />
                      Boxes
                    </motion.button>

                    {/* Balloon Type Button */}
                    <motion.button
                      type="button"
                      onClick={() => handleGameTypeChange(levelNumber, "balloon")}
                      className={`px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium ${
                        levelGameTypes[levelNumber] === "balloon"
                          ? "bg-gradient-to-r from-orange-main to-orange-deep text-white shadow-md"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Package size={12} />
                      Balloons
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select game type for each level
          </p>
        </motion.div>

        {/* STEP 2: Enter Prompt */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="form-label">{t("enter_prompt")}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Generate 5 questions about quadratic equations. This prompt will be used for all levels."
            className="input-field w-full h-20 resize-none text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 {t("be_specific_for_better_results") || "Be specific for better results"}
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            📋 Will generate questions for {numLevels} level
            {numLevels > 1 ? "s" : ""} using{" "}
            {Array.from({ length: numLevels }, (_, i) => i + 1)
              .map((levelNum) => `${levelGameTypes[levelNum]}`)
              .join(", ")}
          </p>
        </motion.div>
      </div>

      {/* ===== GENERATE BUTTON (sticky bottom) ===== */}
      <motion.button
        type="button"
        onClick={handleGenerateAllQuestions}
        disabled={isGenerating || !prompt.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isGenerating || !prompt.trim() ? 1 : 1.02 }}
        whileTap={{ scale: isGenerating || !prompt.trim() ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isGenerating ? (
          <>
            <Loader size={16} className="animate-spin" />
            Generating {numLevels} Level{numLevels > 1 ? "s" : ""}...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate All Questions
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

export default AIQuestionGenerator;
