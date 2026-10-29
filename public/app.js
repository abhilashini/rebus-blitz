/**
 * Emoji Rebus Blitz - Main Application Module
 */

/**
 * Initialize the application
 */
export function init() {
    console.log('Emoji Rebus Blitz — ready');
    
    // Set up form event listeners
    const answerForm = document.getElementById('answer-form');
    const submitForm = document.getElementById('submit-form');
    
    if (answerForm) {
        answerForm.addEventListener('submit', handleAnswerSubmit);
    }
    
    if (submitForm) {
        submitForm.addEventListener('submit', handlePuzzleSubmit);
    }
    
    // Initialize game state
    console.log('Game initialized');
}

/**
 * Handle answer submission from game panel
 * @param {Event} event - Form submission event
 */
async function handleAnswerSubmit(event) {
    event.preventDefault();
    
    const answerInput = document.getElementById('answer-input');
    const feedback = document.getElementById('feedback');
    
    if (!answerInput || !feedback) return;
    
    const answer = answerInput.value.trim();
    
    if (!answer) {
        feedback.textContent = 'Please enter an answer';
        feedback.style.color = 'var(--color-accent)';
        return;
    }
    
    // TODO: Implement actual answer validation with API
    feedback.textContent = `Submitted: "${answer}" (API integration pending)`;
    feedback.style.color = 'var(--color-primary)';
    
    // Clear input
    answerInput.value = '';
}

/**
 * Handle puzzle submission from crowdsourcing panel
 * @param {Event} event - Form submission event
 */
async function handlePuzzleSubmit(event) {
    event.preventDefault();
    
    const emojiInput = document.getElementById('emoji-input');
    const answerInput = document.getElementById('answer-input-submit');
    const hintInput = document.getElementById('hint-input');
    const feedback = document.getElementById('submit-feedback');
    
    if (!emojiInput || !answerInput || !hintInput || !feedback) return;
    
    const emoji = emojiInput.value.trim();
    const answer = answerInput.value.trim();
    const hint = hintInput.value.trim();
    
    // Basic validation
    if (!emoji || !answer || !hint) {
        feedback.textContent = 'All fields are required';
        feedback.style.color = 'var(--color-accent)';
        return;
    }
    
    // TODO: Implement actual API submission
    feedback.textContent = `Puzzle submitted! (API integration pending)`;
    feedback.style.color = 'var(--color-primary)';
    
    // Clear form
    emojiInput.value = '';
    answerInput.value = '';
    hintInput.value = '';
}

// Initialize the application when module loads
init();
