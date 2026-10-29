/**
 * Validation Module
 * Shared validation logic for frontend and backend
 */

/**
 * Normalize answer string
 * - Convert to lowercase
 * - Remove non-alphanumeric characters (except spaces)
 * - Trim whitespace
 * @param {string} answer - Raw answer string
 * @returns {string} Normalized answer
 */
export function normalizeAnswer(answer) {
  if (typeof answer !== 'string') {
    return '';
  }
  
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove non-alphanumeric (keep spaces)
    .trim()
    .replace(/\s+/g, ' ');        // Collapse multiple spaces
}

/**
 * Check if string contains at least one emoji
 * Uses Unicode property escapes for proper emoji detection
 * @param {string} text - Text to check
 * @returns {boolean} True if contains emoji
 */
export function containsEmoji(text) {
  if (typeof text !== 'string') {
    return false;
  }
  
  // Unicode property escapes for emoji detection
  // This covers: Emoji, Emoji_Modifier, Emoji_Component, Emoji_Presentation
  const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
  return emojiRegex.test(text);
}

/**
 * Validate submission data
 * @param {Object} data - Submission data
 * @param {string} data.emoji - Emoji string
 * @param {string} data.answer - Answer text
 * @param {string} data.hint - Hint text
 * @returns {Object} Validation result
 */
export function validateSubmission(data) {
  const errors = [];
  const normalizedData = {};
  
  // Check required fields
  if (!data.emoji || data.emoji.trim() === '') {
    errors.push('Emoji field is required');
  }
  
  if (!data.answer || data.answer.trim() === '') {
    errors.push('Answer field is required');
  }
  
  if (!data.hint || data.hint.trim() === '') {
    errors.push('Hint field is required');
  }
  
  // Validate emoji contains at least one emoji character
  if (data.emoji && !containsEmoji(data.emoji)) {
    errors.push('Emoji field must contain at least one emoji character');
  }
  
  // Validate answer length (pre-normalization)
  const normalizedAnswer = normalizeAnswer(data.answer || '');
  if (normalizedAnswer.length < 1) {
    errors.push('Answer must be at least 1 character after normalization');
  }
  if (normalizedAnswer.length > 50) {
    errors.push('Answer must be 50 characters or less after normalization');
  }
  
  // Validate hint length
  const hint = (data.hint || '').trim();
  if (hint.length < 1) {
    errors.push('Hint must be at least 1 character');
  }
  if (hint.length > 100) {
    errors.push('Hint must be 100 characters or less');
  }
  
  // Sanitize inputs (basic XSS prevention)
  const sanitize = (str) => str.replace(/[<>]/g, '');
  
  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
      normalizedData: {
        emoji: sanitize(data.emoji.trim()),
        answer: normalizedAnswer,
        hint: sanitize(hint),
      },
    };
  }
  
  return {
    isValid: false,
    errors,
    normalizedData: null,
  };
}

/**
 * Validate puzzle data structure
 * @param {Object} puzzle - Puzzle object
 * @returns {Object} Validation result
 */
export function validatePuzzle(puzzle) {
  const errors = [];
  
  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle must be an object');
    return { isValid: false, errors };
  }
  
  // Check required fields
  const requiredFields = ['id', 'emoji', 'answer', 'hint', 'createdAt', 'usageCount'];
  for (const field of requiredFields) {
    if (!(field in puzzle)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate field types
  if (puzzle.id && typeof puzzle.id !== 'string') {
    errors.push('Field "id" must be a string');
  }
  
  if (puzzle.emoji && typeof puzzle.emoji !== 'string') {
    errors.push('Field "emoji" must be a string');
  }
  
  if (puzzle.answer && typeof puzzle.answer !== 'string') {
    errors.push('Field "answer" must be a string');
  }
  
  if (puzzle.hint && typeof puzzle.hint !== 'string') {
    errors.push('Field "hint" must be a string');
  }
  
  if (puzzle.createdAt && typeof puzzle.createdAt !== 'string') {
    errors.push('Field "createdAt" must be a string');
  }
  
  if (puzzle.usageCount !== undefined && typeof puzzle.usageCount !== 'number') {
    errors.push('Field "usageCount" must be a number');
  }
  
  // Validate content
  if (puzzle.emoji && !containsEmoji(puzzle.emoji)) {
    errors.push('Puzzle emoji field must contain at least one emoji');
  }
  
  if (puzzle.answer && normalizeAnswer(puzzle.answer).length === 0) {
    errors.push('Puzzle answer must be valid after normalization');
  }
  
  if (puzzle.hint && puzzle.hint.trim().length === 0) {
    errors.push('Puzzle hint cannot be empty');
  }
  
  // Validate createdAt is ISO string
  if (puzzle.createdAt) {
    try {
      const date = new Date(puzzle.createdAt);
      if (isNaN(date.getTime())) {
        errors.push('Field "createdAt" must be a valid ISO date string');
      }
    } catch {
      errors.push('Field "createdAt" must be a valid ISO date string');
    }
  }
  
  // Validate usageCount is non-negative
  if (puzzle.usageCount !== undefined && puzzle.usageCount < 0) {
    errors.push('Field "usageCount" must be non-negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Compare answers with normalization
 * @param {string} playerAnswer - Player's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} True if answers match (after normalization)
 */
export function compareAnswers(playerAnswer, correctAnswer) {
  const normalizedPlayer = normalizeAnswer(playerAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  return normalizedPlayer === normalizedCorrect;
}

// Export for both ES modules and CommonJS
export default {
  normalizeAnswer,
  containsEmoji,
  validateSubmission,
  validatePuzzle,
  compareAnswers,
};
