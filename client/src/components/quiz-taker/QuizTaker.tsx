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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

  const totalQuestions = quizData.questions.length;
  const currentQuestionData = quizData.questions[currentQuestion];

  const handleOptionSelect = (optionId: string) => {
    if (!answerSubmitted) {
      setSelectedOptionId(optionId);

      // Immediately submit the answer when an option is selected
      const newAnswers = {
        ...userAnswers,
        [currentQuestionData.id]: optionId,
      };
      setUserAnswers(newAnswers);
      setAnswerSubmitted(true);

      // If this is the last question, complete the quiz
      if (currentQuestion === totalQuestions - 1) {
        const results = calculateQuizResult(quizData, newAnswers);
        setQuizResults(results);
        setQuizCompleted(true);
      }
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
      setQuizResults(results);
      setQuizCompleted(true);
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
      setQuizResults(results);
      setQuizCompleted(true);
      // Don't call onComplete yet, let the user see the summary first
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOptionId(userAnswers[quizData.questions[currentQuestion - 1].id] || '');
      setAnswerSubmitted(true);
    }
  };

  // If quiz is completed, show results
  if (quizCompleted && quizResults) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Quiz Results</h2>
          <p className="text-center text-neutral-500 mb-6">You have completed the quiz!</p>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${Math.round(quizResults.score)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 mb-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">{quizData.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                <p className="text-sm text-neutral-500 mb-1">Score</p>
                <p className="text-4xl font-bold text-primary-600">
                  {Math.round(quizResults.score)}%
                </p>
              </div>
              <div className="text-center p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                <p className="text-sm text-neutral-500 mb-1">Correct Answers</p>
                <p className="text-4xl font-bold text-green-500">
                  {quizResults.correctAnswers}
                </p>
              </div>
              <div className="text-center p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                <p className="text-sm text-neutral-500 mb-1">Total Questions</p>
                <p className="text-4xl font-bold text-neutral-700">
                  {quizResults.totalQuestions}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-3 pb-2 border-b border-neutral-200">Question Breakdown</h4>
              {quizResults.questionResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-lg border ${result.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5 mr-3">
                      {result.correct ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-sm mt-1">{quizData.questions[index].text}</p>
                      <div className="mt-2 text-sm">
                        <p className="text-neutral-600">
                          Your answer: <span className="font-medium">{result.userAnswer}</span>
                        </p>
                        {!result.correct && (
                          <p className="text-neutral-600 mt-1">
                            Correct answer: <span className="font-medium text-green-600">{result.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setQuizCompleted(false);
                setCurrentQuestion(0);
                setSelectedOptionId('');
                setAnswerSubmitted(false);
                setUserAnswers({});
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Quiz
            </Button>
            <Button onClick={() => onComplete(quizResults)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the quiz questions
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
            {currentQuestionData.options.map((option) => {
              // Determine the style for each option
              let optionStyle = "border-neutral-200 hover:border-neutral-300";

              if (answerSubmitted) {
                if (option.isCorrect) {
                  // Enhanced green highlight for correct answers - ALWAYS highlight correct answer in green
                  optionStyle = "border-green-500 bg-green-100 shadow-md shadow-green-100 ring-2 ring-green-500 text-green-700 font-medium";
                } else if (selectedOptionId === option.id) {
                  // Enhanced red highlight for incorrect answers - only if user selected this wrong answer
                  optionStyle = "border-red-500 bg-red-100 shadow-md shadow-red-100 ring-2 ring-red-500 text-red-700 font-medium";
                } else {
                  // Slightly dimmed style for other options
                  optionStyle = "border-neutral-200 bg-neutral-50 opacity-60";
                }
              } else if (selectedOptionId === option.id) {
                // Style for selected but not yet submitted
                optionStyle = "border-primary-500 bg-primary-50";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={answerSubmitted}
                  className={`w-full text-left p-5 rounded-lg border transition-all duration-300 ${optionStyle} ${answerSubmitted ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {answerSubmitted ? (
                        option.isCorrect ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        ) : selectedOptionId === option.id ? (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-neutral-300"></div>
                        )
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 ${selectedOptionId === option.id ? 'border-primary-500 bg-primary-100' : 'border-neutral-300'}`}></div>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {answerSubmitted && (
            <div className={`mt-6 p-4 rounded-lg border ${selectedOptionId && currentQuestionData.options.find(opt => opt.id === selectedOptionId)?.isCorrect
              ? 'bg-green-100 border-green-300 shadow-sm'
              : 'bg-red-100 border-red-300 shadow-sm'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  {selectedOptionId && currentQuestionData.options.find(opt => opt.id === selectedOptionId)?.isCorrect ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedOptionId && currentQuestionData.options.find(opt => opt.id === selectedOptionId)?.isCorrect
                      ? "Correct!"
                      : "Incorrect!"}
                  </p>
                  {!currentQuestionData.options.find(opt => opt.id === selectedOptionId)?.isCorrect && (
                    <p className="text-sm mt-1">
                      The correct answer is: <span className="font-medium text-green-600">{currentQuestionData.options.find(opt => opt.isCorrect)?.text}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
