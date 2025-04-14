import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fetchQuizCatalog, fetchQuizById, QuizCatalogItem } from '@/lib/quizService';
import { QuizData } from '@shared/schema';
import { selectRandomQuestions } from '@/lib/utils';

const QuizLibrary: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizCatalog, setQuizCatalog] = useState<QuizCatalogItem[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizCatalogItem | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number>(60);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);

  useEffect(() => {
    const loadQuizCatalog = async () => {
      try {
        setLoading(true);
        const catalog = await fetchQuizCatalog();
        setQuizCatalog(catalog.quizzes);
      } catch (error) {
        toast({
          title: 'Error loading quiz catalog',
          description: 'Failed to load the available quizzes. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuizCatalog();
  }, [toast]);

  const handleQuizSelect = (quiz: QuizCatalogItem) => {
    setSelectedQuiz(quiz);
    // Set a reasonable default for the question limit based on the quiz size
    setQuestionLimit(Math.min(60, quiz.questionCount));
  };

  const handleStartQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setLoading(true);
      
      // Fetch the selected quiz
      const quizData = await fetchQuizById(selectedQuiz.id);
      
      // Store the quiz data in localStorage
      localStorage.setItem('selectedQuizData', JSON.stringify(quizData));
      localStorage.setItem('questionLimit', questionLimit.toString());
      localStorage.setItem('shuffleQuestions', shuffleQuestions.toString());
      
      // Navigate to the quiz page
      navigate('/take-preloaded-quiz');
    } catch (error) {
      toast({
        title: 'Error loading quiz',
        description: 'Failed to load the selected quiz. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Group quizzes by category
  const sectionQuizzes = quizCatalog.filter(quiz => quiz.category === 'section');
  const fullQuizzes = quizCatalog.filter(quiz => quiz.category === 'full');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Library</h1>
      <p className="text-center text-neutral-600 mb-8">
        Select a quiz from our pre-loaded collection to start practicing
      </p>

      {loading && !selectedQuiz ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Featured Quizzes */}
          {fullQuizzes.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Complete Quiz Set</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fullQuizzes.map((quiz) => (
                  <Card 
                    key={quiz.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedQuiz?.id === quiz.id 
                        ? `border-2 border-${quiz.color}-500 shadow-md` 
                        : 'border border-neutral-200'
                    }`}
                    onClick={() => handleQuizSelect(quiz)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-12 h-12 bg-${quiz.color}-100 text-${quiz.color}-600 rounded-full flex items-center justify-center text-2xl mr-4`}>
                          {quiz.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{quiz.title}</h3>
                          <p className="text-neutral-600 mb-2">{quiz.description}</p>
                          <div className="flex items-center text-sm text-neutral-500">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {quiz.questionCount} Questions
                            </span>
                            {quiz.featured && (
                              <span className="ml-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Section Quizzes */}
          {sectionQuizzes.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Quiz Sections</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sectionQuizzes.map((quiz) => (
                  <Card 
                    key={quiz.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedQuiz?.id === quiz.id 
                        ? `border-2 border-${quiz.color}-500 shadow-md` 
                        : 'border border-neutral-200'
                    }`}
                    onClick={() => handleQuizSelect(quiz)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-10 h-10 bg-${quiz.color}-100 text-${quiz.color}-600 rounded-full flex items-center justify-center text-xl mr-3`}>
                          {quiz.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-neutral-500">{quiz.questionCount} Questions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Configuration */}
          {selectedQuiz && (
            <Card className="mt-8 border-t-4 border-primary-500">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Configure Your Quiz</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Selected Quiz:</h3>
                  <div className={`p-3 bg-${selectedQuiz.color}-50 border border-${selectedQuiz.color}-200 rounded-lg`}>
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-10 h-10 bg-${selectedQuiz.color}-100 text-${selectedQuiz.color}-600 rounded-full flex items-center justify-center text-xl mr-3`}>
                        {selectedQuiz.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{selectedQuiz.title}</h4>
                        <p className="text-sm text-neutral-600">{selectedQuiz.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Question Limit Slider */}
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <div>
                          <Label htmlFor="question-limit" className="text-base font-medium text-blue-700">
                            Number of Questions
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Customize
                            </span>
                          </Label>
                          <p className="text-sm text-blue-600 mt-1">
                            Select <span className="font-bold">{questionLimit}</span> out of {selectedQuiz.questionCount} available questions
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center shadow-sm">
                        {questionLimit}
                      </div>
                    </div>
                    
                    <div className="px-2 mt-4">
                      <Slider
                        id="question-limit"
                        min={10}
                        max={Math.min(selectedQuiz.questionCount, 100)}
                        step={5}
                        value={[questionLimit]}
                        onValueChange={(value) => setQuestionLimit(value[0])}
                        className="my-4"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700 font-medium">10</span>
                        <span className="text-blue-700 font-medium">{Math.min(selectedQuiz.questionCount, 100)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shuffle Toggle */}
                <div className="mb-6">
                  <div className={`p-4 rounded-lg transition-colors duration-300 ${shuffleQuestions
                    ? 'bg-green-50 border border-green-300 shadow-sm'
                    : 'bg-neutral-50 border border-neutral-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full transition-colors duration-300 ${shuffleQuestions
                          ? 'bg-green-100 shadow-sm'
                          : 'bg-neutral-100'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${shuffleQuestions
                            ? 'text-green-600'
                            : 'text-neutral-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <Label htmlFor="shuffle-mode" className={`text-base font-medium cursor-pointer transition-colors duration-300 ${shuffleQuestions
                            ? 'text-green-700'
                            : ''}`}>
                            Shuffle Questions
                            {shuffleQuestions && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </Label>
                          <p className={`text-sm mt-1 transition-colors duration-300 ${shuffleQuestions
                            ? 'text-green-600'
                            : 'text-neutral-600'}`}>
                            {shuffleQuestions ? 'Questions will be presented in random order' : 'Questions will be presented in original order'}
                          </p>
                        </div>
                      </div>
                      <div 
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                          shuffleQuestions ? 'bg-green-500 justify-end' : 'bg-neutral-300 justify-start'
                        }`}
                        onClick={() => setShuffleQuestions(!shuffleQuestions)}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleStartQuiz}
                    disabled={loading}
                    className="px-8 py-6 text-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Quiz
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizLibrary;
