# AI Question Generator Integration - Documentation

## Overview
Add an AI-powered question generator to InitialForm that allows users to generate questions for a specific level without manually filling the LevelForm.

---

## Architecture Changes

### 1. InitialForm.jsx Modifications

#### New State Variables
```javascript
const [showAIForm, setShowAIForm] = useState(false);  // Toggle AI form visibility
const [aiFormData, setAIFormData] = useState({
  selectedLevel: null,         // Selected level number (1, 2, 3, etc)
  selectedGameType: null,      // Selected game type ("box" or "balloon")
  prompt: "",                  // User's prompt for AI
  isGenerating: false,         // Loading state
  generatedQuestions: null,    // Generated questions data
});
```

#### New UI Sections

**1. Main Button in InitialForm:**
```jsx
<motion.button
  onClick={() => setShowAIForm(!showAIForm)}
  className="btn-secondary flex items-center gap-2"
>
  <Sparkles size={18} />
  {t("generate_with_ai")}
</motion.button>
```

**2. AI Form Panel (appears on right side):**
- Step 1: Level Selection (Dropdown: Level 1, 2, 3, etc.)
- Step 2: Game Type Selection (Buttons: Boxes / Balloons)
- Step 3: Prompt Input (Text area for AI prompt)
- Step 4: Generate Button

#### New Functions

```javascript
const handleAIFormChange = (field, value) => {
  setAIFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleGenerateQuestions = async () => {
  setAIFormData(prev => ({ ...prev, isGenerating: true }));
  
  try {
    // Call backend API to generate questions
    const response = await fetch(`${apiUrl}generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: aiFormData.prompt,
        gameType: aiFormData.selectedGameType,
        level: aiFormData.selectedLevel
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update the level with generated questions
      updateLevelWithAIQuestions(aiFormData.selectedLevel, data);
      setShowAIForm(false);
    } else {
      toast.error(data.message || "Failed to generate questions");
    }
  } catch (error) {
    toast.error("Error generating questions");
    console.error(error);
  } finally {
    setAIFormData(prev => ({ ...prev, isGenerating: false }));
  }
};

const updateLevelWithAIQuestions = (levelNumber, questionsData) => {
  const levelIndex = levelNumber - 1;
  const newLevels = [...formData.levels];
  
  if (aiFormData.selectedGameType === "balloon") {
    newLevels[levelIndex] = {
      ...newLevels[levelIndex],
      level_type: "balloon",
      question: questionsData.question,
      answers: questionsData.answers
    };
  } else {
    newLevels[levelIndex] = {
      ...newLevels[levelIndex],
      level_type: "box",
      questions: questionsData.questions
    };
  }
  
  const updatedData = { ...formData, levels: newLevels };
  setFormData(updatedData);
  onDataChange(updatedData);
};
```

---

### 2. Backend API Endpoint

#### Create New File: `BackEnd/app/Http/Controllers/AIQuestionController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIQuestionController extends Controller
{
    public function generateQuestions(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:1000',
            'gameType' => 'required|in:box,balloon',
            'level' => 'required|integer|min:1'
        ]);

        try {
            $questions = match($validated['gameType']) {
                'box' => $this->generateBoxQuestions($validated['prompt']),
                'balloon' => $this->generateBalloonQuestions($validated['prompt']),
            };

            return response()->json($questions);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate questions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function generateBoxQuestions($prompt)
    {
        // Call OpenAI API or similar
        $response = Http::post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Generate 5 quiz questions with answers. Return as JSON: {"questions": [{"text": "...", "answer": "..."}]}'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ]
        ]);

        return json_decode($response->body())->data;
    }

    private function generateBalloonQuestions($prompt)
    {
        // Similar logic but for balloon type
        // Returns: {"question": "...", "answers": [{"text": "...", "is_true": true}]}
    }
}
```

#### Add Route: `BackEnd/routes/api.php`

```php
Route::post('/generate-questions', [AIQuestionController::class, 'generateQuestions'])->middleware('auth:sanctum');
```

---

### 3. New Component: AIQuestionForm.jsx (Optional)

You can extract the AI form into a separate component:

```jsx
// FrontEnd/src/components/AIQuestionForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function AIQuestionForm({ 
  numLevels, 
  onGenerate, 
  onClose,
  isGenerating 
}) {
  const [aiData, setAIData] = useState({
    selectedLevel: null,
    selectedGameType: null,
    prompt: ""
  });

  return (
    // Form JSX here
  );
}
```

---

### 4. UI Layout Changes

**InitialForm Layout:**
```
┌─────────────────────────────────────────────┐
│         Initial Form (Left)     │ AI Form   │
│  ├─ Course Input                │ (Right)   │
│  ├─ Topic Input                 │           │
│  ├─ Game Number Input           │ - Level   │
│  ├─ Number of Levels Select     │   Select  │
│  ├─ [Get Questions with AI] btn │ - Game    │
│  │                              │   Type    │
│  └─ [Start Creating] btn        │ - Prompt  │
│                                 │ - Generate│
└─────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### Phase 1: Frontend
1. ✅ Add state variables for AI form
2. ✅ Create AI form UI panel
3. ✅ Add toggle button for AI form
4. ✅ Create level selection dropdown
5. ✅ Create game type selection buttons
6. ✅ Add prompt input textarea
7. ✅ Create generate button with loading state
8. ✅ Handle API response and update levels

