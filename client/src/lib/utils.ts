import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  // Create a copy of the array to avoid modifying the original
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Selects a random subset of questions from a quiz
 * @param data The quiz data
 * @param limit The maximum number of questions to include
 * @param shuffle Whether to shuffle the questions
 * @returns A new quiz data object with the selected questions
 */
export function selectRandomQuestions(data: any, limit: number, shuffle: boolean = false) {
  if (!data || !data.questions || data.questions.length === 0) return data;

  // Check if we have more questions than the limit
  const totalQuestions = data.questions.length;

  // If we don't have more questions than the limit and don't need to shuffle, return the original data
  if (totalQuestions <= limit && !shuffle) {
    return data;
  }

  // Select questions
  let selectedQuestions = [...data.questions];

  // Shuffle the questions if needed
  if (shuffle) {
    selectedQuestions = shuffleArray(selectedQuestions);
  }

  // Take only the first 'limit' questions if needed
  if (totalQuestions > limit) {
    selectedQuestions = selectedQuestions.slice(0, limit);
  }

  // Return the limited quiz data
  return {
    ...data,
    questions: selectedQuestions
  };
}
