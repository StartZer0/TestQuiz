import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Quiz } from '@shared/schema';

const MyQuizzes: React.FC = () => {
  const [, navigate] = useLocation();
  
  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['/api/quizzes'],
    refetchOnWindowFocus: true,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Quizzes</h1>
          <Button onClick={() => navigate('/')}>Create New Quiz</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading your quizzes...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-6">
              <div className="text-center py-4">
                <p className="text-error-500">Error loading quizzes</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="mt-4"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz: Quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{quiz.data.title}</h2>
                  <p className="text-sm text-neutral-500 mb-4">{quiz.data.questions.length} questions</p>
                  <p className="text-sm text-neutral-600 mb-6">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/quiz/${quiz.shareId}`)}
                    >
                      Take Quiz
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/quiz/${quiz.shareId}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">No Quizzes Found</h3>
                <p className="text-neutral-500 mb-6">You haven't created any quizzes yet.</p>
                <Button onClick={() => navigate('/')}>Create Your First Quiz</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyQuizzes;
