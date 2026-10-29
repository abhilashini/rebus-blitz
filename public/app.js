/**
 * Emoji Rebus Blitz - Main Application Module
 * Complete game implementation with live game loop
 */

import { GameEngine } from '../lib/game-engine.js';
import { TimerManager } from '../lib/timer-manager.js';
import { validateSubmission, normalizeAnswer } from '../lib/validation.js';

/**
 * Main application class
 */
class EmojiRebusBlitz {
  constructor() {
    this.gameEngine = null;
    this.timerManager = null;
    this.currentPuzzle = null;
    this.isInitialized = false;
    
    // DOM elements
    this.elements = {};
    
    // Game configuration
    this.config = {
      initialTime: 30,
      correctBonus: 100,
      incorrectPenalty: 5,
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('Emoji Rebus Blitz — initializing');
    
    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize game engine
      this.gameEngine = new GameEngine(this.config);
      
      // Set up game engine callbacks
      this.gameEngine.onStateChange = (state) => this.onGameStateChange(state);
      this.gameEngine.onGameOver = (state) => this.onGameOver(state);
      
      // Initialize timer manager
      this.timerManager = new TimerManager(this.config.initialTime, {
        onTick: (remaining) => this.onTimerTick(remaining),
        onComplete: () => this.onTimerComplete(),
        onVisibilityChange: (isActive) => this.onVisibilityChange(isActive),
      });
      
      // Fetch and display initial puzzle
      await this.fetchNewPuzzle();
      
      // Start the game
      this.startGame();
      
      this.isInitialized = true;
      console.log('Emoji Rebus Blitz — ready');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
  }

  /**
   * Cache DOM elements for quick access
   */
  cacheElements() {
    this.elements = {
      // Game panel
      puzzle: document.getElementById('puzzle'),
      hint: document.getElementById('hint'),
      timer: document.getElementById('timer'),
      score: document.getElementById('score'),
      answerForm: document.getElementById('answer-form'),
      answerInput: document.getElementById('answer-input'),
      feedback: document.getElementById('feedback'),
      
      // Submit panel
      submitForm: document.getElementById('submit-form'),
      emojiInput: document.getElementById('emoji-input'),
      answerInputSubmit: document.getElementById('answer-input-submit'),
      hintInput: document.getElementById('hint-input'),
      submitFeedback: document.getElementById('submit-feedback'),
      
      // Game over elements (will be created)
      gameOverScreen: null,
    };
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Answer submission
    if (this.elements.answerForm) {
      this.elements.answerForm.addEventListener('submit', (e) => this.handleAnswerSubmit(e));
    }
    
    // Puzzle submission
    if (this.elements.submitForm) {
      this.elements.submitForm.addEventListener('submit', (e) => this.handlePuzzleSubmit(e));
      
      // Real-time validation for submit form
      const submitInputs = [
        this.elements.emojiInput,
        this.elements.answerInputSubmit,
        this.elements.hintInput,
      ];
      
      submitInputs.forEach(input => {
        if (input) {
          input.addEventListener('input', () => this.validateSubmitForm());
        }
      });
    }
    
    // Answer input focus
    if (this.elements.answerInput) {
      this.elements.answerInput.addEventListener('focus', () => {
        this.clearFeedback();
      });
    }
  }

  /**
   * Start the game
   */
  startGame() {
    if (!this.currentPuzzle) {
      console.error('Cannot start game without a puzzle');
      return;
    }
    
    // Start game engine
    this.gameEngine.startGame(
      this.currentPuzzle,
      (state) => this.onGameStateChange(state),
      (state) => this.onGameOver(state)
    );
    
    // Start timer
    this.timerManager.start();
    
    // Update UI
    this.updatePuzzleDisplay();
    this.updateScoreDisplay(0);
    this.updateTimerDisplay(this.config.initialTime);
    
    console.log('Game started!');
  }

  /**
   * Fetch new puzzle from API
   */
  async fetchNewPuzzle() {
    try {
      this.showLoading('Loading puzzle...');
      
      const response = await fetch('/api/puzzle');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store puzzle data (API only returns emoji and hint)
      this.currentPuzzle = {
        emoji: data.emoji,
        hint: data.hint,
        id: data.id || 'unknown',
        // Note: We don't have the answer from API for security
      };
      
      // Update puzzle display
      this.updatePuzzleDisplay();
      
      // Clear loading
      this.clearFeedback();
      
      return this.currentPuzzle;
      
    } catch (error) {
      console.error('Failed to fetch puzzle:', error);
      
      // Use fallback puzzle
      this.currentPuzzle = {
        emoji: '🌊🏄‍♂️',
        hint: 'Something surfers do (fallback)',
        id: 'fallback',
      };
      
      this.updatePuzzleDisplay();
      this.showError('Failed to load puzzle. Using fallback.');
      
      return this.currentPuzzle;
    }
  }

  /**
   * Handle answer submission
   */
  async handleAnswerSubmit(event) {
    event.preventDefault();
    
    if (!this.elements.answerInput) {
      return;
    }
    
    const answer = this.elements.answerInput.value.trim();
    
    if (!answer) {
      this.showFeedback('Please enter an answer', 'error');
      return;
    }
    
    // Process answer through game engine
    const result = this.gameEngine.processAnswer(answer);
    
    // Show feedback
    if (result.isCorrect) {
      this.showFeedback(result.message, 'success');
      
      // Clear input
      this.elements.answerInput.value = '';
      
      // Fetch new puzzle for next round
      setTimeout(() => {
        this.fetchNewPuzzle().then(() => {
          // Update game engine with new puzzle
          this.gameEngine.updatePuzzle(this.currentPuzzle);
        });
      }, 1000);
      
    } else {
      this.showFeedback(result.message, 'error');
      
      // Keep answer in input for correction
      this.elements.answerInput.select();
    }
  }

  /**
   * Handle puzzle submission
   */
  async handlePuzzleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateSubmitForm()) {
      return;
    }
    
