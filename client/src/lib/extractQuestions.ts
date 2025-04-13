import { QuizQuestion, QuizOption } from "@shared/schema";

export async function extractQuestionsFromDocument(file: File): Promise<{ title: string; questions: QuizQuestion[] }> {
  try {
    // Create a FormData instance to send the file to the backend
    const formData = new FormData();
    formData.append('document', file);

    // Send the file to the backend for processing
    console.log('Sending file to backend for processing...');

    // Use XMLHttpRequest instead of fetch for better file upload handling
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', '/api/quizzes/extract', true);

      xhr.onload = function() {
        console.log('Response status:', xhr.status);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('Received data from server:', data);
            resolve(data);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            reject(new Error('Failed to parse server response'));
          }
        } else {
          console.error('Server returned error:', xhr.responseText);
          reject(new Error(xhr.responseText || 'Failed to process document'));
        }
      };

      xhr.onerror = function() {
        console.error('Network error occurred');
        reject(new Error('Network error occurred'));
      };

      xhr.send(formData);
    });
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
