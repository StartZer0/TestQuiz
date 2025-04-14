import { QuizData, QuizQuestion, QuizOption } from "@shared/schema";

export type QuizStep = "welcome" | "upload" | "edit" | "export" | "quiz";

export interface UploadState {
  file: File | null;
  loading: boolean;
  error: string | null;
}

export interface QuizState {
  quizData: QuizData | null;
  currentQuestion: number;
  answers: Record<string, string>;
  answerSubmitted: boolean;
  completed: boolean;
  result: QuizResult | null;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  questionResults: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
}

export interface ParsedDocumentResponse {
  title: string;
  questions: QuizQuestion[];
}
