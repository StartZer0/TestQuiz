const multer = require('multer');
const express = require('express');
const serverless = require('serverless-http');
const mammoth = require('mammoth');
const { JSDOM } = require('jsdom');
const { nanoid } = require('nanoid');

// Create an Express app for this function
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Simple document parsing function
async function parseDocx(buffer) {
  try {
    // Convert docx to HTML with mammoth
    const result = await mammoth.convertToHtml({ buffer });
    const htmlContent = result.value;

    // Use JSDOM to parse the resulting HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract document title
    let title = 'Imported Quiz';
    const headings = document.querySelectorAll('h1, h2');
    if (headings.length > 0) {
      title = headings[0].textContent?.trim() || title;
    }

    // Find question elements
    const paragraphs = Array.from(document.querySelectorAll('p'));
    const questions = [];

    // Simple question extraction - look for numbered paragraphs
    for (let i = 0; i < paragraphs.length; i++) {
      const text = paragraphs[i].textContent.trim();
      const questionMatch = text.match(/^(\d+)[.)]\s+(.+)/);

      if (questionMatch) {
        const questionNumber = questionMatch[1];
        const questionText = questionMatch[2];

        // Look for options in subsequent paragraphs
        const options = [];
        let j = i + 1;
        while (j < paragraphs.length) {
          const optionText = paragraphs[j].textContent.trim();

          // Check if this is an option (starts with A, B, C, etc.)
          const optionMatch = optionText.match(/^([A-Z])[.)]\s+(.+)/);
          if (optionMatch) {
            const isCorrect = optionText.includes('(correct)') ||
                            optionText.includes('✓') ||
                            optionText.endsWith('-----');

            options.push({
              id: nanoid(8),
              text: optionMatch[2].replace(/\(correct\)|✓|-----/g, '').trim(),
              isCorrect
            });
            j++;
          } else {
            // Not an option, must be the next question
            break;
          }
        }

        // If we found options, create a question
        if (options.length > 0) {
          // Ensure at least one option is marked as correct
          if (!options.some(opt => opt.isCorrect)) {
            options[0].isCorrect = true; // Default to first option
          }

          questions.push({
            id: nanoid(8),
            text: `${questionNumber}) ${questionText}`,
            type: 'multiple-choice',
            options,
            required: true,
            points: 1
          });
        }

        // Skip to after the options
        i = j - 1;
      }
    }

    console.log(`Extracted ${questions.length} questions with options`);
    return { title, questions };
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error('Failed to parse document content');
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create a middleware to handle the file upload
const uploadMiddleware = upload.single('document');

// Create the route for document extraction
app.post('/extract', (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check file type
      if (!req.file.originalname.endsWith('.docx')) {
        return res.status(400).json({ message: 'Only .docx files are supported' });
      }

      // Parse the document content
      const extractedQuiz = await parseDocx(req.file.buffer);

      return res.status(200).json(extractedQuiz);
    } catch (error) {
      console.error('Error extracting quiz:', error);
      return res.status(500).json({ message: 'Failed to process document' });
    }
  });
});

// Configure serverless options
const serverlessOptions = {
  binary: true,
};

// Export the serverless handler
exports.handler = serverless(app, serverlessOptions);