### Phase 2: Backend
1. Create AIQuestionController
2. Add generate-questions route
3. Integrate OpenAI API
4. Add error handling
5. Test endpoint

### Phase 3: Integration
1. Connect frontend to backend
2. Add loading indicators
3. Add success/error messages
4. Test full flow

---

## Code Flow Diagram

```
User fills InitialForm
    ↓
Clicks "Get Questions with AI"
    ↓
AI Form appears on right
    ↓
Selects Level (1, 2, 3...)
    ↓
Shows Game Type buttons (Box/Balloon)
    ↓
Selects Game Type
    ↓
Shows Prompt Input
    ↓
Enters Prompt & Clicks Generate
    ↓
Calls Backend API: POST /api/generate-questions
    ↓
Backend calls OpenAI API
    ↓
Returns generated questions
    ↓
Frontend updates that level's questions
    ↓
User can continue creating other levels
    ↓
Submits form with AI-generated + manual levels
```

---

## Files to Modify

### Frontend
- [ ] `FrontEnd/src/components/InitialForm.jsx` - Add AI form logic
- [ ] `FrontEnd/src/components/InitialForm.md` - Update documentation
- [ ] `FrontEnd/src/utils/api.js` - Add AI API function
- [ ] `FrontEnd/src/hooks/useLanguage.js` - Add translation keys

### Backend
- [ ] Create `BackEnd/app/Http/Controllers/AIQuestionController.php`
- [ ] Add route in `BackEnd/routes/api.php`
- [ ] Create `.env` variable for OpenAI API key
- [ ] Create migration for `ai_generation_logs` table (optional)

---

## Environment Variables Needed

### Frontend (.env)
```
VITE_OPENAI_API_KEY=sk-...
```

### Backend (.env)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

---

## Translation Keys to Add

```javascript
{
  "generate_with_ai": "Generate with AI",
  "ai_question_generator": "AI Question Generator",
  "select_level": "Select Level",
  "enter_prompt": "Enter your prompt for AI",
  "generating_questions": "Generating questions...",
  "questions_generated": "Questions generated successfully!",
  "generation_failed": "Failed to generate questions"
}
```

---

## Testing Checklist

- [ ] AI form appears/disappears on button click
- [ ] Level selection dropdown works
- [ ] Game type selection works
- [ ] Prompt input accepts text
- [ ] Generate button calls API
- [ ] Loading spinner shows during generation
- [ ] Generated questions populate the level
- [ ] User can continue with other levels
- [ ] Form submission includes AI-generated questions
- [ ] Error handling works properly

---

## Future Enhancements

1. Save generated questions to database (AI generation logs)
2. Allow regenerating questions if not satisfied
3. Allow editing AI-generated questions before saving
4. Add different AI models (GPT-3.5, Claude, etc.)
5. Add question count selector
6. Add difficulty level selector
7. Support for different languages

