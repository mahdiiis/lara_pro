# 🤖 AI QUESTION GENERATOR - INTERNSHIP TASK GUIDE

## 📋 YOUR ASSIGNMENT

Add an **AI-powered question generator** to the 2Pi Dashboard. Teachers can:
1. **Input a prompt** (e.g., "Generate 10 algebra questions about quadratic equations")
2. **Provide a link** (e.g., Wikipedia article, PDF, web page)
3. **AI generates questions** automatically
4. **Questions populate the quiz** (skipping manual input)

---

## 🎯 WHAT YOU NEED TO BUILD

### Frontend (React)
```
New Component: AIQuestionGenerator.jsx
├─ Input field for prompt/link
├─ Button to send to backend
├─ Loading spinner while AI generates
├─ Display generated questions
└─ Button to use these questions in quiz
```

### Backend (Laravel)
```
New Endpoint: POST /api/generate-questions
├─ Receive: prompt OR link
├─ Call OpenAI API (or similar AI service)
├─ Parse response
├─ Return formatted questions
└─ Handle errors gracefully
```

### Database
```
NEW TABLE: ai_generation_logs (optional)
├─ id
├─ user_id
├─ prompt_or_link
├─ generated_questions
├─ model_used (GPT-4, etc.)
├─ created_at
```

---

## 🏗️ ARCHITECTURE - WHERE IT FITS

### Current Flow:
```
Dashboard → Create Quiz → InitialForm → LevelForms → Preview → Submit
```

### NEW Flow:
```
Dashboard → Create Quiz → InitialForm → [NEW: AI Generator] → LevelForms → Preview → Submit
                                             ↑
                                      Generate questions
                                      OR skip & manual input
```

---

## 📝 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Create React Component (Frontend)

**Create file:** `src/components/AIQuestionGenerator.jsx`

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Link, FileText, Check } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import axios from "axios";

