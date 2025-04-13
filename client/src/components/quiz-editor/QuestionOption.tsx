import React from 'react';
import { QuizOption } from '@shared/schema';

interface QuestionOptionProps {
  option: QuizOption;
  index: number;
  isSelected: boolean;
  onChange: (updatedOption: QuizOption) => void;
  onSelectCorrect: (id: string) => void;
}

const QuestionOption: React.FC<QuestionOptionProps> = ({
  option,
  index,
  isSelected,
  onChange,
  onSelectCorrect
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...option,
      text: e.target.value
    });
  };

  const handleRadioChange = () => {
    onSelectCorrect(option.id);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center w-6 mr-2">
        <input 
          type="radio" 
          checked={isSelected}
          onChange={handleRadioChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
        />
      </div>
      <input 
        type="text" 
        value={option.text} 
        onChange={handleTextChange}
        placeholder={`Option ${index + 1}`}
        className={`flex-grow px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none ${
          isSelected ? 'bg-success-50 border-success-500' : 'border-neutral-300'
        }`}
      />
    </div>
  );
};

export default QuestionOption;
