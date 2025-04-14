const multer = require('multer');
const express = require('express');
const serverless = require('serverless-http');
const { parseDocx } = require('../../dist/lib/docParser');
const cors = require('cors');

// Create an Express app for this function
const app = express();

// Enable CORS
app.use(cors());

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