    const emoji = this.elements.emojiInput.value.trim();
    const answer = this.elements.answerInputSubmit.value.trim();
    const hint = this.elements.hintInput.value.trim();
    
    try {
      this.showSubmitFeedback('Submitting puzzle...', 'info');
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji, answer, hint }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      
      // Success
      this.showSubmitFeedback(
        `Puzzle submitted! Normalized answer: "${data.normalizedAnswer}"`,
        'success'
      );
      
      // Reset form
      this.elements.emojiInput.value = '';
      this.elements.answerInputSubmit.value = '';
      this.elements.hintInput.value = '';
      
      // Re-enable submit button
      const submitButton = this.elements.submitForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Puzzle';
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      this.showSubmitFeedback(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Validate submit form in real-time
   */
  validateSubmitForm() {
    const emoji = this.elements.emojiInput?.value.trim() || '';
    const answer = this.elements.answerInputSubmit?.value.trim() || '';
    const hint = this.elements.hintInput?.value.trim() || '';
    
    const validation = validateSubmission({ emoji, answer, hint });
    
    const submitButton = this.elements.submitForm?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = !validation.isValid;
      
      if (validation.isValid) {
        submitButton.title = 'Submit your puzzle';
      } else {
        submitButton.title = validation.errors.join(', ');
      }
    }
    
    return validation.isValid;
  }

  /**
   * Handle game state changes
   */
  onGameStateChange(state) {
    this.updateScoreDisplay(state.score);
    this.updateTimerDisplay(state.timeRemaining);
    
    // Update puzzle if it changed
    if (state.currentPuzzle && state.currentPuzzle !== this.currentPuzzle) {
      this.currentPuzzle = state.currentPuzzle;
      this.updatePuzzleDisplay();
    }
  }

  /**
   * Handle timer tick
   */
  onTimerTick(remainingSeconds) {
    this.updateTimerDisplay(remainingSeconds);
    
    // Update game engine's time remaining
    const state = this.gameEngine.getState();
    if (state.timeRemaining !== remainingSeconds && !state.isGameOver) {
      this.gameEngine.state.timeRemaining = remainingSeconds;
    }
  }

  /**
   * Handle timer completion
   */
  onTimerComplete() {
    console.log('Timer completed');
    this.gameEngine.triggerGameOver();
  }

  /**
   * Handle game over
   */
  onGameOver(state) {
    console.log('Game over! Final score:', state.score);
    
    this.timerManager.stop();
    this.showGameOverScreen(state);
  }

  /**
   * Handle browser visibility changes
   */
  onVisibilityChange(isActive) {
    if (isActive) {
      console.log('Tab became active, resuming game...');
      // Timer manager automatically adjusts for inactive time
    } else {
      console.log('Tab became inactive, pausing game...');
    }
  }

  /**
   * Update puzzle display
   */
  updatePuzzleDisplay() {
    if (this.elements.puzzle && this.currentPuzzle) {
      this.elements.puzzle.textContent = this.currentPuzzle.emoji;
    }
    
    if (this.elements.hint && this.currentPuzzle) {
      this.elements.hint.textContent = this.currentPuzzle.hint;
    }
  }

  /**
   * Update score display
   */
  updateScoreDisplay(score) {
    if (this.elements.score) {
      this.elements.score.textContent = score;
      
      // Add animation for score changes
      this.elements.score.classList.add('score-update');
      setTimeout(() => {
        this.elements.score.classList.remove('score-update');
      }, 300);
    }
  }

