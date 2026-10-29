/**
 * Game Engine
 * Manages game state, timer, score, and user interactions
 */

import { compareAnswers } from './validation.js';

/**
 * Game configuration
 * @typedef {Object} GameConfig
 * @property {number} initialTime - Initial timer seconds (default: 30)
 * @property {number} correctBonus - Points for correct answer (default: 100)
 * @property {number} incorrectPenalty - Time penalty for incorrect (default: 5)
 */

/**
 * Game state
 * @typedef {Object} GameState
 * @property {number} score - Current score
 * @property {number} timeRemaining - Seconds remaining
 * @property {Object} currentPuzzle - Current puzzle
 * @property {boolean} isGameOver - Game over flag
 * @property {number} puzzlesSolved - Count of solved puzzles
 * @property {number} incorrectAttempts - Count of incorrect attempts
 * @property {Date} sessionStart - Session start time
 * @property {Date} lastActivity - Last activity timestamp
 */

/**
 * Answer processing result
 * @typedef {Object} AnswerResult
 * @property {boolean} isCorrect - Whether answer was correct
 * @property {number} scoreChange - Points added (positive) or time penalty (negative seconds)
 * @property {string} normalizedAnswer - Normalized version of player's answer
 * @property {string} message - Feedback message
 */

/**
 * Game Engine class
 */
export class GameEngine {
  /**
   * Initialize game engine with configuration
   * @param {GameConfig} config - Game configuration
   */
  constructor(config = {}) {
    this.config = {
      initialTime: config.initialTime || 30,
      correctBonus: config.correctBonus || 100,
      incorrectPenalty: config.incorrectPenalty || 5,
    };
    
    this.state = this.createInitialState();
    this.timer = null;
    this.onStateChange = null;
    this.onGameOver = null;
  }

  /**
   * Create initial game state
   * @returns {GameState} Initial game state
   */
  createInitialState() {
    return {
      score: 0,
      timeRemaining: this.config.initialTime,
      currentPuzzle: null,
      isGameOver: false,
      puzzlesSolved: 0,
      incorrectAttempts: 0,
      sessionStart: new Date(),
      lastActivity: new Date(),
    };
  }

  /**
   * Start a new game session
   * @param {Object} initialPuzzle - First puzzle to display
   * @param {Function} onStateChange - Callback when state changes
   * @param {Function} onGameOver - Callback when game over
   */
  startGame(initialPuzzle, onStateChange = null, onGameOver = null) {
    // Reset state
    this.state = this.createInitialState();
    this.state.currentPuzzle = initialPuzzle;
    
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    
    // Start timer
    this.startTimer();
    
    this.notifyStateChange();
    
    console.log('Game started with puzzle:', initialPuzzle.emoji);
  }

  /**
   * Process player's answer
   * @param {string} playerAnswer - Player's input answer
   * @returns {AnswerResult} Result of answer processing
   */
  processAnswer(playerAnswer) {
    if (this.state.isGameOver) {
      return {
        isCorrect: false,
        scoreChange: 0,
        normalizedAnswer: '',
        message: 'Game over! Please restart to play again.',
      };
    }
    
    if (!this.state.currentPuzzle) {
      return {
        isCorrect: false,
        scoreChange: 0,
        normalizedAnswer: '',
        message: 'No puzzle loaded. Please wait or refresh.',
      };
    }
    
    // Update activity timestamp
    this.state.lastActivity = new Date();
    
    // Compare answers
    const isCorrect = compareAnswers(playerAnswer, this.state.currentPuzzle.answer);
    
    if (isCorrect) {
      // Correct answer: add points and reset timer
      this.state.score += this.config.correctBonus;
      this.state.timeRemaining = this.config.initialTime;
      this.state.puzzlesSolved++;
      
      const result = {
        isCorrect: true,
        scoreChange: this.config.correctBonus,
        normalizedAnswer: playerAnswer,
        message: `Correct! +${this.config.correctBonus} points`,
      };
      
      this.notifyStateChange();
      return result;
      
    } else {
      // Incorrect answer: deduct time
      const timePenalty = Math.min(this.state.timeRemaining, this.config.incorrectPenalty);
      this.state.timeRemaining -= timePenalty;
      this.state.incorrectAttempts++;
      
      const result = {
        isCorrect: false,
        scoreChange: -timePenalty, // Negative indicates seconds deducted
        normalizedAnswer: playerAnswer,
        message: `Incorrect! -${timePenalty} seconds`,
      };
      
      // Check if game over after penalty
      if (this.state.timeRemaining <= 0) {
        this.triggerGameOver();
      }
      
      this.notifyStateChange();
      return result;
    }
  }

  /**
   * Fetch next puzzle (placeholder - should be implemented by caller)
   * @returns {Promise<Object>} Next puzzle
   */
  async fetchNextPuzzle() {
    // This should be implemented by the frontend using API call
    throw new Error('fetchNextPuzzle should be implemented by the frontend');
  }

  /**
   * Get current game state
   * @returns {GameState} Current game state
   */
  getState() {
    return { ...this.state }; // Return copy to prevent mutation
  }

  /**
   * Update game state with new puzzle
   * @param {Object} puzzle - New puzzle
   */
  updatePuzzle(puzzle) {
    if (this.state.isGameOver) {
      return;
    }
    
    this.state.currentPuzzle = puzzle;
    this.notifyStateChange();
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.stopTimer();
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  /**
   * Start internal timer
   */
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  /**
   * Stop internal timer
   */
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Update timer (called every second)
   */
  updateTimer() {
    if (this.state.isGameOver) {
      return;
    }
    
    this.state.timeRemaining--;
    this.state.lastActivity = new Date();
    
    if (this.state.timeRemaining <= 0) {
      this.state.timeRemaining = 0;
      this.triggerGameOver();
    }
    
    this.notifyStateChange();
  }

  /**
   * Trigger game over
   */
  triggerGameOver() {
    if (this.state.isGameOver) {
      return;
    }
    
    this.state.isGameOver = true;
    this.stopTimer();
    
    console.log(`Game over! Final score: ${this.state.score}`);
    
    if (this.onGameOver) {
      this.onGameOver(this.state);
    }
    
    this.notifyStateChange();
  }

  /**
   * Add time to timer (positive or negative)
   * @param {number} seconds - Seconds to add
   */
  addTime(seconds) {
    if (this.state.isGameOver) {
      return;
    }
    
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining + seconds);
    this.notifyStateChange();
  }

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getStats() {
    const now = new Date();
    const duration = Math.floor((now - this.state.sessionStart) / 1000);
    
    return {
      score: this.state.score,
      puzzlesSolved: this.state.puzzlesSolved,
      incorrectAttempts: this.state.incorrectAttempts,
      durationSeconds: duration,
      accuracy: this.state.puzzlesSolved + this.state.incorrectAttempts > 0 
        ? (this.state.puzzlesSolved / (this.state.puzzlesSolved + this.state.incorrectAttempts)) * 100
        : 0,
      pointsPerMinute: duration > 0 
        ? (this.state.score / duration) * 60 
        : 0,
    };
  }

  /**
   * Notify state change to callback
   */
  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopTimer();
    this.onStateChange = null;
    this.onGameOver = null;
  }
}

// Export singleton instance (optional)
export const gameEngine = new GameEngine();
