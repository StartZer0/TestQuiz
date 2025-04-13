import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { nanoid } from "nanoid";
import { parseDocx } from "./lib/docParser";
import { QuizDataSchema } from "@shared/schema";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Extract quiz from document
  app.post("/api/quizzes/extract", upload.single("document"), async (req, res) => {
    console.log("Received document upload request");
    try {
      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File received:", req.file.originalname, "Size:", req.file.size);

      // Check file type
      if (!req.file.originalname.endsWith(".docx")) {
        console.log("Invalid file type:", req.file.originalname);
        return res.status(400).json({ message: "Only .docx files are supported" });
      }

      // Parse the document content
      console.log("Starting document parsing...");
      const extractedQuiz = await parseDocx(req.file.buffer);
      console.log("Document parsed successfully, extracted", extractedQuiz.questions.length, "questions");

      return res.status(200).json(extractedQuiz);
    } catch (error) {
      console.error("Error extracting quiz:", error);
      return res.status(500).json({ message: "Failed to process document" });
    }
  });

  // Create and share a quiz
  app.post("/api/quizzes/share", async (req, res) => {
    try {
      const { quiz } = req.body;

      // Validate quiz data
      const parseResult = QuizDataSchema.safeParse(quiz);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid quiz data format" });
      }

      // Generate a unique shareId
      const shareId = nanoid(10);

      // Store the quiz
      const savedQuiz = await storage.saveQuiz({
        title: quiz.title,
        data: quiz,
        userId: null, // Anonymous for now
        shareId
      });

      return res.status(201).json({
        shareId,
        quizId: savedQuiz.id
      });
    } catch (error) {
      console.error("Error saving quiz:", error);
      return res.status(500).json({ message: "Failed to save quiz" });
    }
  });

  // Get a quiz by shareId
  app.get("/api/quizzes/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;

      const quiz = await storage.getQuizByShareId(shareId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      return res.status(200).json(quiz);
    } catch (error) {
      console.error("Error retrieving quiz:", error);
      return res.status(500).json({ message: "Failed to retrieve quiz" });
    }
  });

  // Get all quizzes (for My Quizzes)
  app.get("/api/quizzes", async (req, res) => {
    try {
      // In a real app, we'd filter by user ID
      const quizzes = await storage.getAllQuizzes();
      return res.status(200).json(quizzes);
    } catch (error) {
      console.error("Error retrieving quizzes:", error);
      return res.status(500).json({ message: "Failed to retrieve quizzes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
