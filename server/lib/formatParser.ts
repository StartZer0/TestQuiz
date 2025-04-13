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

/**
 * Identify the correct answer in compound or complex question formats
 * where answers refer to numbered items (like "A) 1, 2" or "E) 2, 3 -----")
 * 
 * @param options Array of option texts to analyze
 * @returns Index of the identified correct answer, or -1 if none found
 */
export function identifyCorrectCompoundAnswer(options: string[]): number {
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
