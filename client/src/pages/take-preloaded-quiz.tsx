import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import QuizTaker from '@/components/quiz-taker/QuizTaker';
import { QuizData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { shuffleArray } from '@/lib/utils';

const TakePreloadedQuiz: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResults, setQuizResults] = useState<any | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [questionLimit, setQuestionLimit] = useState<number>(60);

  useEffect(() => {
    const loadQuizData = () => {
      try {
        // Get quiz data from localStorage
        const quizDataStr = localStorage.getItem('selectedQuizData');
        const questionLimitStr = localStorage.getItem('questionLimit');
        const shuffleQuestionsStr = localStorage.getItem('shuffleQuestions');
        
        if (!quizDataStr) {
          toast({
            title: 'No quiz selected',
            description: 'Please select a quiz from the library first.',
            variant: 'destructive',
          });
          navigate('/quiz-library');
          return;
        }
        
        // Parse the quiz data
        const fullQuizData = JSON.parse(quizDataStr) as QuizData;
        const limit = questionLimitStr ? parseInt(questionLimitStr, 10) : 60;
        const shuffle = shuffleQuestionsStr === 'true';
        
        setQuestionLimit(limit);
        setShuffleQuestions(shuffle);
        
        // Apply question limit and shuffle if needed
        let processedQuizData = { ...fullQuizData };
        
        // Apply question limit if needed
        if (limit < fullQuizData.questions.length) {
          let selectedQuestions = [...fullQuizData.questions];
          
          // Shuffle the questions if needed
          if (shuffle) {
            selectedQuestions = shuffleArray(selectedQuestions);
          }
          
          // Take only the first 'limit' questions
          selectedQuestions = selectedQuestions.slice(0, limit);
          
          processedQuizData = {
            ...fullQuizData,
            questions: selectedQuestions
          };
        } else if (shuffle) {
          // Just shuffle without limiting
          processedQuizData = {
            ...fullQuizData,
            questions: shuffleArray(fullQuizData.questions)
          };
        }
        
        setQuizData(processedQuizData);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        toast({
          title: 'Error loading quiz',
          description: 'Failed to load the selected quiz. Please try again.',
          variant: 'destructive',
        });
        navigate('/quiz-library');
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [navigate, toast]);

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
  };

  const handleGenerateNewQuiz = () => {
    try {
      // Get the original quiz data
      const quizDataStr = localStorage.getItem('selectedQuizData');
      if (!quizDataStr) return;
      
      const fullQuizData = JSON.parse(quizDataStr) as QuizData;
      
      // Always shuffle for a new quiz
      let selectedQuestions = shuffleArray([...fullQuizData.questions]);
      
      // Apply question limit
      if (questionLimit < fullQuizData.questions.length) {
        selectedQuestions = selectedQuestions.slice(0, questionLimit);
      }
      
      // Set the new quiz data
      const newQuizData = {
        ...fullQuizData,
        questions: selectedQuestions
      };
      
      setQuizData(newQuizData);
      setQuizResults(null);
      
      toast({
        title: 'New Quiz Generated',
        description: `Generated a new quiz with ${questionLimit} random questions.`
      });
    } catch (error) {
      console.error('Error generating new quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a new quiz. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleBackToLibrary = () => {
    navigate('/quiz-library');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
          <p className="text-neutral-600 mb-6">The selected quiz could not be loaded.</p>
          <Button onClick={handleBackToLibrary}>Back to Quiz Library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleBackToLibrary}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Library
        </Button>
        
        {quizData.questions.length < JSON.parse(localStorage.getItem('selectedQuizData') || '{}').questions.length && (
          <Button 
            variant="outline"
            onClick={handleGenerateNewQuiz}
            className="flex items-center text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate New Questions
          </Button>
        )}
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold">{quizData.title}</h1>
              <p className="text-neutral-600">
                {quizData.questions.length} questions {shuffleQuestions ? '(shuffled)' : ''}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm ${
                shuffleQuestions 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                {shuffleQuestions ? 'Shuffled' : 'Original Order'}
              </div>
              <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {questionLimit} of {JSON.parse(localStorage.getItem('selectedQuizData') || '{}').questions.length} questions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="max-w-3xl mx-auto">
        <QuizTaker
          quizData={quizData}
          onComplete={handleQuizComplete}
          onExit={handleGenerateNewQuiz}
        />
      </div>
    </div>
  );
};

export default TakePreloadedQuiz;
