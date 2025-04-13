import React, { useState } from 'react';
import { QuizData } from '@shared/schema';
import { QuizResult } from '@/types/quiz';
import { calculateQuizResult } from '@/lib/formatQuiz';
import { Button } from '@/components/ui/button';

interface QuizTakerProps {
  quizData: QuizData;
  onComplete: (results: QuizResult) => void;
  onExit: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quizData, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const totalQuestions = quizData.questions.length;
  const currentQuestionData = quizData.questions[currentQuestion];

  const handleOptionSelect = (optionId: string) => {
    if (!answerSubmitted) {
      setSelectedOptionId(optionId);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId) return;

    const newAnswers = {
      ...userAnswers,
      [currentQuestionData.id]: selectedOptionId,
    };
    setUserAnswers(newAnswers);
    setAnswerSubmitted(true);

    if (currentQuestion === totalQuestions - 1) {
      const results = calculateQuizResult(quizData, newAnswers);
      onComplete(results);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptionId('');
      setAnswerSubmitted(false);
    } else {
      const results = calculateQuizResult(quizData, userAnswers);
      onComplete(results);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOptionId(userAnswers[quizData.questions[currentQuestion - 1].id] || '');
      setAnswerSubmitted(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">{quizData.title}</h2>
          <p className="text-sm text-neutral-500">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-lg mb-4">{currentQuestionData.text}</p>
          <div className="space-y-3">
            {currentQuestionData.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={answerSubmitted}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedOptionId === option.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                } ${answerSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-neutral-200 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <div>
          {!answerSubmitted ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
            >
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
            >
              {currentQuestion < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
