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
  // Determine styling based on state
  const getClasses = () => {
    let classes = "p-4 border rounded-lg cursor-pointer transition-colors ";
    
    if (isSubmitted) {
      if (option.isCorrect) {
        classes += "border-success-500 bg-success-50";
      } else if (isSelected && !option.isCorrect) {
        classes += "border-error-500 bg-error-50";
      } else {
        classes += "border-neutral-200";
      }
    } else {
      if (isSelected) {
        classes += "border-primary-500 bg-primary-50";
      } else {
        classes += "border-neutral-200 hover:border-primary-200";
      }
    }
    
    return classes;
  };

  // Handle the click event
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSubmitted) {
      console.log("Option selected:", option.text);
      onSelect();
    }
  };

  return (
    <button 
      type="button"
      className={getClasses() + " w-full text-left"}
      onClick={handleClick}
      disabled={isSubmitted}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <div 
            className={`w-5 h-5 border rounded-full flex items-center justify-center ${
              isSelected && !isSubmitted ? 'border-primary-600 bg-primary-600' :
              option.isCorrect && isSubmitted ? 'border-success-500 bg-success-500' :
              isSelected && isSubmitted && !option.isCorrect ? 'border-error-500 bg-error-500' :
              'border-neutral-300'
            }`}
          >
            {isSelected && !isSubmitted && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="4" />
              </svg>
            )}
            {isSubmitted && option.isCorrect && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isSubmitted && isSelected && !option.isCorrect && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        {/* Use dangerouslySetInnerHTML to display HTML content */}
        <span className="ml-3" dangerouslySetInnerHTML={{ __html: option.text }}></span>
      </div>
    </button>
  );
};

export default AnswerOption;
