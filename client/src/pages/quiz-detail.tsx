import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { downloadQuizJson } from '@/lib/formatQuiz';

interface QuizDetailProps {
  params: {
    shareId: string;
  };
}

const QuizDetail: React.FC<QuizDetailProps> = ({ params }) => {
  const { shareId } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: [`/api/quizzes/${shareId}`],
  });

  const handleTakeQuiz = () => {
    navigate(`/quiz/${shareId}`);
  };

  const handleShareQuiz = () => {
    const shareUrl = window.location.origin + '/quiz/' + shareId;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Quiz link copied to clipboard"
    });
  };

  const handleEditQuiz = () => {
    navigate(`/quiz/${shareId}/edit`);
  };

  const handleDownloadJson = () => {
    if (quiz) {
      downloadQuizJson(quiz.data);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-10">
          <p>Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-2xl font-bold mb-2 sm:mb-0">{quiz.data.title}</h1>
              <div className="flex space-x-3">
                <Button size="sm" onClick={handleTakeQuiz}>Take Quiz</Button>
                <Button size="sm" variant="outline" onClick={handleEditQuiz}>Edit</Button>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Quiz Details</span>
                <span className="text-sm text-neutral-500">{quiz.data.questions.length} questions</span>
              </div>
              <div className="text-sm text-neutral-600">
                <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                {quiz.updatedAt && (
                  <p>Last Modified: {new Date(quiz.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Question Preview</h3>
              <div className="space-y-3">
                {quiz.data.questions.slice(0, 3).map((question: any, index: number) => (
                  <div key={question.id} className="p-4 border border-neutral-200 rounded-lg">
                    <p className="font-medium mb-2">Question {index + 1}:</p>
                    <p className="text-neutral-800">{question.text}</p>
                  </div>
                ))}
                {quiz.data.questions.length > 3 && (
                  <p className="text-center text-sm text-neutral-500 mt-2">
                    ...and {quiz.data.questions.length - 3} more questions
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Share</h3>
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <p className="text-sm text-neutral-600 mb-3">
                    Share this quiz with others:
                  </p>
                  <Button 
                    onClick={handleShareQuiz}
                    className="w-full"
                  >
                    Copy Share Link
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Export</h3>
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <p className="text-sm text-neutral-600 mb-3">
                    Download this quiz as JSON:
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadJson}
                    className="w-full"
                  >
                    Download JSON
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizDetail;
