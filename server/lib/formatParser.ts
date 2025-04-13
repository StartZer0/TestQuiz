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
  
  // Check for bold text
  const boldElements = paraElement.querySelectorAll('strong, b');
  if (boldElements.length > 0) {
    // If the entire text is wrapped in bold, it's likely the correct answer
    for (const bold of Array.from(boldElements)) {
      if (bold.textContent?.trim() === text.replace(/^[A-Z][\.\)]\s*|\•\s*|\-\s*/, '').trim()) {
        return true;
      }
    }
  }
  
  return false;
}
