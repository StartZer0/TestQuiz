import React from 'react';
import { QuizQuestion, QuizOption } from '@shared/schema';
import AnswerOption from './AnswerOption';
import FeedbackMessage from './FeedbackMessage';

interface QuestionProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  answerSubmitted: boolean;
  onSelectOption: (optionId: string) => void;
}

const Question: React.FC<QuestionProps> = ({
  question,
  selectedOptionId,
  answerSubmitted,
  onSelectOption
}) => {
  const correctOption = question.options.find(opt => opt.isCorrect);
  const isCorrect = selectedOptionId ? 
    question.options.find(opt => opt.id === selectedOptionId)?.isCorrect || false : 
    false;

  // Function to render question text with line breaks
  const renderQuestionText = () => {
    if (!question.text) return null;
    
    // Split by line breaks and create paragraph elements
    return question.text.split('\n\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      // For paragraphs that contain numbered items (like "1. Item"), apply special styling
      if (/^\d+\./.test(paragraph.trim())) {
        return <p key={index} className="mb-2 pl-2 border-l-2 border-primary-200">{paragraph}</p>;
      }
      
      return <p key={index} className="mb-2">{paragraph}</p>;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="text-lg font-medium mb-3 whitespace-pre-line">
          {renderQuestionText()}
        </div>
        
        {question.imageUrl && (
          <div className="mb-4">
            <img
              src={question.imageUrl}
              alt="Question visual"
              className="max-w-full max-h-60 rounded-md mx-auto"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-3 mb-6">
        {question.options.map(option => (
          <AnswerOption
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            isSubmitted={answerSubmitted}
            onSelect={() => onSelectOption(option.id)}
          />
        ))}
      </div>
      
      {answerSubmitted && (
        <FeedbackMessage
          isCorrect={isCorrect}
          correctAnswerText={correctOption?.text}
        />
      )}
    </div>
  );
};

export default Question;
