import { QuizData, QuizQuestion, QuizOption } from "@shared/schema";

// Format quiz data for JSON export
export function formatQuizForExport(quizData: QuizData): string {
  return JSON.stringify(quizData, null, 2);
}

// Create a download for the JSON file
export function downloadQuizJson(quizData: QuizData): void {
  const json = formatQuizForExport(quizData);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quizData.title.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse a quiz JSON file
export async function parseQuizJsonFile(file: File): Promise<QuizData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as QuizData;
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
}

// Generate a preview of a JSON file (returns JSON as string and optionally formatted)
export async function previewJsonFile(file: File, pretty: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        // Verify it's valid JSON by parsing it
        const data = JSON.parse(json);
        
        // Return the string, optionally pretty-printed
        if (pretty) {
          resolve(JSON.stringify(data, null, 2));
        } else {
          resolve(json);
        }
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

// Calculate quiz result
export function calculateQuizResult(
  quizData: QuizData, 
  userAnswers: Record<string, string>
) {
  const results = {
    totalQuestions: quizData.questions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    score: 0,
    questionResults: [] as {
      questionId: string;
      correct: boolean;
      userAnswer: string;
      correctAnswer: string;
      questionText: string;
    }[]
  };
  
  quizData.questions.forEach(question => {
    const userAnswerId = userAnswers[question.id];
    const correctOption = question.options.find(opt => opt.isCorrect);
    const userOption = question.options.find(opt => opt.id === userAnswerId);
    
    if (!correctOption) return;
    
    const isCorrect = userAnswerId === correctOption.id;
    
    if (isCorrect) {
      results.correctAnswers++;
    } else {
      results.incorrectAnswers++;
    }
    
    results.questionResults.push({
      questionId: question.id,
      correct: isCorrect,
      userAnswer: userOption?.text || 'No answer',
      correctAnswer: correctOption.text,
      questionText: question.text
    });
  });
  
  results.score = (results.correctAnswers / results.totalQuestions) * 100;
  
  return results;
}
