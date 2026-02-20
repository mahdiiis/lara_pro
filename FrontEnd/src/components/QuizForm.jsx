import { useState } from 'react';
import LevelForm from './LevelForm';
import { FaPlay, FaGamepad } from 'react-icons/fa';
import { Input } from './formQuizInputs/QuizInput';
import { Select } from './formQuizInputs/QuizSelect';

function QuizForm({ onDataChange }) {
  const [formData, setFormData] = useState({
    course: '',
    topic: '',
    gameNumber: '',
    numLevels: '2',
    levels: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      onDataChange(newData);
      return newData;
    });
  };

  const handleStart = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev, // spead the previous form data
      levels: Array(parseInt(prev.numLevels)).fill().map(() => ({ //note2
        gameType: 'Boxes', // note1  !!!!
        questions: []
      }))
    }));
  };

  return (
    <div className="card p-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <FaGamepad className="text-3xl text-primary-500" />
        <h2 className="text-2xl font-bold text-gray-800">Create Quiz</h2>
      </div>
      
      <div className="space-y-6">
        <Input 
            name="course" 
            label="Course Name" 
            value={formData.course} 
            onChange={handleInputChange} 
            placeholder="Enter course name"   
        />
        <Input 
            name="topic" 
            label="Topic" 
            value={formData.topic} 
            onChange={handleInputChange} 
            placeholder="Enter topic"   
        />
        <Input 
            type="number"
            name="gameNumber"
            label="Game Number" 
            value={formData.gameNumber}
            onChange={handleInputChange} 
            placeholder="Enter game number"
        />
        <Select 
          name="numLevels"
          label="Number of Levels"
          value={formData.numLevels}
          onChange={handleInputChange}
          levels={[1, 2, 3, 4]}
        />

        <button 
          onClick={handleStart} 
          className="btn-primary flex items-center justify-center gap-2"
        >
        <FaPlay />
          Start Creating
        </button>
      </div>

      {formData.levels.map((level, index) => (
        <LevelForm
          key={index}
          levelNumber={index + 1}
          level={level}
          onChange={(levelData) => {
            const newLevels = [...formData.levels];
            newLevels[index] = levelData;  // take the levelData from LevelForm and update the corresponding level in the levels array in formData 
            setFormData(prev => {
              const newData = { ...prev, levels: newLevels };
              onDataChange(newData);
              return newData;
            });
          }}
        />
      ))}
    </div>
  );
}

export default QuizForm;


/*
  note1
  default game type for each level , bose on the current implementation of LevelForm, it will be the default value for the gameType select input
  key must change to `level_type` because in LevelForm we are using `useState(level.level_type`
*/

/*
  note2 
  for example if numLevels is 3, it will create an array of 3 levels 3 objects with the same properties
  levels is based on numLevels entred
*/

/*
  note3
  the onChange function passed to LevelForm is used to update the levels array in formData whenever there is a change in the level data, it takes the levelData from LevelForm and updates the corresponding level in the levels array in formData, then it calls onDataChange with the updated formData to allow the parent component to get the updated form data
*/

/*
  note4
  onDataChange is a function passed as a prop to QuizForm, it is called whenever there is a change in the form data, it allows the parent component to get the updated form data and do something with it (like sending it to the backend or updating the state in the parent component)
*/

/*
  data sheared between QuizForm and LevelForm:
  - gameType: the type of game for each level, it is set to "Boxes" by default in QuizForm and can be changed in LevelForm
  - questions: an array of questions for each level, it is initially empty in QuizForm and can be updated in LevelForm when the user adds questions
  and 
  between QuizForm and parrent component:
  - formData: an object that contains all the data of the quiz
*/