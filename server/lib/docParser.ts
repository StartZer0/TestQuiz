import mammoth from 'mammoth';
import { JSDOM } from 'jsdom';
import { formatCorrectAnswer } from './formatParser';
import { extractImages } from './imageExtractor';
import { QuizQuestion, QuizOption } from '@shared/schema';
import { nanoid } from 'nanoid';

// Helper function to identify correct answer in compound questions
function identifyCorrectCompoundAnswer(options: string[]): number {
  // Check for explicit markings like "-----" or "(correct)" that might be appended
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (option.includes('-----') || 
        option.includes('(correct)') || 
        option.includes('✓') ||
        // Check for specific highlighting pattern at end of option
        /\s+[-–—]{3,}$/.test(option)) {
      return i;
    }
  }
  
  // If no explicit marking was found, we might need to use other heuristics
  // For example, in some formats the last option is often correct
  // But this is very domain-specific, so we return -1 to indicate no definitive answer
  return -1;
}

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
    
    // Variables to track parsing state
    let currentQuestion: QuizQuestion | null = null;
    let collectingOptions = false;
    let currentOptions: QuizOption[] = [];
    let numbersList: string[] = [];
    let isCompoundQuestion = false;
    let skipParagraphs = 0;
    
    // First pass: detect numbered questions (like "301) Question") and collect them
    for (let i = 0; i < paragraphs.length; i++) {
      if (skipParagraphs > 0) {
        skipParagraphs--;
        continue;
      }
      
      const para = paragraphs[i];
      const text = para.textContent?.trim() || '';
      
      // Skip empty paragraphs or structural elements like "-----"
      if (!text || text === '-----' || text.match(/^\s*$/) || text.match(/^\s*[\-_]{3,}\s*$/)) {
        continue;
      }
      
      // Special case for medical exam format: detect numbered questions (301), 302), etc.)
      const numQuestionMatch = text.match(/^(\d{2,})[\.\)]\s*(.*)/);
      
      if (numQuestionMatch) {
        // If we were already collecting a question, save it first
        if (currentQuestion && currentOptions.length > 0) {
          currentQuestion.options = currentOptions;
          
          // Ensure we have at least one correct answer marked
          if (!currentOptions.some(opt => opt.isCorrect)) {
            // Try to identify the correct option (look for marking, etc.)
            for (let j = 0; j < currentOptions.length; j++) {
              if (currentOptions[j].text.includes('-----')) {
                currentOptions[j].isCorrect = true;
                break;
              }
            }
            
            // If still no correct answer is identified, default to first option
            if (!currentOptions.some(opt => opt.isCorrect) && currentOptions.length > 0) {
              currentOptions[0].isCorrect = true;
            }
          }
          
          questions.push(currentQuestion);
        }
        
        // Start a new question
        const questionNumber = numQuestionMatch[1];
        const questionText = numQuestionMatch[2];
        
        currentQuestion = {
          id: nanoid(),
          text: `${questionNumber}) ${questionText}`,
          type: 'multiple-choice',
          options: [],
          required: true,
          points: 1
        };
        
        // Reset options and state
        currentOptions = [];
        collectingOptions = true;
        numbersList = [];
        isCompoundQuestion = false;
        
        // Check if this is a compound question with numbered items for reference
        // Look ahead for numbered list items
        let hasNumberItems = false;
        let optionsStartIndex = -1;
        
        // Look through the next paragraphs to identify the structure
        for (let j = i + 1; j < Math.min(i + 15, paragraphs.length); j++) {
          const nextText = paragraphs[j].textContent?.trim() || '';
          
          // If empty, continue
          if (!nextText) continue;
          
          // Check if it's a numbered item (1., 2., etc.)
          if (/^\d+[\.\)]/.test(nextText) && !(/^[A-Z][\.\)]/.test(nextText))) {
            hasNumberItems = true;
          } 
          // Check if it's an option (A), B), etc.)
          else if (/^[A-Z][\.\)]/.test(nextText)) {
            optionsStartIndex = j;
            break;
          }
        }
        
        // If we have numbered items followed by option items, it's a compound question
        isCompoundQuestion = hasNumberItems && optionsStartIndex > -1;
        
        continue;
      }
      
      // Process numbered list items for compound questions
      if (currentQuestion && isCompoundQuestion && /^\d+[\.\)]/.test(text) && !(/^[A-Z][\.\)]/.test(text))) {
        const itemMatch = text.match(/^\d+[\.\)]\s*(.*)/);
        if (itemMatch) {
          const itemNumber = numbersList.length + 1;
          const itemText = itemMatch[1].trim();
          numbersList.push(itemText);
          
          // For medical exam format, add the numbered items to the question text directly
          currentQuestion.text = `${currentQuestion.text}\n\n${itemNumber}. ${itemText}`;
        }
        continue;
      }
      
      // Process options (A), B), etc.)
      if (currentQuestion && collectingOptions && /^[A-Z][\.\)]/.test(text)) {
        const optionMatch = text.match(/^([A-Z])[\.\)]\s*(.*)/);
        if (optionMatch) {
          const optionLetter = optionMatch[1];
          let optionText = optionMatch[2].trim();
          
          // For compound questions with numbered references, keep the original format
          // This preserves options like "A) 1, 2" as they are
          if (isCompoundQuestion && numbersList.length > 0) {
            // Keep the option text as is, don't expand the references
            // This maintains the format of "A) 1, 2" rather than expanding to full texts
            optionText = optionMatch[2].trim();
          }
          
          // Check if this option is marked as correct
          const isCorrect = formatCorrectAnswer(para) || 
                           text.includes('-----') || 
                           text.includes('(correct)') || 
                           optionText.endsWith('-----');
          
          // Remove any marking symbols from the option text
          optionText = optionText.replace(/\s*-----.*$/, '');
          
          currentOptions.push({
            id: nanoid(),
            text: optionText,
            isCorrect
          });
        }
        continue;
      }
      
      // If not a question, numbered item, or option, but still within a question boundary
      // Most likely additional text that should be part of the current question
      if (currentQuestion && !collectingOptions && text) {
        currentQuestion.text += '\n' + text;
      }
    }
    
    // Add the last question if needed
    if (currentQuestion && currentOptions.length > 0) {
      currentQuestion.options = currentOptions;
      
      // Ensure we have at least one correct answer
      if (!currentOptions.some(opt => opt.isCorrect) && currentOptions.length > 0) {
        currentOptions[0].isCorrect = true;
      }
      
      questions.push(currentQuestion);
    }
    
    // Ensure each question has at least one correct answer
    questions.forEach(question => {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer && question.options.length > 0) {
        // Try to find correct answer by analyzing option texts
        // In some medical question formats, the correct answer might be marked in various ways
        const correctOptionIndex = question.options.findIndex(opt => {
          return opt.text.includes("-----") || // Marked with dashes
                 opt.text.includes("(correct)") || // Explicitly marked
                 /\([\+✓]\)/.test(opt.text); // Has a check or plus mark
        });
        
        if (correctOptionIndex !== -1) {
          question.options[correctOptionIndex].isCorrect = true;
        } else {
          // If no markings found, default to first option
          question.options[0].isCorrect = true;
        }
      }
    });
    
    console.log(`Extracted ${questions.length} questions with options`);
    return { title, questions };
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error('Failed to parse document content');
  }
}
