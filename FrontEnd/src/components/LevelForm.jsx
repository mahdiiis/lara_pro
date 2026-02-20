import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Gamepad, Check, X, Trash, Package, Layers } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

import { Box_Bal }  from "./LevelForm_btn_inp/box_bal";

function LevelForm({ levelNumber, level, onChange }) { // levelNumber={levelIndex + 1}//level={quizData.levels[levelIndex]} 
  const { t } = useLanguage();
  const [levelType, setLevelType] = useState(level.level_type || "box");
  const [questions, setQuestions] = useState(level.questions || []);
  const [singleQuestion, setSingleQuestion] = useState(level.question || "");
  const [answers, setAnswers] = useState(level.answers || []);

//========================= vv ======================================

  const handleLevelTypeChange = (type) => {         //the type is handled her but level_number is handled in app , so this fucntion is just prepering the data structure based on the type of the level that we want to create, if it's box we create a level with questions array, if it's balloon we create a level with question and answers array
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

//===================== ^^ ==========================================

  const handleAddQuestion = () => {
    if (levelType === "balloon") {
      if (answers.length < 10) {
        const newAnswer = { text: "", is_true: false };                     //here i create an object unswer structure to get filled latter //  my unswer is a text and a boolean that indicates if it's true or false
        const newAnswers = [...answers, newAnswer];                         // create a new array with the new answer
        setAnswers(newAnswers);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          question: singleQuestion,
          answers: newAnswers,                                               // ====> adding answers 
        });
      }
    } else {
      if (questions.length < 5) {
        const newQuestions = [...questions, { text: "", answer: "" }];       // here a question is an object with a text and an answer, so when i add a new question, i add an object with empty text and empty answer to the questions array
        setQuestions(newQuestions);
        onChange({
          level_number: levelNumber,
          level_stats: level.level_stats,
          level_type: levelType,
          questions: newQuestions,                                            // ====> adding questions and its answer but the text and the answer are empty for now and will be filled when the user type in the inputs
        });  
      }
    }
  };

//===============================================================

  const handleQuestionChange = (index, field, value) => {                 // handleQuestionChange(0, "question", e.target.value)
    if (levelType === "balloon") { 
      if (field === "question") {
        setSingleQuestion(value);
        onChange({
          level_number: levelNumber,                                       // this level number is the same unless i click the ''next'' button 
          level_stats: level.level_stats,
          level_type: levelType,
          question: value,
          answers,                                                          // arrays of objects like that [{ text: "answer 1", is_true: false }, { text: "answer 2", is_true: true }]
        });
      } else {
        const newAnswers = answers.map((a, i) => {                          // at least i have 1 answer in the array because i can't change the question unless i add an answer, so when i change the question or the true or false of the answer, i need to update the answers array and then send the new data to the onChange to update the quiz data in the app
          if (i === index) {
            return { ...a, [field === "answer" ? "text" : field]: value };  // handleQuestionChange used in (answer input ) ===> (index, "answer", e.target.value)  // handleQuestionChange used in (true/false btn ) ===> handleQuestionChange(index, "is_true", !answer.is_true)
                                                                            // so an unswer object id like that { text: "the answer", is_true: false }, if the field is "answer" we update the text, if the field is "is_true" we update the is_true
          }
          return a;                                                         //a is my object { text: "the answer", is_true: false} but filled with the data that the user type in the inputs and the true or false that the user select in the true or false button, so when i change something in the answer, i update the answers array with the new data and then i send it to the onChange to update the quiz data in the app
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
        if (i === index) {                                                //handleQuestionChange(index, "text", e.target.value) handleQuestionChange(index, "answer", e.target.value)
          return { ...q, [field]: value };
        }
        return q;
      });
      setQuestions(newQuestions);
      onChange({                                                          // updating the App with the new questions array when i change the question or the answer in the box level, so when i change something in the question or the answer, i update the questions array with the new data and then i send it to the onChange to update the quiz data in the app
        level_number: levelNumber,
        level_stats: level.level_stats,
        level_type: levelType,
        questions: newQuestions,
      });
    }
  };

//===============================================================

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
                              //===============================================================
  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
{/* ================================================ */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-deep to-purple-main flex items-center justify-center shadow-md hover-glow">
          <Gamepad className="text-xl text-white" />
        </div>
        <h3 className="text-xl font-bold gradient-text">
          {t("level")} {levelNumber}
        </h3>
      </div>
{/* ================================================ */}
      <div className="mb-6">
        <label className="form-label">{t("game_type")}</label>
        <div className="flex gap-4">
          {/* ================================================ */}  
          <Box_Bal levelType="box" handleLevelTypeChange={handleLevelTypeChange} curretnLevelType={levelType} />
          <Box_Bal levelType="balloon" handleLevelTypeChange={handleLevelTypeChange} curretnLevelType={levelType} />
          {/* ================================================ */}
        </div>
      </div>
{/* ================================================ */}
      <div className="space-y-6">
        {levelType === "balloon" ? ( // in balloon  we use  handleQuestionChange 3 times, one for the question, one for the answer and one for the true or false, in box we use it only 2 times, one for the question and one for the answer
          <>
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
{/* ============================ -- ==================== */}
            <AnimatePresence>
              {answers.map((answer, index) => (  // here if i have the empty array of answers so i have no answers, the map will not render anything, but if i click the add answer button, it will add a new answer to the array and then the map will render the new answer with the input and the true or false button and the delete button, and if i click the add answer button again, it will add another answer to the array and then the map will render the 2 answers, etc
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex gap-4 items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600"
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
                      handleQuestionChange(index, "is_true", !answer.is_true) // sending is_true so we apdate the is_true 
                    }
                    className={`toggle-btn ${
                      answer.is_true ? "toggle-btn-true" : "toggle-btn-false"
                    }`}
                  >
                    {answer.is_true ? <Check size={18} /> : <X size={18} />}
                    {answer.is_true ? t("true") : t("false")}
                  </button>
                  {/* ========================= ^^======================== */}
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

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
          // =========================== -Box part- ====================
          <>
            <AnimatePresence>
              {questions.map((q, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex gap-4 items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-purple-main dark:text-purple-light w-24">
                        {t("question")} {index + 1}
                      </span>
                      {/* ============================== vv ==================================== */}
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
                    {/* ============================== ^^ ==================================== */}
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
    </motion.div>
  );
}

export default LevelForm;