  /**
   * Update timer display
   */
  updateTimerDisplay(seconds) {
    if (this.elements.timer) {
      this.elements.timer.textContent = seconds;
      
      // Visual feedback for low time
      if (seconds <= 10) {
        this.elements.timer.classList.add('time-low');
      } else {
        this.elements.timer.classList.remove('time-low');
      }
      
      // Visual feedback for time penalty
      if (seconds < this.config.initialTime) {
        this.elements.timer.classList.add('time-penalty');
        setTimeout(() => {
          this.elements.timer.classList.remove('time-penalty');
        }, 500);
      }
    }
  }

  /**
   * Show feedback message
   */
  showFeedback(message, type = 'info') {
    if (this.elements.feedback) {
      this.elements.feedback.textContent = message;
      this.elements.feedback.className = `feedback feedback-${type}`;
      
      // Auto-clear after 3 seconds for success messages
      if (type === 'success') {
        setTimeout(() => {
          this.clearFeedback();
        }, 3000);
      }
    }
  }

  /**
   * Clear feedback message
   */
  clearFeedback() {
    if (this.elements.feedback) {
      this.elements.feedback.textContent = '';
      this.elements.feedback.className = 'feedback';
    }
  }

  /**
   * Show submit feedback
   */
  showSubmitFeedback(message, type = 'info') {
    if (this.elements.submitFeedback) {
      this.elements.submitFeedback.textContent = message;
      this.elements.submitFeedback.className = `feedback feedback-${type}`;
    }
  }

  /**
   * Show loading message
   */
  showLoading(message) {
    this.showFeedback(message, 'loading');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showFeedback(message, 'error');
  }

  /**
   * Show game over screen
   */
  showGameOverScreen(state) {
    // Create game over screen if it doesn't exist
    if (!this.elements.gameOverScreen) {
      this.createGameOverScreen();
    }
    
    // Update game over screen with final score
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) {
      finalScoreEl.textContent = state.score;
    }
    
    const puzzlesSolvedEl = document.getElementById('puzzles-solved');
    if (puzzlesSolvedEl) {
      puzzlesSolvedEl.textContent = state.puzzlesSolved;
    }
    
    // Show game over screen
    this.elements.gameOverScreen.style.display = 'block';
    
    // Disable answer input
    if (this.elements.answerInput) {
      this.elements.answerInput.disabled = true;
    }
  }

  /**
   * Create game over screen
   */
  createGameOverScreen() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over-screen';
    gameOverScreen.className = 'game-over-screen';
    gameOverScreen.style.display = 'none';
    
    gameOverScreen.innerHTML = `
      <div class="game-over-content">
        <h2>⏰ Game Over! ⏰</h2>
        <div class="game-over-stats">
          <div class="stat">
            <span class="stat-label">Final Score:</span>
            <span id="final-score" class="stat-value">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Puzzles Solved:</span>
            <span id="puzzles-solved" class="stat-value">0</span>
          </div>
        </div>
        <button id="restart-button" class="restart-button">Play Again</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(gameOverScreen);
    this.elements.gameOverScreen = gameOverScreen;
    
    // Add restart button event listener
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
      restartButton.addEventListener('click', () => this.restartGame());
    }
  }

  /**
   * Restart the game
   */
  async restartGame() {
    // Hide game over screen
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.style.display = 'none';
    }
    
    // Re-enable answer input
    if (this.elements.answerInput) {
      this.elements.answerInput.disabled = false;
    }
    
    // Reset game engine
    this.gameEngine.resetGame();
    
    // Fetch new puzzle
    await this.fetchNewPuzzle();
    
    // Start new game
    this.startGame();
    
    console.log('Game restarted!');
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.gameEngine) {
      this.gameEngine.destroy();
    }
    
    if (this.timerManager) {
      this.timerManager.destroy();
    }
    
    // Remove game over screen
    if (this.elements.gameOverScreen && this.elements.gameOverScreen.parentNode) {
      this.elements.gameOverScreen.parentNode.removeChild(this.elements.gameOverScreen);
    }
    
    console.log('Game destroyed');
  }
}

// Initialize the game when module loads
const game = new EmojiRebusBlitz();

// Export for testing/debugging
window.EmojiRebusBlitz = EmojiRebusBlitz;
window.game = game;

// Start the game
game.init().catch(error => {
  console.error('Failed to start game:', error);
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #ff6b6b;">
      <h2>Failed to load game</h2>
      <p>${error.message}</p>
      <button onclick="location.reload()">Reload Page</button>
    </div>
  `;
});
