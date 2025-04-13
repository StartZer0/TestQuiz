import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import QuizTaker from '@/components/quiz-taker/QuizTaker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TakeQuizProps {
  params: {
    shareId: string;
  };
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ params }) => {
  const { shareId } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [quizResults, setQuizResults] = useState<any | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: [`/api/quizzes/${shareId}`],
  });

  // Handle quiz completion
  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setShowResults(true);
  };

  // Start quiz over
  const handleRestartQuiz = () => {
    setQuizResults(null);
    setShowResults(false);
  };

  // Share quiz
  const handleShareQuiz = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Quiz link copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center py-10">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="py-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">Quiz Not Found</h2>
            <p className="text-neutral-500 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!showResults ? (
        <div className="max-w-3xl mx-auto">
          <QuizTaker
            quizData={quiz.data}
            onComplete={handleQuizComplete}
            onExit={() => setShowResults(true)}
          />
        </div>
      ) : (
        <Card className="max-w-3xl mx-auto">
          <CardContent className="py-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Quiz Results</h2>
            
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 mb-8">
              <h3 className="text-xl font-medium mb-4">{quiz.data.title}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-500">Score</p>
                  <p className="text-3xl font-bold text-primary-600">{Math.round(quizResults.score)}%</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-500">Correct Answers</p>
                  <p className="text-3xl font-bold text-success-500">{quizResults.correctAnswers}/{quizResults.totalQuestions}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Question Breakdown</h4>
                {quizResults.questionResults.map((result: any, index: number) => (
                  <div 
                    key={result.questionId} 
                    className={`p-3 rounded-lg border ${
                      result.correct ? 'bg-success-50 border-success-200' : 'bg-error-50 border-error-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {result.correct ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Question {index + 1}</p>
                        {!result.correct && (
                          <p className="text-sm mt-1">
                            <span className="text-neutral-600">Correct answer: </span>
                            <span className="font-medium">{result.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="outline"
                onClick={handleRestartQuiz}
              >
                Take Quiz Again
              </Button>
              <Button 
                onClick={handleShareQuiz}
              >
                Share Quiz
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Create New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TakeQuiz;
