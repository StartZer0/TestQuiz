import React, { useState } from 'react';
import { QuizData } from '@shared/schema';
import Question from './Question';
import { calculateQuizResult } from '@/lib/formatQuiz';

interface QuizTakerProps {
  quizData: QuizData;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quizData, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const totalQuestions = quizData.questions.length;
  const currentQuestionData = quizData.questions[currentQuestion];
  const selectedOptionId = userAnswers[currentQuestionData.id] || null;
  
  const handleSelectOption = (optionId: string) => {
    if (!answerSubmitted) {
      setUserAnswers({
        ...userAnswers,
        [currentQuestionData.id]: optionId
      });
    }
  };
  
  const handleCheckAnswer = () => {
    if (selectedOptionId) {
      setAnswerSubmitted(true);
    }
  };
  
  const handleNextQuestion = () => {
    setAnswerSubmitted(false);
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
      const results = calculateQuizResult(quizData, userAnswers);
      onComplete(results);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswerSubmitted(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-primary-600 text-white px-6 py-5">
        <h2 className="text-xl font-semibold">{quizData.title}</h2>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-white/80">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-sm">Progress:</span>
            <div className="w-32 h-2 bg-white/30 rounded-full">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${((currentQuestion + (answerSubmitted ? 1 : 0)) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Content */}
      <Question
        question={currentQuestionData}
        selectedOptionId={selectedOptionId}
        answerSubmitted={answerSubmitted}
        onSelectOption={handleSelectOption}
      />
      
      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-neutral-200 flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Previous
        </button>
        
        <div>
          {!answerSubmitted && !completed && (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:hover:bg-primary-600"
            >
              Check Answer
            </button>
          )}
          
          {answerSubmitted && !completed && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {currentQuestion < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          )}
          
          {completed && (
            <button
              onClick={onExit}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
