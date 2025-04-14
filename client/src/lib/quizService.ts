import { QuizData } from '@shared/schema';

export interface QuizCatalogItem {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  filePath: string;
  category: 'section' | 'full';
  icon: string;
  color: string;
  featured?: boolean;
}

export interface QuizCatalog {
  quizzes: QuizCatalogItem[];
}

/**
 * Fetches the catalog of available quizzes
 */
export async function fetchQuizCatalog(): Promise<QuizCatalog> {
  try {
    console.log('Attempting to fetch quiz catalog...');
    const response = await fetch('/quiz-data/quiz-catalog.json');

    console.log('Fetch response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers]),
      url: response.url
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz catalog: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Quiz catalog data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching quiz catalog:', error);
    // Check if it's a SyntaxError, which would indicate JSON parsing issues
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error - check quiz-catalog.json for syntax errors');
    }
    throw error;
  }
}

/**
 * Fetches a specific quiz by its file path
 */
export async function fetchQuizByPath(filePath: string): Promise<QuizData> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quiz from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Fetches a specific quiz by its ID
 */
export async function fetchQuizById(quizId: string): Promise<QuizData> {
  try {
    // First fetch the catalog to get the file path
    const catalog = await fetchQuizCatalog();
    const quizItem = catalog.quizzes.find(quiz => quiz.id === quizId);

    if (!quizItem) {
      throw new Error(`Quiz with ID ${quizId} not found in catalog`);
    }

    // Then fetch the actual quiz data
    return await fetchQuizByPath(quizItem.filePath);
  } catch (error) {
    console.error(`Error fetching quiz with ID ${quizId}:`, error);
    throw error;
  }
}
