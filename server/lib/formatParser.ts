/**
 * Check if an option is marked as the correct answer
 * based on formatting (bold or + prefix)
 */
export function formatCorrectAnswer(paraElement: Element): boolean {
  const text = paraElement.textContent?.trim() || '';
  
  // Check for + sign at the beginning
  if (text.startsWith('+')) {
    return true;
  }
  
  // Check for trailing markers, like "E) 2, 3 -----" (dashes indicate correct answer)
  if (text.includes('-----') || text.includes('(correct)') || text.includes('✓')) {
    return true;
  }
  
  // Check for bold text
  const boldElements = paraElement.querySelectorAll('strong, b');
  if (boldElements.length > 0) {
    // If the entire text or significant part is wrapped in bold, it's likely the correct answer
    for (const bold of Array.from(boldElements)) {
      const boldText = bold.textContent?.trim() || '';
      const cleanText = text.replace(/^[A-Z][\.\)]\s*|\•\s*|\-\s*/, '').trim();
      
      // Check if the bold text is the entire content or a significant part
      if (boldText === cleanText || 
          (boldText.length > 0 && cleanText.includes(boldText) && boldText.length > cleanText.length / 2)) {
        return true;
      }
    }
  }
  
  return false;
}
