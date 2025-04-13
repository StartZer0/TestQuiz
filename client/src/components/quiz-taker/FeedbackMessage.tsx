import React from 'react';

interface FeedbackMessageProps {
  isCorrect: boolean;
  correctAnswerText?: string;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ isCorrect, correctAnswerText }) => {
  return (
    <div
      className={`p-4 mb-6 rounded-lg border ${
        isCorrect 
          ? 'bg-success-50 border-success-200' 
          : 'bg-error-50 border-error-200'
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {isCorrect ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-success-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-error-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h4>
          <div className="mt-1 text-sm">
            {isCorrect ? (
              'Great job!'
            ) : (
              <>
                The correct answer is:{' '}
                <strong>{correctAnswerText}</strong>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackMessage;
