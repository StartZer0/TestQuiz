import { users, type User, type InsertUser, Quiz, InsertQuiz, QuizData } from "@shared/schema";
import { nanoid } from "nanoid";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz methods
  saveQuiz(quiz: Partial<InsertQuiz>): Promise<Quiz>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuizByShareId(shareId: string): Promise<Quiz | undefined>;
  getAllQuizzes(): Promise<Quiz[]>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  userCurrentId: number;
  quizCurrentId: number;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.userCurrentId = 1;
    this.quizCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async saveQuiz(quizData: Partial<InsertQuiz>): Promise<Quiz> {
    const id = this.quizCurrentId++;
    const now = new Date();
    
    // Generate shareId if not provided
    const shareId = quizData.shareId || nanoid(10);
    
    const quiz: Quiz = {
      id,
      title: quizData.title || "Untitled Quiz",
      data: quizData.data as QuizData,
      userId: quizData.userId || null,
      shareId,
      createdAt: now,
      updatedAt: now,
    };
    
    this.quizzes.set(id, quiz);
    return quiz;
  }
  
  async getQuizById(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async getQuizByShareId(shareId: string): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values()).find(
      (quiz) => quiz.shareId === shareId
    );
  }
  
  async getAllQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }
  
  async updateQuiz(id: number, quizData: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz: Quiz = {
      ...quiz,
      title: quizData.title || quiz.title,
      data: quizData.data || quiz.data,
      updatedAt: new Date(),
    };
    
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }
  
  async deleteQuiz(id: number): Promise<boolean> {
    return this.quizzes.delete(id);
  }
}

export const storage = new MemStorage();
