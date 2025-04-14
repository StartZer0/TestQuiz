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
    const response = await fetch('/quiz-data/quiz-catalog.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz catalog: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz catalog:', error);
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
