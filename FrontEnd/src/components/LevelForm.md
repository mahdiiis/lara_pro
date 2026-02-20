- **if Ballloins**
  - 1 question with 10 answers.
  - each answer has a text and a boolean to indicate if it's correct or not.
- **if Box**
  - 1 question with 1 answer.
  - the answer is a text input where the student will write their answer.


### undersanding the data structure of the quiz form 

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
- ``LevelForm`` is responsible for handling the data of each level, so it will receive the level data as a prop and it will update it based on the inputs in the form, and then it will pass the updated level data to the parent component (App.jsx) through a callback function (onChange) that we will define in the App.jsx and we will pass it to the LevelForm as a prop, so when the level data is updated in the LevelForm, it will call the onChange function and pass the updated level data to the App.jsx, and then in the App.jsx we will update the quizData state with the new level data, and this will trigger a re-render of the App.jsx and it will display the updated level data in the LevelForm.
