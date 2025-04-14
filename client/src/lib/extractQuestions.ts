import { QuizQuestion, QuizOption } from "@shared/schema";

export async function extractQuestionsFromDocument(file: File): Promise<{ title: string; questions: QuizQuestion[] }> {
  try {
    // Create a FormData instance to send the file to the backend
    const formData = new FormData();
    formData.append('document', file);

    // Send the file to the backend for processing
    // Use the dedicated Netlify function for file uploads in production
    const apiUrl = process.env.NODE_ENV === 'production'
      ? '/.netlify/functions/upload/extract'
      : '/api/quizzes/extract';

    console.log('Sending file to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to process document');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error extracting questions:', error);
    throw error;
  }
}

// Generate a unique ID for new questions or options
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Create a new empty question
export function createEmptyQuestion(): QuizQuestion {
  return {
    id: generateId(),
    text: '',
    type: 'multiple-choice',
    options: [
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
    ],
    points: 1,
    required: true
  };
}

// Create a new option for multiple choice questions
export function createEmptyOption(): QuizOption {
  return {
    id: generateId(),
    text: '',
    isCorrect: false
  };
}
