/**
 * Frontend Validation Module
 * Client-side validation for better UX
 */

/**
 * Normalize answer string (client-side version)
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
 * Client-side version with fallback for older browsers
 */
export function containsEmoji(text) {
  if (typeof text !== 'string') {
    return false;
  }
  
  try {
    // Modern browsers support Unicode property escapes
    const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
    return emojiRegex.test(text);
  } catch {
    // Fallback for browsers without Unicode property support
    // Basic emoji detection using common emoji ranges
    const fallbackRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;
    return fallbackRegex.test(text);
  }
}

/**
 * Validate submission data (client-side)
 */
export function validateSubmission(data) {
  const errors = [];
  const warnings = [];
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
  
  // Warnings for potentially problematic content
  if (data.answer && data.answer.length > 100) {
    warnings.push('Answer is quite long - consider making it shorter');
  }
  
  if (data.hint && data.hint.length > 200) {
    warnings.push('Hint is quite long - consider making it more concise');
  }
  
  // Sanitize inputs (basic XSS prevention)
  const sanitize = (str) => str.replace(/[<>]/g, '');
  
  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
      warnings,
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
    warnings,
    normalizedData: null,
  };
}

/**
 * Real-time form validation helper
 */
export class FormValidator {
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.options = {
      showErrors: true,
      showWarnings: true,
      validateOnInput: true,
      ...options,
    };
    
    this.fields = {};
    this.init();
  }
  
  init() {
    // Find all input fields with data-validation attribute
    const inputs = this.form.querySelectorAll('[data-validation]');
    
    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      const validationType = input.dataset.validation;
      
      this.fields[fieldName] = {
        element: input,
        type: validationType,
        errorElement: this.createErrorElement(input),
        warningElement: this.createWarningElement(input),
      };
      
      // Add event listeners for real-time validation
      if (this.options.validateOnInput) {
        input.addEventListener('input', () => this.validateField(fieldName));
        input.addEventListener('blur', () => this.validateField(fieldName));
      }
    });
    
    // Add form submit validation
    this.form.addEventListener('submit', (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
      }
    });
  }
  
  createErrorElement(input) {
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.style.display = 'none';
    errorEl.style.color = '#f44336';
    errorEl.style.fontSize = '0.875rem';
    errorEl.style.marginTop = '0.25rem';
    
    input.parentNode.insertBefore(errorEl, input.nextSibling);
    return errorEl;
  }
  
  createWarningElement(input) {
    const warningEl = document.createElement('div');
    warningEl.className = 'field-warning';
    warningEl.style.display = 'none';
    warningEl.style.color = '#ff9800';
    warningEl.style.fontSize = '0.875rem';
    warningEl.style.marginTop = '0.25rem';
    
    input.parentNode.insertBefore(warningEl, input.nextSibling);
    return warningEl;
  }
  
  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return true;
    
    const value = field.element.value.trim();
    let isValid = true;
    let error = '';
    let warning = '';
    
    switch (field.type) {
      case 'emoji':
        if (!value) {
          isValid = false;
          error = 'Emoji is required';
        } else if (!containsEmoji(value)) {
          isValid = false;
          error = 'Must contain at least one emoji';
        }
        break;
        
      case 'answer':
        if (!value) {
          isValid = false;
          error = 'Answer is required';
        } else {
          const normalized = normalizeAnswer(value);
          if (normalized.length < 1) {
            isValid = false;
            error = 'Answer must contain valid characters';
          } else if (normalized.length > 50) {
            warning = 'Answer is getting long';
          }
        }
        break;
        
      case 'hint':
        if (!value) {
          isValid = false;
          error = 'Hint is required';
        } else if (value.length > 100) {
          warning = 'Hint is getting long';
        }
        break;
        
      case 'required':
        if (!value) {
          isValid = false;
          error = 'This field is required';
        }
        break;
    }
    
    // Update UI
    this.updateFieldUI(field, isValid, error, warning);
    
    return isValid;
  }
  
  updateFieldUI(field, isValid, error, warning) {
    // Update input styling
    field.element.classList.remove('valid', 'invalid');
    
    if (isValid) {
      field.element.classList.add('valid');
    } else {
      field.element.classList.add('invalid');
    }
    
    // Show/hide error message
    if (field.errorElement) {
      if (error && this.options.showErrors) {
        field.errorElement.textContent = error;
        field.errorElement.style.display = 'block';
      } else {
        field.errorElement.style.display = 'none';
      }
    }
    
    // Show/hide warning message
    if (field.warningElement && this.options.showWarnings) {
      if (warning) {
        field.warningElement.textContent = warning;
        field.warningElement.style.display = 'block';
      } else {
        field.warningElement.style.display = 'none';
      }
    }
  }
  
  validateForm() {
    let isValid = true;
    
    Object.keys(this.fields).forEach(fieldName => {
      const fieldIsValid = this.validateField(fieldName);
      if (!fieldIsValid) {
        isValid = false;
      }
    });
    
    // Update submit button state
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = !isValid;
    }
    
    return isValid;
  }
  
  getFormData() {
    const data = {};
    
    Object.keys(this.fields).forEach(fieldName => {
      data[fieldName] = this.fields[fieldName].element.value.trim();
    });
    
    return data;
  }
  
  reset() {
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      field.element.value = '';
      field.element.classList.remove('valid', 'invalid');
      
      if (field.errorElement) {
        field.errorElement.style.display = 'none';
      }
      
      if (field.warningElement) {
        field.warningElement.style.display = 'none';
      }
    });
    
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }
  }
}

/**
 * Initialize form validation for all forms on page
 */
export function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    new FormValidator(form, {
      showErrors: true,
      showWarnings: true,
      validateOnInput: true,
    });
  });
  
  console.log(`Form validation initialized for ${forms.length} forms`);
}

// Auto-initialize if imported directly in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFormValidation);
}
