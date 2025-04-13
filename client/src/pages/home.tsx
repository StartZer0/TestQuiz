import React, { useState } from 'react';
import { useLocation } from 'wouter';
import StepIndicator from '@/components/StepIndicator';
import FileUpload from '@/components/ui/file-upload';
import QuizItem from '@/components/quiz-editor/QuizItem';
import QuizTaker from '@/components/quiz-taker/QuizTaker';
import { QuizStep, QuizState } from '@/types/quiz';
import { extractQuestionsFromDocument, createEmptyQuestion } from '@/lib/extractQuestions';
import { downloadQuizJson, parseQuizJsonFile, previewJsonFile } from '@/lib/formatQuiz';
import { QuizData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<QuizStep>('upload');
  const [currentTab, setCurrentTab] = useState<'upload' | 'json'>('upload');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonPreview, setJsonPreview] = useState<string>('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResults, setQuizResults] = useState<any | null>(null);
  const [quizShareId, setQuizShareId] = useState<string | null>(null);
  const [quizLink, setQuizLink] = useState<string>('');

  // Handle document file upload and processing
  const handleDocumentFileChange = (file: File) => {
    setDocumentFile(file);
  };

  // Handle JSON file upload
  const handleJsonFileChange = async (file: File) => {
    setJsonFile(file);

    // Generate a preview of the JSON file
    try {
      const previewText = await previewJsonFile(file, true);
      setJsonPreview(previewText);
    } catch (error) {
      console.error('Error generating JSON preview:', error);
      setJsonPreview('');
    }
  };

  // Process document to extract questions
  const processDocument = async () => {
    if (!documentFile) {
      toast({
        title: "No document selected",
        description: "Please select a document to upload",
        variant: "destructive"
      });
      return;
    }

    console.log('Processing document:', documentFile.name);
    setLoading(true);
    try {
      console.log('Calling extractQuestionsFromDocument...');
      const extractedData = await extractQuestionsFromDocument(documentFile);
      console.log('Document processed successfully, setting quiz data...');
      setQuizData(extractedData);
      setCurrentStep('edit');
    } catch (error) {
      console.error('Error in processDocument:', error);
      toast({
        title: "Error processing document",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Process JSON file
  const processJsonFile = async () => {
    if (!jsonFile) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to upload",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const parsedData = await parseQuizJsonFile(jsonFile);
      setQuizData(parsedData);
      setCurrentStep('quiz');
    } catch (error) {
      toast({
        title: "Error parsing JSON",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Process JSON input
  const processJsonInput = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No JSON provided",
        description: "Please paste a valid JSON quiz format",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput) as QuizData;
      setQuizData(parsedData);
      setCurrentStep('quiz');
    } catch (error) {
      toast({
        title: "Invalid JSON format",
        description: "Please provide a valid JSON in the correct format",
        variant: "destructive"
      });
    }
  };

  // Update quiz title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (quizData) {
      setQuizData({
        ...quizData,
        title: e.target.value
      });
    }
  };

  // Update a question
  const handleQuestionChange = (updatedQuestion: any, index: number) => {
    if (quizData) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions[index] = updatedQuestion;
      setQuizData({
        ...quizData,
        questions: updatedQuestions
      });
    }
  };

  // Add a new question
  const addNewQuestion = () => {
    if (quizData) {
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, createEmptyQuestion()]
      });
    }
  };

  // Delete a question
  const deleteQuestion = (index: number) => {
    if (quizData) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions.splice(index, 1);
      setQuizData({
        ...quizData,
        questions: updatedQuestions
      });
    }
  };

  // Handle Quiz sharing
  const shareQuiz = async () => {
    if (!quizData) return;

    try {
      const response = await apiRequest('POST', '/api/quizzes/share', {
        quiz: quizData
      });

      const data = await response.json();
      setQuizShareId(data.shareId);
      const shareUrl = window.location.origin + '/quiz/' + data.shareId;
      setQuizLink(shareUrl);

      toast({
        title: "Quiz shared successfully",
        description: "Your quiz link is ready to share!",
      });
    } catch (error) {
      toast({
        title: "Error sharing quiz",
        description: "Could not generate a share link for this quiz",
        variant: "destructive"
      });
    }
  };

  // Download quiz as JSON
  const handleDownloadJson = () => {
    if (quizData) {
      downloadQuizJson(quizData);
    }
  };

  // Copy quiz link to clipboard
  const copyLinkToClipboard = () => {
    if (quizLink) {
      navigator.clipboard.writeText(quizLink);
      toast({
        title: "Link copied",
        description: "Quiz link copied to clipboard"
      });
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setCurrentStep('export');
  };

  // Open quiz from link input
  const handleOpenQuizLink = () => {
    if (quizLink.trim()) {
      const parts = quizLink.split('/');
      const shareId = parts[parts.length - 1];
      if (shareId) {
        navigate(`/quiz/${shareId}`);
      } else {
        toast({
          title: "Invalid quiz link",
          description: "Please provide a valid quiz link",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Workflow Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* Upload Document View */}
        {currentStep === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6 text-center">Create a New Quiz</h2>

                {/* Upload Tabs */}
                <div className="mb-8">
                  <div className="border-b border-neutral-200">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setCurrentTab('upload')}
                        className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none transition-colors ${
                          currentTab === 'upload'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        Upload Document
                      </button>
                      <button
                        onClick={() => setCurrentTab('json')}
                        className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none transition-colors ${
                          currentTab === 'json'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        Import JSON
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Document Upload Form */}
                {currentTab === 'upload' && (
                  <>
                    <FileUpload
                      accept=".docx,.doc"
                      onFileChange={handleDocumentFileChange}
                      label="Document Upload"
                      supportText="Supported formats: .docx, .doc"
                      fileType="document"
                    />

                    <div className="flex justify-center">
                      <Button
                        onClick={processDocument}
                        disabled={!documentFile || loading}
                        className="px-6 py-3"
                      >
                        {loading ? "Processing..." : "Process Document"}
                      </Button>
                    </div>
                  </>
                )}

                {/* JSON Import Form */}
                {currentTab === 'json' && (
                  <>
                    {!showJsonInput ? (
                      <>
                        <FileUpload
                          accept=".json"
                          onFileChange={handleJsonFileChange}
                          label="Import Quiz JSON"
                          supportText="Compatible with DocQuiz JSON format"
                          fileType="JSON file"
                        />

                        {/* JSON Preview Section */}
                        {jsonFile && jsonPreview && (
                          <div className="mt-4 border rounded-md p-4 bg-neutral-50">
                            <h4 className="text-sm font-medium mb-2 flex items-center justify-between">
                              <span>JSON Preview</span>
                              <span className="text-xs text-neutral-500">{jsonFile.name}</span>
                            </h4>
                            <div className="overflow-auto max-h-64 bg-white p-2 rounded border border-neutral-200">
                              <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-800">{jsonPreview}</pre>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
                          <Button
                            onClick={processJsonFile}
                            disabled={!jsonFile || loading}
                            className="px-6 py-3"
                          >
                            {loading ? "Loading..." : "Load Quiz"}
                          </Button>
                          <div className="text-center">
                            <p className="text-sm text-neutral-500">or</p>
                            <button
                              onClick={() => setShowJsonInput(true)}
                              className="text-primary-600 text-sm font-medium hover:underline focus:outline-none"
                            >
                              Paste JSON directly
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-neutral-700">Paste JSON</label>
                          <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-64 font-mono text-sm"
                            placeholder="Paste your quiz JSON here..."
                          />
                        </div>
                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={processJsonInput}
                            className="px-6 py-3"
                          >
                            Process JSON
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowJsonInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quiz Sharing Link */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Have a Quiz Link?</h3>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Paste quiz link here"
                    value={quizLink}
                    onChange={(e) => setQuizLink(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button
                    onClick={handleOpenQuizLink}
                    className="rounded-l-none"
                  >
                    Open Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit & Review View */}
        {currentStep === 'edit' && quizData && (
          <div className="max-w-6xl mx-auto">
            <Card>
              <div className="border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Edit Quiz</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-neutral-500">
                      {quizData.questions.length} questions extracted
                    </span>
                    <button
                      className="text-primary-600 hover:text-primary-500 font-medium text-sm focus:outline-none"
                      onClick={processDocument}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Rescan
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz Title */}
              <div className="px-6 py-4 border-b border-neutral-200">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Quiz Title</label>
                <Input
                  type="text"
                  value={quizData.title}
                  onChange={handleTitleChange}
                  className="w-full"
                />
              </div>

              {/* Quiz Items */}
              <div className="p-6">
                <div className="space-y-6">
                  {quizData.questions.map((question, index) => (
                    <QuizItem
                      key={question.id}
                      question={question}
                      index={index}
                      onChange={(updatedQuestion) => handleQuestionChange(updatedQuestion, index)}
                      onDelete={() => deleteQuestion(index)}
                    />
                  ))}

                  {/* Add Question Button */}
                  <button
                    onClick={addNewQuestion}
                    className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:text-primary-600 hover:border-primary-500 focus:outline-none transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Question
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-neutral-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('export')}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Export & Share View */}
        {currentStep === 'export' && quizData && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">Export & Share Quiz</h2>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Quiz Details</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">{quizData.title}</span>
                      <span className="text-sm text-neutral-500">{quizData.questions.length} questions</span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <p>Created: {new Date().toLocaleDateString()}</p>
                      <p>Last Modified: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Export Options */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Export Options</h3>

                    <div className="space-y-4">
                      <button
                        onClick={handleDownloadJson}
                        className="w-full flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <div className="text-left">
                            <span className="font-medium">Download JSON</span>
                            <p className="text-xs text-neutral-500">Save quiz for future use or sharing</p>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Share Quiz</h3>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Shareable Link</label>
                      <div className="flex">
                        <Input
                          type="text"
                          value={quizLink}
                          readOnly
                          className="rounded-r-none"
                        />
                        <Button
                          onClick={quizLink ? copyLinkToClipboard : shareQuiz}
                          className="rounded-l-none"
                        >
                          {quizLink ? "Copy" : "Generate"}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-neutral-500">Anyone with this link can access and take this quiz</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('edit')}
              >
                Back to Edit
              </Button>
              <Button
                onClick={() => setCurrentStep('quiz')}
              >
                Take Quiz
              </Button>
            </div>
          </div>
        )}

        {/* Take Quiz View */}
        {currentStep === 'quiz' && quizData && (
          <div className="max-w-3xl mx-auto">
            <QuizTaker
              quizData={quizData}
              onComplete={handleQuizComplete}
              onExit={() => setCurrentStep('export')}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