function AIQuestionGenerator({ onQuestionsGenerated, levelType }) {
  const { t } = useLanguage();
  const [inputMode, setInputMode] = useState("prompt"); // "prompt" or "link"
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleGenerateQuestions = async () => {
    if (!input.trim()) {
      setError("Please enter a prompt or link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${apiUrl}generate-questions`, {
        input: input,
        mode: inputMode, // "prompt" or "link"
        level_type: levelType, // "box" or "balloon"
      });

      setGeneratedQuestions(response.data.questions);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleUseQuestions = () => {
    onQuestionsGenerated(generatedQuestions);
  };

  return (
    <motion.div
      className="glass-card p-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-3xl text-purple-main" />
        <h2 className="text-2xl font-bold gradient-text">
          AI Question Generator
        </h2>
      </div>

      {!generatedQuestions ? (
        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="form-label">Choose Input Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setInputMode("prompt")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  inputMode === "prompt"
                    ? "bg-purple-main text-white"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <FileText size={18} className="inline mr-2" />
                Write Prompt
              </button>
              <button
                onClick={() => setInputMode("link")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  inputMode === "link"
                    ? "bg-cyan-main text-white"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Link size={18} className="inline mr-2" />
                Paste Link
              </button>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="form-label">
              {inputMode === "prompt"
                ? "Describe what questions you want"
                : "Paste a URL to extract content from"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                inputMode === "prompt"
                  ? "E.g., Generate 5 questions about photosynthesis"
                  : "E.g., https://en.wikipedia.org/wiki/Photosynthesis"
              }
              className="input-field min-h-32"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Questions
              </>
            )}
          </motion.button>

          <p className="text-sm text-gray-500 text-center">
            AI will generate questions based on your {inputMode}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Display Generated Questions */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Generated Questions</h3>
            {levelType === "box" ? (
              // Display for Box type (Q&A pairs)
              generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-purple-main"
                >
                  <p className="font-semibold text-purple-main">
                    Q{idx + 1}: {q.text}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    A: {q.answer}
                  </p>
                </div>
              ))
            ) : (
              // Display for Balloon type (Q with multiple answers)
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-cyan-main">
                <p className="font-semibold text-cyan-main mb-4">
                  {generatedQuestions[0].question}
                </p>
                <div className="space-y-2">
                  {generatedQuestions[0].answers.map((ans, idx) => (
                    <p
                      key={idx}
                      className={`p-2 rounded ${
                        ans.is_true
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      ○ {ans.text} {ans.is_true && "✓ Correct"}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              onClick={() => {
                setGeneratedQuestions(null);
                setInput("");
              }}
              className="btn-secondary flex-1"
            >
              ← Generate Again
            </motion.button>
            <motion.button
              onClick={handleUseQuestions}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Use These Questions
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AIQuestionGenerator;
```

---

### STEP 2: Add to App.jsx

**Modify:** `src/App.jsx`

```jsx
// Add import at top
import AIQuestionGenerator from "./components/AIQuestionGenerator";
import LevelForm from "./components/LevelForm";

// Update renderCurrentStep() function
const renderCurrentStep = () => {
  if (currentStep === 0) {
    return (
      <InitialForm data={quizData} onDataChange={handleQuizDataChange} />
    );
  }
  
  // NEW: Step for AI Question Generator (optional step)
  // If user clicks "Generate with AI" button in LevelForm
  if (currentStep === "ai-generator") {
    const levelIndex = parseInt(localStorage.getItem("aiLevelIndex")) || 0;
    return (
      <AIQuestionGenerator
        levelType={quizData.levels[levelIndex].level_type}
        onQuestionsGenerated={(questions) => {
          // Populate the level with AI-generated questions
          const newLevels = [...quizData.levels];
          newLevels[levelIndex] = {
            ...newLevels[levelIndex],
            ...(quizData.levels[levelIndex].level_type === "box"
              ? { questions }
              : {
                  question: questions[0].question,
                  answers: questions[0].answers,
                }),
          };
          handleQuizDataChange({ ...quizData, levels: newLevels });
          setCurrentStep(levelIndex + 1); // Go back to LevelForm
          localStorage.removeItem("aiLevelIndex");
        }}
      />
    );
  }

  if (currentStep <= quizData.levels.length) {
    const levelIndex = currentStep - 1;
    return (
      <div className="space-y-4">
        <LevelForm
          key={levelIndex}
          levelNumber={levelIndex + 1}
          level={quizData.levels[levelIndex]}
          onChange={(levelData) => {
            const newLevels = [...quizData.levels];
            newLevels[levelIndex] = levelData;
            handleQuizDataChange({ ...quizData, levels: newLevels });
          }}
          // NEW: Add AI generator button
          onUseAI={() => {
            localStorage.setItem("aiLevelIndex", levelIndex);
            setCurrentStep("ai-generator");
          }}
        />
        {/* Rest of the navigation buttons... */}
      </div>
    );
  }
  
  return <Preview ... />;
};
```

---

### STEP 3: Add Button to LevelForm

**Modify:** `src/components/LevelForm.jsx`

```jsx
function LevelForm({ levelNumber, level, onChange, onUseAI }) {
  // ... existing code ...

  return (
    <motion.div className="glass-card p-8">
      {/* ... existing code ... */}
      
      {/* Add this before the Add Question button */}
      <motion.button
        onClick={onUseAI}
        className="mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-main to-cyan-main text-white rounded-lg hover:opacity-90"
      >
        <Sparkles size={18} />
        Generate with AI
      </motion.button>

      {/* Existing Add Question button */}
      {answers.length < 10 && (
        <motion.button
          onClick={handleAddQuestion}
          className="btn-secondary flex items-center justify-center gap-2 w-full"
        >
          <Plus size={18} />
          {t("add_answer")} ({answers.length}/10)
        </motion.button>
      )}
    </motion.div>
  );
}

export default LevelForm;
```

---

### STEP 4: Create Backend Endpoint (Laravel)

**Create file:** `app/Http/Controllers/AIQuestionController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OpenAI\Client;

class AIQuestionController extends Controller
{
    public function generateQuestions(Request $request)
    {
        $validated = $request->validate([
            'input' => 'required|string|max:5000',
            'mode' => 'required|in:prompt,link', // prompt or link
            'level_type' => 'required|in:box,balloon',
        ]);

        try {
            // Get content (either from prompt or fetch from link)
            $content = $this->getContent(
                $validated['input'],
                $validated['mode']
            );

            // Generate questions using OpenAI
            $questions = $this->generateQuestionsWithAI(
                $content,
                $validated['level_type']
            );

            // Optional: Log this generation for analytics
            // AIGenerationLog::create([
            //     'user_id' => auth()->id(),
            //     'input' => $validated['input'],
            //     'mode' => $validated['mode'],
            //     'generated_questions' => json_encode($questions),
            // ]);

            return response()->json([
                'success' => true,
                'questions' => $questions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate questions: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getContent($input, $mode)
    {
        if ($mode === 'prompt') {
            // If it's a prompt, return it as-is
            return $input;
        } else {
            // If it's a link, fetch and extract content
            $content = file_get_contents($input);
            // Parse HTML, extract text, remove scripts/styles
            // You might use a library like simple_html_dom or Goutte
            return strip_tags($content);
        }
    }

    private function generateQuestionsWithAI($content, $levelType)
    {
        $apiKey = env('OPENAI_API_KEY');
        $client = new Client($apiKey);

        if ($levelType === 'box') {
            $prompt = $this->generateBoxPrompt($content);
            $format = "Return as JSON array of objects with 'text' and 'answer' fields";
        } else {
            $prompt = $this->generateBalloonPrompt($content);
            $format = "Return as JSON object with 'question' and 'answers' array (each with 'text' and 'is_true' fields)";
        }

        $response = $client->chat()->create([
            'model' => 'gpt-4',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful educational assistant that creates math quiz questions.',
                ],
                [
                    'role' => 'user',
                    'content' => $prompt . "\n\n" . $format,
                ],
            ],
            'temperature' => 0.7,
        ]);

        $responseText = $response->choices[0]->message->content;
        
        // Extract JSON from response
        preg_match('/\{.*\}|\[.*\]/s', $responseText, $matches);
        $questions = json_decode($matches[0], true);

        return is_array($questions) ? $questions : [$questions];
    }

    private function generateBoxPrompt($content)
    {
        return "Based on this content:\n\n{$content}\n\nGenerate 5 multiple-choice math questions with clear answers.";
    }

    private function generateBalloonPrompt($content)
    {
        return "Based on this content:\n\n{$content}\n\nGenerate 1 math question with 10 possible answers (some correct, some incorrect).";
    }
}
```

---

### STEP 5: Add Route (Laravel)

**Modify:** `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    // Existing routes...
    
    // NEW: AI Question Generator
    Route::post('/generate-questions', [AIQuestionController::class, 'generateQuestions']);
});
```

---

### STEP 6: Setup OpenAI API Key

**Modify:** `.env` file in Backend

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

**Also modify:** `config/services.php`

```php
'openai' => [
    'api_key' => env('OPENAI_API_KEY'),
],
```

---

### STEP 7: Install OpenAI PHP Package

**In Backend Terminal:**

```bash
cd BackEnd
composer require openai-php/client
```

---

## 🎯 USAGE FLOW FOR TEACHERS

```
1. Click "Create Quiz"
2. Fill InitialForm (course, topic, numLevels)
3. Click "Start Creating"
4. Sees LevelForm for Level 1
5. Can either:
   a) Click "Generate with AI" → AIQuestionGenerator opens
   b) Type prompt or paste link
   c) AI generates questions
   d) Review & click "Use These Questions"
   e) Questions populate the level
   OR
   f) Just manually add questions normally
6. Click "Next" after each level
7. Preview → Submit to database
```

---

## 🔄 DATA FLOW

```
Frontend (Teacher)
  ↓
Prompt or Link typed in AIQuestionGenerator
  ↓
POST /api/generate-questions
  ↓
Backend (Laravel)
  ├─ Get content (prompt or fetch link)
  ├─ Call OpenAI API
  ├─ Parse response
  └─ Return formatted questions
  ↓
Frontend (React)
  ├─ Display generated questions
  ├─ Show "Use These Questions" button
  └─ Populate LevelForm with questions
```

---

## 🧪 TESTING YOUR IMPLEMENTATION

### Test Case 1: Generate from Prompt
```
Input: "5 quadratic equation problems"
Expected: 5 questions about quadratic equations with answers
```

### Test Case 2: Generate from Link
```
Input: https://example.com/math-article
Expected: Questions based on article content
```

### Test Case 3: Error Handling
```
Input: Empty field
Expected: Error message "Please enter a prompt or link"
```

### Test Case 4: Use Generated Questions
```
1. Generate questions
2. Click "Use These Questions"
3. Verify they populate the LevelForm
```

---

## 📚 TECHNOLOGIES YOU'LL LEARN

### Frontend
- ✅ React Component with async operations
- ✅ Loading states & error handling
- ✅ Form input management
- ✅ Integration with parent components (callbacks)

### Backend
- ✅ Laravel controllers
- ✅ API request handling
- ✅ External API integration (OpenAI)
- ✅ JSON parsing & response formatting
- ✅ Error handling & validation

### DevOps/System
- ✅ Managing API keys securely (environment variables)
- ✅ Installation of external packages (Composer)
- ✅ API rate limiting & cost management

---

## 💰 COST CONSIDERATIONS

**OpenAI API Pricing** (as of 2024):
- GPT-4: ~$0.03 per 1K tokens
- Average question generation: ~500 tokens
- **Cost per quiz: ~$0.015** (very cheap!)

**Set up usage limits** in OpenAI dashboard to prevent surprises.

---

## 🚀 NEXT STEPS (After Implementation)

1. **Test thoroughly** with different prompts & links
2. **Improve prompt engineering** - Make better AI prompts for better questions
3. **Add question validation** - Check if generated questions make sense
4. **Implement caching** - Don't regenerate same prompt twice
5. **Analytics** - Track which prompts generate best questions
6. **Batch generation** - Generate all levels at once
7. **Custom AI models** - Fine-tune model on good math questions

---

## 🐛 COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| **API Key not found** | Check `.env` file has OPENAI_API_KEY |
| **JSON parsing fails** | OpenAI might return text, not pure JSON - use regex to extract |
| **Timeout on large links** | Set timeout limit, use chunking for large content |
| **Generated questions are bad** | Improve the prompt text, be more specific |
| **Rate limiting** | Add delay between requests, cache responses |

---

## 📋 FINAL CHECKLIST

- [ ] AIQuestionGenerator.jsx component created
- [ ] Component integrated into App.jsx
- [ ] "Generate with AI" button added to LevelForm
- [ ] Backend AIQuestionController created
- [ ] Route added to api.php
- [ ] OpenAI package installed
- [ ] .env has OPENAI_API_KEY
- [ ] Test with real prompts
- [ ] Test with real links
- [ ] Error handling works
- [ ] Loading spinner shows while generating
- [ ] Generated questions display correctly
- [ ] "Use These Questions" button populates LevelForm
- [ ] Questions save correctly when submitting quiz

---

## 🎓 GOOD LUCK!

This is a **solid internship project**. You're adding real value to the platform by:
- Saving teachers time (AI generates questions automatically)
- Improving platform attractiveness (modern AI feature)
- Learning full-stack development (frontend + backend + third-party APIs)

**Go build something great! 🚀**
