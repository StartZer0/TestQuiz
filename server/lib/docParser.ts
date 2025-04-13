import mammoth from 'mammoth';
import { JSDOM } from 'jsdom';
import { formatCorrectAnswer, identifyCorrectCompoundAnswer } from './formatParser';
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
    const paragraphs = Array.from(document.querySelectorAll('p'));
    const questions: QuizQuestion[] = [];
    
    // Track different question states
    let currentQuestion: QuizQuestion | null = null;
    let numbersList: string[] = []; // Store numbered list items for compound questions
    let isCollectingNumbers = false;
    let compoundAnswerOptions: QuizOption[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const text = para.textContent?.trim() || '';
      
      // Skip empty paragraphs
      if (!text) continue;
      
      // Identify if this is a numbered list item (like "1. Item text")
      const isNumberedItem = /^\d+[\.\)]/.test(text);
      
      // Check if this is a compound answer option (like "A) 1, 2" or "B) 3, 4")
      const isCompoundOption = /^[A-Z][\.\)]\s*\d+,\s*\d+/.test(text) || 
                               /^[A-Z][\.\)]\s*\d+\s+and\s+\d+/.test(text);
      
      // Is this a potential question?
      if (
        text.endsWith('?') || 
        // Numbered questions like "301) Question text?"
        /^\d{2,}[\.\)]/.test(text) ||
        // Check if followed by what looks like options
        (i < paragraphs.length - 1 && (isLikelyOption(paragraphs[i+1].textContent) || isCompoundOption))
      ) {
        // Complete previous question if any
        if (currentQuestion && (currentQuestion.options.length > 0 || compoundAnswerOptions.length > 0)) {
          // If we were collecting compound answers, process them now
          if (compoundAnswerOptions.length > 0) {
            currentQuestion.options = compoundAnswerOptions;
            // Reset compound collection
            compoundAnswerOptions = [];
            numbersList = [];
          }
          questions.push(currentQuestion);
        }
        
        // Reset number collection state
        isCollectingNumbers = false;
        
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
        
        // Check if this might be the start of a compound question with numbered items
        if (i < paragraphs.length - 1) {
          const nextText = paragraphs[i+1].textContent?.trim() || '';
          if (/^\d+[\.\)]/.test(nextText)) {
            isCollectingNumbers = true;
          }
        }
        
        continue;
      }
      
      // If collecting numbered items for a compound question
      if (currentQuestion && isCollectingNumbers && isNumberedItem) {
        numbersList.push(text.replace(/^\d+[\.\)]\s*/, '').trim());
        continue;
      }
      
      // Check if this is a compound answer option that references numbered items
      if (currentQuestion && isCompoundOption && numbersList.length > 0) {
        // This is a compound answer option, e.g., "A) 1, 2" or "A) 1, 4"
        const optionText = text.replace(/^[A-Z][\.\)]\s*/, '').trim();
        const isCorrect = formatCorrectAnswer(para);
        
        // Add to compound answer options
        compoundAnswerOptions.push({
          id: nanoid(),
          text: optionText,
          isCorrect
        });
        
        // If this is the last option, we should stop collecting
        if (text.startsWith('E)') || (i < paragraphs.length - 1 && !isLikelyOption(paragraphs[i+1].textContent))) {
          // After collecting all compound options, determine the correct one if not already marked
          if (!compoundAnswerOptions.some(opt => opt.isCorrect)) {
            const correctIndex = identifyCorrectCompoundAnswer(compoundAnswerOptions.map(opt => opt.text));
            if (correctIndex >= 0 && correctIndex < compoundAnswerOptions.length) {
              compoundAnswerOptions[correctIndex].isCorrect = true;
            } else if (compoundAnswerOptions.length > 0) {
              // Default to first option if can't determine
              compoundAnswerOptions[0].isCorrect = true;
            }
          }
          
          // Update the question text to include numbered items
          if (currentQuestion && numbersList.length > 0) {
            // Format the list nicely
            const numberedListFormatted = numbersList.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
            currentQuestion.text = `${currentQuestion.text}\n\n${numberedListFormatted}`;
          }
          
          // Move to standard option processing
          isCollectingNumbers = false;
        }
        
        continue;
      }
      
      // Regular option processing for standard MC questions
      if (currentQuestion && isLikelyOption(text) && !isCollectingNumbers) {
        // Extract the option text, removing the prefix (A), B), etc.)
        const optionText = text.replace(/^[A-Z][\.\)]\s*|\•\s*|\-\s*|\+\s*/, '').trim();
        
        // Check if this is marked as the correct answer 
        const isCorrect = formatCorrectAnswer(para);
        
        // Add the option to the current question
        currentQuestion.options.push({
          id: nanoid(),
          text: optionText,
          isCorrect
        });
      }
    }
    
    // Process the last question if not added yet
    if (currentQuestion) {
      if (compoundAnswerOptions.length > 0) {
        // If the last question had compound answers
        currentQuestion.options = compoundAnswerOptions;
        
        // Update question text with numbered items if needed
        if (numbersList.length > 0) {
          const numberedListFormatted = numbersList.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
          currentQuestion.text = `${currentQuestion.text}\n\n${numberedListFormatted}`;
        }
      }
      
      if (currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
      }
    }
    
    // Ensure at least one correct answer per question
    questions.forEach(question => {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      
      if (!hasCorrectAnswer && question.options.length > 0) {
        // If no option is marked correct, default to the first one
        question.options[0].isCorrect = true;
      }
    });
    
    console.log(`Extracted ${questions.length} questions with options`);
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
  // - 1., 2., etc. (numbered options)
  // - Bullet points (• or -)
  // - Plus sign (+) for correct answers
  return /^[A-Za-z][\.\)]/.test(text) || 
         /^\d+[\.\)]/.test(text) ||
         /^\•/.test(text) || 
         /^\-/.test(text) ||
         /^\+/.test(text);
}
