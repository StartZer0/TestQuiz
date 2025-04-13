import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(), // Store entire quiz structure as JSON
  userId: integer("user_id").references(() => users.id),
  shareId: text("share_id").unique(), // Unique identifier for sharing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the Option interface for quiz options
export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  imageUrl: z.string().optional(),
});

// Define the Question interface for quiz questions
export const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["multiple-choice"]),
  imageUrl: z.string().optional(),
  options: z.array(QuizOptionSchema),
  points: z.number().default(1),
  required: z.boolean().default(true),
});

// Define the full Quiz structure
export const QuizDataSchema = z.object({
  title: z.string(),
  questions: z.array(QuizQuestionSchema),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  data: true,
  userId: true,
  shareId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizData = z.infer<typeof QuizDataSchema>;
