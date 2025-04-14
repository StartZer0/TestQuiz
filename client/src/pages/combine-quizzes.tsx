import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { downloadQuizJson } from '@/lib/formatQuiz';
import { QuizData } from '@shared/schema';
import { generateId } from '@/lib/extractQuestions';

const CombineQuizzes: React.FC = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [combinedTitle, setCombinedTitle] = useState('Combined Quiz');
  const [isProcessing, setIsProcessing] = useState(false);
  const [combinedQuiz, setCombinedQuiz] = useState<QuizData | null>(null);
  const [stats, setStats] = useState<{ fileName: string; questionCount: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files);
      setFiles(fileArray);
    }
  };

  const handleCombineQuizzes = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one quiz JSON file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setStats([]);

    try {
      // Initialize the combined quiz
      const combined: QuizData = {
        title: combinedTitle,
        questions: []
      };

      const newStats: { fileName: string; questionCount: number }[] = [];

      // Process each file
      for (const file of files) {
        const fileContent = await file.text();
        const quizData = JSON.parse(fileContent) as QuizData;
        
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
          toast({
            title: `Invalid file: ${file.name}`,
            description: "File does not have a valid 'questions' array",
            variant: "destructive"
          });
          continue;
        }

        // Ensure all questions have unique IDs
        const questionsWithUniqueIds = quizData.questions.map(q => ({
          ...q,
          id: generateId() // Generate a new ID to avoid conflicts
        }));
        
        // Add questions to the combined quiz
        combined.questions = [...combined.questions, ...questionsWithUniqueIds];
        
        // Add stats
        newStats.push({
          fileName: file.name,
          questionCount: quizData.questions.length
        });
      }

      setCombinedQuiz(combined);
      setStats(newStats);

      toast({
        title: "Quizzes combined successfully",
        description: `Combined ${combined.questions.length} questions from ${files.length} files`,
      });
    } catch (error) {
      toast({
        title: "Error combining quizzes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (combinedQuiz) {
      downloadQuizJson(combinedQuiz);
    }
  };

  const handleClearFiles = () => {
    setFiles([]);
    setCombinedQuiz(null);
    setStats([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Combine Quiz Files</h1>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Combined Quiz Title
                  </label>
                  <Input
                    type="text"
                    value={combinedTitle}
                    onChange={(e) => setCombinedTitle(e.target.value)}
                    placeholder="Enter a title for the combined quiz"
                    className="mb-4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Quiz JSON Files
                  </label>
                  <div className="flex items-center space-x-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      multiple
                      className="flex-1"
                    />
                    {files.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handleClearFiles}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-neutral-500">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleCombineQuizzes}
                    disabled={isProcessing || files.length === 0}
                    className="px-6 py-3"
                  >
                    {isProcessing ? "Processing..." : "Combine Quizzes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {combinedQuiz && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Combination Results</h2>
                
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Combined Quiz: {combinedQuiz.title}</h3>
                    <span className="text-sm bg-primary-100 text-primary-800 py-1 px-2 rounded-full">
                      {combinedQuiz.questions.length} Questions
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium">Files Combined:</h4>
                    <ul className="text-sm space-y-1">
                      {stats.map((stat, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="truncate max-w-[70%]">{stat.fileName}</span>
                          <span>{stat.questionCount} questions</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownload}
                    className="px-6 py-3"
                  >
                    Download Combined Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CombineQuizzes;
