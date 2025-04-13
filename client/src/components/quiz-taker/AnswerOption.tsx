import React from 'react';
import { QuizOption } from '@shared/schema';

interface AnswerOptionProps {
  option: QuizOption;
  isSelected: boolean;
  isSubmitted: boolean;
  onSelect: () => void;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isSelected,
  isSubmitted,
  onSelect
}) => {
  // Simple click handler
  const handleClick = () => {
    console.log("Option clicked:", option.id);
    if (!isSubmitted) {
      onSelect();
    }
  };

  // Determine the background color based on state
  let backgroundColor = "bg-white";
  let borderColor = "border-gray-300";

  if (isSubmitted) {
    if (option.isCorrect) {
      backgroundColor = "bg-green-50";
      borderColor = "border-green-500";
    } else if (isSelected) {
      backgroundColor = "bg-red-50";
      borderColor = "border-red-500";
    }
  } else if (isSelected) {
    backgroundColor = "bg-blue-50";
    borderColor = "border-blue-500";
  }

  return (
    <div 
      className={`p-4 border rounded-md mb-2 cursor-pointer ${backgroundColor} ${borderColor} hover:border-blue-300`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="mr-3">
          <div className={`w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-blue-500 border-blue-500' : ''
          }`}>
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: option.text }}></div>
      </div>
    </div>
  );
};

export default AnswerOption;
