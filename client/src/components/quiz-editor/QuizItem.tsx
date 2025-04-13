import React, { useState } from 'react';
import { QuizQuestion, QuizOption } from '@shared/schema';
import QuestionOption from './QuestionOption';
import { createEmptyOption } from '@/lib/extractQuestions';

interface QuizItemProps {
  question: QuizQuestion;
  index: number;
  onChange: (updatedQuestion: QuizQuestion) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const QuizItem: React.FC<QuizItemProps> = ({
  question,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...question,
      text: e.target.value
    });
  };

  const handleOptionChange = (updatedOption: QuizOption) => {
    const updatedOptions = question.options.map(opt => 
      opt.id === updatedOption.id ? updatedOption : opt
    );
    
    onChange({
      ...question,
      options: updatedOptions
    });
  };

  const handleCorrectOptionChange = (optionId: string) => {
    const updatedOptions = question.options.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId
    }));
    
    onChange({
      ...question,
      options: updatedOptions
    });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, createEmptyOption()]
    });
  };

  const removeImage = () => {
    onChange({
      ...question,
      imageUrl: undefined
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="border border-neutral-200 rounded-lg shadow-sm">
      <div className="p-4 flex items-start justify-between border-b border-neutral-100">
        <div className="flex items-center">
          <span className="bg-neutral-100 text-neutral-800 rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm mr-3">
            {index + 1}
          </span>
          <h3 className="font-medium">Multiple Choice Question</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleCollapse}
            className="text-neutral-500 hover:text-neutral-700"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M19 9l-7 7-7-7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
          <button 
            onClick={onDelete}
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Delete question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          <textarea 
            value={question.text}
            onChange={handleTextChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            rows={2}
            placeholder="Enter question text"
          />
          
          {question.imageUrl && (
            <div className="mt-3 p-4 border border-dashed border-neutral-300 rounded-md bg-neutral-50 text-center">
              <img 
                src={question.imageUrl} 
                alt="Question image" 
                className="max-h-60 mx-auto rounded"
              />
              <div className="mt-2 flex justify-center">
                <button 
                  className="text-sm text-primary-600 font-medium hover:text-primary-500"
                  onClick={() => {/* Open file picker */}}
                >
                  Change Image
                </button>
                <span className="mx-2 text-neutral-300">|</span>
                <button 
                  className="text-sm text-neutral-600 font-medium hover:text-neutral-700"
                  onClick={removeImage}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 space-y-3">
            {question.options.map((option, idx) => (
              <QuestionOption 
                key={option.id}
                option={option}
                index={idx}
                isSelected={option.isCorrect}
                onChange={handleOptionChange}
                onSelectCorrect={handleCorrectOptionChange}
              />
            ))}
            
            <button 
              className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center mt-2"
              onClick={addOption}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Option
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizItem;
