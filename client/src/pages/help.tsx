import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Help: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Help & Documentation</h1>
        
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <p className="mb-4">
                DocQuiz is a powerful tool for converting documents into interactive quizzes. Follow these steps to create your first quiz:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Upload a Word document (.docx) containing your questions and answers.</li>
                <li>Review and edit the automatically extracted quiz content.</li>
                <li>Export your quiz as JSON or share it with others.</li>
                <li>Take the quiz yourself or let others take it via the share link.</li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Document Format Guidelines</h2>
              <p className="mb-4">
                For the best results when uploading a document, follow these guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Format each question on a new line or paragraph.</li>
                <li>List multiple-choice options with A), B), C), etc. or as bullet points.</li>
                <li>Mark correct answers by making them <strong>bold</strong> or prefixing them with a + sign.</li>
                <li>Include images by embedding them in the document near the relevant questions.</li>
                <li>Use consistent formatting throughout the document for the best extraction results.</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Editing Your Quiz</h2>
              <p className="mb-4">
                After uploading your document, you can:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Edit question text and answer options</li>
                <li>Mark or change the correct answer for each question</li>
                <li>Add new questions or answer options</li>
                <li>Delete questions or answer options</li>
                <li>Change the quiz title</li>
                <li>Add, remove, or replace images</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Sharing Your Quiz</h2>
              <p className="mb-4">
                There are several ways to share your created quiz:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Share Link:</strong> Generate a unique link that others can use to take your quiz.</li>
                <li><strong>JSON Export:</strong> Download your quiz as a JSON file that can be imported later.</li>
                <li><strong>My Quizzes:</strong> Access all your created quizzes from the My Quizzes page.</li>
              </ul>
              <p className="mt-4">
                Anyone with the share link can take the quiz, but only you can edit it.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Taking a Quiz</h2>
              <p className="mb-4">
                When taking a quiz:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Select your answer for each question</li>
                <li>Click "Check Answer" to see if you're correct</li>
                <li>Get immediate feedback after answering each question</li>
                <li>Navigate between questions using the Previous and Next buttons</li>
                <li>View your final score and performance summary when finished</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">What file formats are supported?</h3>
                  <p className="text-neutral-600">Currently, DocQuiz supports .docx files. PDF support is coming soon.</p>
                </div>
                <div>
                  <h3 className="font-medium">How many questions can a quiz have?</h3>
                  <p className="text-neutral-600">Quizzes can contain up to 100 questions for optimal performance.</p>
                </div>
                <div>
                  <h3 className="font-medium">Can I add images to questions after upload?</h3>
                  <p className="text-neutral-600">Yes, you can add, remove, or replace images in the quiz editor.</p>
                </div>
                <div>
                  <h3 className="font-medium">How long are shared quiz links valid?</h3>
                  <p className="text-neutral-600">Shared quiz links remain valid unless you delete the quiz.</p>
                </div>
                <div>
                  <h3 className="font-medium">Can I track quiz responses?</h3>
                  <p className="text-neutral-600">Currently, we don't track quiz responses from other users. This feature is planned for a future update.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
