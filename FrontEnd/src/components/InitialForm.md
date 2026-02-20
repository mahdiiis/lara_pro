## Data Flow Overview

### When Form Input Changes

1. Input field value changes in the form
2. `formData` state is updated with the new value
3. `onDataChange` callback is triggered with updated `formData`
4. Parent component (QuizForm) receives and updates its state
5. QuizForm passes updated data to child components (LevelForm, etc.) as props
6. Child components re-render with new data and display appropriate fields

---

## onDataChange Callback

**Called in 2 scenarios:**

1. **When user modifies an input field** - Sends updated `formData` as user types
2. **When user clicks "Start Quiz" button** - Sends final `formData` to initialize the quiz

## updatedData 

1. **responsible for updating the form data state in the parent component (QuizForm)**
2. **used to pass the updated form data back to the parent component whenever there is a change in the form inputs.**
3. **ensures that the parent component has the most current form data to work with, allowing it to manage the state of the quiz creation process effectively.**

---

## Form Data Transformation

### Initial Form State
```json
{
  "course": "",
  "topic": "",
  "gameNumber": "",
  "numLevels": "2",
  "levels": []
}
```

### Final Submission Data (onSubmit)
```jsx
{
  course: "", // handled by inputs in the form
  topic: "", // handled by inputs in the form
  gameNumber: "", // handled by inputs in the form
  numLevels: "2", // handled by inputs in the form
  levels: [   // generated based on numLevels input, with default values for each level

          // == Example of a single level structure ==
    {
      level_number: 1,
      level_type: "box",
      level_stats: {
          coins: 0,
          lifes: 5,
          mistakes: 0,
          stars: 1,
          time_spent: 0,
      },
      questions: []
    }
  ],
          // == Additional fields for quiz initialization ==
    player_info: {
    current_level: 1,
    lives: 3,
    score: 0,
  },
  config: {
    quiz_name: "quizName",
    num_levels: 2,
    game_type: "gameType"
  }
}
```







### Setting data in localStorage and adding 1 steep 
```jsx


  const [quizData, setQuizData] = useState(() => {
    const savedData = localStorage.getItem("quizFormData");
    return savedData
      ? JSON.parse(savedData)
      : {
          course: "",
          topic: "",
          gameNumber: "",
          numLevels: "2",
          levels: [],
          player_info: {
            current_level: 1,
            lives: 3,
            score: 0,
          },
        };
  });

 // =====================================================

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    localStorage.setItem("quizFormData", JSON.stringify(quizData));
  }, [quizData]);

  const handleQuizDataChange = (newData) => {  // newData is resived from on dataChange in InitialForm and LevelForm
    setQuizData(newData);
    if (newData.levels.length > 0 && currentStep === 0) {
      setCurrentStep(1);
    }
  };
```

---

## Form Submission & Auto Step Advancement

### What Happens When You Submit InitialForm

When user fills all inputs and clicks "Start Quiz" button:

1. **InitialForm generates 2 empty levels:**
   ```javascript
   levels: [
     { level_number: 1, level_type: "box", questions: [], ... },
     { level_number: 2, level_type: "box", questions: [], ... }
   ]
   ```

2. **InitialForm calls `onDataChange` with complete data**

3. **Parent (App.jsx) receives updated data in `handleQuizDataChange`**

4. **Both conditions are checked:**
   ```javascript
   if (newData.levels.length > 0 && currentStep === 0) {
   ```
   - ✅ `newData.levels.length > 0` → TRUE (has 2 levels)
   - ✅ `currentStep === 0` → TRUE (still on initial form)

5. **Result:**
   ```javascript
   setCurrentStep(1);  // Auto-advances to Level 1 form
   ```

**Summary:** Submitting the InitialForm automatically creates 2 empty levels AND advances the user to step 1 to start editing Level 1.






## see
  - await ? 
  ```jsx
    try {
        const response = await AI_API_ADDON.generateQuestions({
          prompt: aiFormData.prompt,
          gameType: aiFormData.selectedGameType,
          level: aiFormData.selectedLevel,
        });

        if (response.status === 200) {
          const gener ............ 
  ```
  - separer AI component
  - set data in localStorage  
