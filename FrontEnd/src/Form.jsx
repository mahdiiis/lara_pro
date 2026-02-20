import { useState } from "react";

const Form = () => {
  const [formData, setFormData] = useState({
    levels: [],
    player_info: {
      current_level: 1,
      lives: 3,
      score: 0,
    },
  });

  const addLevel = (levelType) => {
    if (formData.levels.length >= 4) {
      alert("You can only have a maximum of 4 levels.");
      return;
    }

    const newLevel = {
      level_number: formData.levels.length + 1,
      level_stats: {
        coins: 0,
        lifes: 5,
        mistakes: 0,
        stars: 0,
        time_spent: 0,
      },
      level_type: levelType,
      questions: levelType === "box" ? Array(5).fill({ text: "", answer: "" }) : [],
      question: levelType === "balloon" ? "Your question here" : "",
      answers: levelType === "balloon" ? Array(10).fill({ is_true: false, text: "" }) : [],
    };

    setFormData({
      ...formData,
      levels: [...formData.levels, newLevel],
    });
  };

  const deleteLevel = (levelIndex) => {
    const updatedLevels = formData.levels.filter((_, index) => index !== levelIndex);
    setFormData({ ...formData, levels: updatedLevels });
  };

  const updateQuestion = (levelIndex, questionIndex, key, value) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex].questions[questionIndex][key] = value;
    setFormData({ ...formData, levels: updatedLevels });
  };

  const updateLevel = (levelIndex, key, value) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex][key] = value;
    setFormData({ ...formData, levels: updatedLevels });
  };

  const deleteQuestion = (levelIndex, questionIndex) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex].questions.splice(questionIndex, 1);
    setFormData({ ...formData, levels: updatedLevels });
  };

  const updateAnswer = (levelIndex, answerIndex, key, value) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex].answers[answerIndex][key] = value;
    setFormData({ ...formData, levels: updatedLevels });
  };

  const deleteAnswer = (levelIndex, answerIndex) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex].answers.splice(answerIndex, 1);
    setFormData({ ...formData, levels: updatedLevels });
  };

  const generateJSON = () => {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gameData.json";
    a.click();
  };

  return (
    <div className="p-5 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-4">Game Level Creator</h2>
      <button
        onClick={() => addLevel("box")}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
      >
        Add Box Level
      </button>
      <button
        onClick={() => addLevel("balloon")}
        className="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Add Balloon Level
      </button>
      <div className="mt-4">
        {formData.levels.map((level, index) => (
          <div key={index} className="mt-4 p-3 border rounded-md">
            <h3 className="font-bold">Level {level.level_number}</h3>
            <p>Type: {level.level_type}</p>
            <button
              onClick={() => deleteLevel(index)}
              className="bg-red-500 text-white px-4 py-2 rounded-md mb-2"
            >
              Delete Level
            </button>
            {level.level_type === "box" && (
              <div>
                {level.questions.map((question, qIndex) => (
                  <div key={qIndex} className="mt-2">
                    <label>
                      Question {qIndex + 1} Text:
                      <input
                        type="text"
                        className="ml-2 p-1 border rounded"
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(index, qIndex, "text", e.target.value)
                        }
                      />
                    </label>
                    <label className="ml-4">
                      Answer:
                      <input
                        type="text"
                        className="ml-2 p-1 border rounded"
                        value={question.answer}
                        onChange={(e) =>
                          updateQuestion(index, qIndex, "answer", e.target.value)
                        }
                      />
                    </label>
                    <button
                      onClick={() => deleteQuestion(index, qIndex)}
                      className="bg-red-500 text-white px-2 py-1 ml-2 rounded-md"
                    >
                      Delete Question
                    </button>
                  </div>
                ))}
              </div>
            )}
            {level.level_type === "balloon" && (
              <div>
                <label>
                  Question:
                  <input
                    type="text"
                    className="ml-2 p-1 border rounded"
                    value={level.question}
                    onChange={(e) =>
                      updateLevel(index, "question", e.target.value)
                    }
                  />
                </label>
                <div>
                  {level.answers.map((answer, aIndex) => (
                    <div key={aIndex} className="mt-2">
                      <label>
                        Answer {aIndex + 1} Text:
                        <input
                          type="text"
                          className="ml-2 p-1 border rounded"
                          value={answer.text}
                          onChange={(e) =>
                            updateAnswer(index, aIndex, "text", e.target.value)
                          }
                        />
                      </label>
                      <label className="ml-4">
                        Is True:
                        <input
                          type="checkbox"
                          className="ml-2"
                          checked={answer.is_true}
                          onChange={(e) =>
                            updateAnswer(index, aIndex, "is_true", e.target.checked)
                          }
                        />
                      </label>
                      <button
                        onClick={() => deleteAnswer(index, aIndex)}
                        className="bg-red-500 text-white px-2 py-1 ml-2 rounded-md"
                      >
                        Delete Answer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={generateJSON}
        className="mt-5 bg-orange-500 text-white px-4 py-2 rounded-md"
      >
        Generate JSON
      </button>
      <pre className="mt-4 bg-gray-100 p-3 rounded-md text-sm overflow-auto">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </div>
  );
};

export default Form;
