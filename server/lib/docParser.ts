import mammoth from 'mammoth';
import { JSDOM } from 'jsdom';
import { formatCorrectAnswer } from './formatParser';
import { extractImages } from './imageExtractor';
import { QuizQuestion, QuizOption } from '@shared/schema';
import { nanoid } from 'nanoid';

/**
 * Parse a .docx document and extract quiz questions
 */
export async function parseDocx(buffer: Buffer): Promise<{ title: string; questions: QuizQuestion[] }> {
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
    
    // Extract images
    const imageMap = await extractImages(buffer);
    
    // Find question elements
    // This is a simplified approach - in a real app, we'd use more sophisticated 
    // parsing based on document structure, but this provides a starting point
    const paragraphs = Array.from(document.querySelectorAll('p'));
    const questions: QuizQuestion[] = [];
    
    // A question is often a paragraph followed by options
    // Options are paragraphs that start with A), B), etc. or bullet points
    let currentQuestion: QuizQuestion | null = null;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const text = para.textContent?.trim() || '';
      
      // Skip empty paragraphs
      if (!text) continue;
      
      // Is this a potential question?
      if (
        // Ends with a question mark
        text.endsWith('?') || 
        // Numbered questions
        /^\d+[\.\)]/.test(text) ||
        // Check if followed by what looks like options
        (i < paragraphs.length - 1 && isLikelyOption(paragraphs[i+1].textContent))
      ) {
        // Complete previous question if any
        if (currentQuestion && currentQuestion.options.length > 0) {
          questions.push(currentQuestion);
        }
        
        // Start a new question
        currentQuestion = {
          id: nanoid(),
          text: text,
          type: 'multiple-choice',
          options: [],
          required: true,
          points: 1
        };
        
        // Check if the question has an associated image
        const questionImages = document.querySelectorAll(`img[data-emu-id]`);
        for (const img of questionImages) {
          const emuId = img.getAttribute('data-emu-id');
          if (emuId && imageMap[emuId]) {
            currentQuestion.imageUrl = imageMap[emuId];
            break;
          }
        }
        
        continue;
      }
      
      // Is this potentially an option for the current question?
      if (currentQuestion && isLikelyOption(text)) {
        // Extract the option text, removing the prefix (A), B), etc.)
        const optionText = text.replace(/^[A-Z][\.\)]\s*|\•\s*|\-\s*|\+\s*/, '').trim();
        
        // Check if this is marked as the correct answer 
        // (either bold text or + prefix)
        const isCorrect = formatCorrectAnswer(para);
        
        // Add the option to the current question
        currentQuestion.options.push({
          id: nanoid(),
          text: optionText,
          isCorrect
        });
      }
    }
    
    // Add the last question if not added yet
    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }
    
    // Ensure at least one correct answer per question
    questions.forEach(question => {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      
      if (!hasCorrectAnswer && question.options.length > 0) {
        // If no option is marked correct, default to the first one
        question.options[0].isCorrect = true;
      }
    });
    
    return { title, questions };
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error('Failed to parse document content');
  }
}

// Helper to determine if text is likely an option
function isLikelyOption(text: string | null): boolean {
  if (!text) return false;
  text = text.trim();
  
  // Common patterns for options:
  // - A), B), etc.
  // - a), b), etc.
  // - Bullet points (• or -)
  // - Plus sign (+) for correct answers
  return /^[A-Za-z][\.\)]/.test(text) || 
         /^\•/.test(text) || 
         /^\-/.test(text) ||
         /^\+/.test(text);
}
