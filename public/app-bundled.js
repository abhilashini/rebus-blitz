/**
 * Emoji Rebus Blitz - Bundled Frontend Version
 * Includes all game logic for standalone testing
 */

// Game configuration
const CONFIG = {
  initialTime: 30,
  correctBonus: 100,
  incorrectPenalty: 5,
};

// Utility functions
function normalizeAnswer(answer) {
  if (typeof answer !== 'string') return '';
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function compareAnswers(playerAnswer, correctAnswer) {
  return normalizeAnswer(playerAnswer) === normalizeAnswer(correctAnswer);
}

// Simple Timer Manager
class TimerManager {
  constructor(durationSeconds, callbacks = {}) {
    this.durationSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.startTime = null;
    this.isRunning = false;
    this.timerId = null;
    this.onTick = callbacks.onTick || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.tick();
  }

  tick() {
    if (!this.isRunning) return;
    
    const elapsed = (Date.now() - this.startTime) / 1000;
    const remaining = Math.max(0, this.durationSeconds - elapsed);
    const remainingInt = Math.floor(remaining);
    
    if (remainingInt !== this.remainingSeconds) {
      this.remainingSeconds = remainingInt;
      this.onTick(this.remainingSeconds);
    }
    
    if (remaining <= 0) {
      this.complete();
      return;
    }
    
    this.timerId = setTimeout(() => this.tick(), 100);
  }

  complete() {
    this.isRunning = false;
    this.remainingSeconds = 0;
    if (this.timerId) clearTimeout(this.timerId);
    this.onTick(0);
    this.onComplete();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

  reset() {
    this.stop();
    this.remainingSeconds = this.durationSeconds;
    this.onTick(this.remainingSeconds);
  }

  addTime(seconds) {
    const newTime = this.remainingSeconds + seconds;
    this.remainingSeconds = Math.max(0, newTime);
    this.onTick(this.remainingSeconds);
    
    if (this.remainingSeconds <= 0 && this.isRunning) {
      this.complete();
    }
  }
}

// Simple Game Engine
class GameEngine {
  constructor(config = CONFIG) {
    this.config = config;
    this.state = this.createInitialState();
  }

  createInitialState() {
    return {
      score: 0,
      timeRemaining: this.config.initialTime,
      currentPuzzle: null,
      isGameOver: false,
      puzzlesSolved: 0,
      incorrectAttempts: 0,
    };
  }

  startGame(initialPuzzle, onStateChange = null, onGameOver = null) {
    this.state = this.createInitialState();
    this.state.currentPuzzle = initialPuzzle;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.notifyStateChange();
  }

  processAnswer(playerAnswer) {
    if (this.state.isGameOver) {
      return { isCorrect: false, scoreChange: 0, message: 'Game over!' };
    }

    if (!this.state.currentPuzzle) {
      return { isCorrect: false, scoreChange: 0, message: 'No puzzle loaded' };
    }

    const isCorrect = compareAnswers(playerAnswer, this.state.currentPuzzle.answer);
    
    if (isCorrect) {
      this.state.score += this.config.correctBonus;
      this.state.timeRemaining = this.config.initialTime;
      this.state.puzzlesSolved++;
      
      const result = {
        isCorrect: true,
        scoreChange: this.config.correctBonus,
        message: `Correct! +${this.config.correctBonus} points`,
      };
      
      this.notifyStateChange();
      return result;
      
    } else {
      const timePenalty = Math.min(this.state.timeRemaining, this.config.incorrectPenalty);
      this.state.timeRemaining -= timePenalty;
      this.state.incorrectAttempts++;
      
      const result = {
        isCorrect: false,
        scoreChange: -timePenalty,
        message: `Incorrect! -${timePenalty} seconds`,
      };
      
      if (this.state.timeRemaining <= 0) {
        this.triggerGameOver();
      }
      
      this.notifyStateChange();
      return result;
    }
  }

  triggerGameOver() {
    if (this.state.isGameOver) return;
    this.state.isGameOver = true;
    if (this.onGameOver) this.onGameOver(this.state);
    this.notifyStateChange();
  }

  updateTimer() {
    if (this.state.isGameOver) return;
    this.state.timeRemaining--;
    if (this.state.timeRemaining <= 0) {
      this.state.timeRemaining = 0;
      this.triggerGameOver();
    }
    this.notifyStateChange();
  }

  updatePuzzle(puzzle) {
    this.state.currentPuzzle = puzzle;
    this.notifyStateChange();
  }

  resetGame() {
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  getState() {
    return { ...this.state };
  }

  notifyStateChange() {
    if (this.onStateChange) this.onStateChange(this.getState());
  }
}

// Main Application
class EmojiRebusBlitz {
  constructor() {
    this.gameEngine = null;
    this.timerManager = null;
    this.currentPuzzle = null;
    this.elements = {};
  }

  async init() {
    console.log('Emoji Rebus Blitz — initializing (bundled version)');
    
    try {
      this.cacheElements();
      this.setupEventListeners();
      
      this.gameEngine = new GameEngine();
      this.gameEngine.onStateChange = (state) => this.onGameStateChange(state);
      this.gameEngine.onGameOver = (state) => this.onGameOver(state);
      
      this.timerManager = new TimerManager(CONFIG.initialTime, {
        onTick: (remaining) => this.onTimerTick(remaining),
        onComplete: () => this.onTimerComplete(),
      });
      
      // Use fallback puzzles for standalone version
      this.currentPuzzle = this.getFallbackPuzzle();
      this.startGame();
      
      console.log('Emoji Rebus Blitz — ready (standalone mode)');
      
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showError('Failed to initialize game');
    }
  }

  cacheElements() {
    this.elements = {
      puzzle: document.getElementById('puzzle'),
      hint: document.getElementById('hint'),
      timer: document.getElementById('timer'),
      score: document.getElementById('score'),
      answerForm: document.getElementById('answer-form'),
      answerInput: document.getElementById('answer-input'),
      feedback: document.getElementById('feedback'),
      submitForm: document.getElementById('submit-form'),
      submitFeedback: document.getElementById('submit-feedback'),
      gameOverScreen: null,
    };
  }

  setupEventListeners() {
    if (this.elements.answerForm) {
      this.elements.answerForm.addEventListener('submit', (e) => this.handleAnswerSubmit(e));
    }
    
    if (this.elements.submitForm) {
      this.elements.submitForm.addEventListener('submit', (e) => this.handlePuzzleSubmit(e));
    }
  }

  startGame() {
    this.gameEngine.startGame(
      this.currentPuzzle,
      (state) => this.onGameStateChange(state),
      (state) => this.onGameOver(state)
    );
    
    this.timerManager.start();
    this.updatePuzzleDisplay();
    this.updateScoreDisplay(0);
    this.updateTimerDisplay(CONFIG.initialTime);
  }

  handleAnswerSubmit(event) {
    event.preventDefault();
    const answer = this.elements.answerInput.value.trim();
    
    if (!answer) {
      this.showFeedback('Please enter an answer', 'error');
      return;
    }
    
    const result = this.gameEngine.processAnswer(answer);
    
    if (result.isCorrect) {
      this.showFeedback(result.message, 'success');
      this.elements.answerInput.value = '';
      
      // Get next puzzle after delay
      setTimeout(() => {
        this.currentPuzzle = this.getRandomFallbackPuzzle();
        this.gameEngine.updatePuzzle(this.currentPuzzle);
        this.updatePuzzleDisplay();
      }, 1000);
      
    } else {
      this.showFeedback(result.message, 'error');
      this.elements.answerInput.select();
    }
  }

  handlePuzzleSubmit(event) {
    event.preventDefault();
    this.showSubmitFeedback('Puzzle submission disabled in standalone mode', 'warning');
  }

  onGameStateChange(state) {
    this.updateScoreDisplay(state.score);
    this.updateTimerDisplay(state.timeRemaining);
  }

  onTimerTick(remaining) {
    this.updateTimerDisplay(remaining);
    
    // Sync with game engine
    const state = this.gameEngine.getState();
    if (state.timeRemaining !== remaining && !state.isGameOver) {
      this.gameEngine.state.timeRemaining = remaining;
    }
  }

  onTimerComplete() {
    this.gameEngine.triggerGameOver();
  }

  onGameOver(state) {
    this.timerManager.stop();
    this.showGameOverScreen(state);
  }

  updatePuzzleDisplay() {
    if (this.elements.puzzle && this.currentPuzzle) {
      this.elements.puzzle.textContent = this.currentPuzzle.emoji;
    }
    if (this.elements.hint && this.currentPuzzle) {
      this.elements.hint.textContent = this.currentPuzzle.hint;
    }
  }

  updateScoreDisplay(score) {
    if (this.elements.score) {
      this.elements.score.textContent = score;
      this.elements.score.classList.add('score-update');
      setTimeout(() => this.elements.score.classList.remove('score-update'), 300);
    }
  }

  updateTimerDisplay(seconds) {
    if (this.elements.timer) {
      this.elements.timer.textContent = seconds;
      
      if (seconds <= 10) {
        this.elements.timer.classList.add('time-low');
      } else {
        this.elements.timer.classList.remove('time-low');
      }
      
      if (seconds < CONFIG.initialTime) {
        this.elements.timer.classList.add('time-penalty');
        setTimeout(() => this.elements.timer.classList.remove('time-penalty'), 500);
      }
    }
  }

  getFallbackPuzzle() {
    return {
      emoji: '🌊🏄‍♂️',
      answer: 'surfing',
      hint: 'Something surfers do',
      id: 'fallback-1',
    };
  }

  getRandomFallbackPuzzle() {
    const puzzles = [
      { emoji: '🌊🏄‍♂️', answer: 'surfing', hint: 'Something surfers do' },
      { emoji: '🐝📄', answer: 'beeline', hint: 'Direct route like a bee to honey' },
      { emoji: '👁️💭', answer: 'idea', hint: 'A thought or concept' },
      { emoji: '🕷️🦸‍♂️', answer: 'spiderman', hint: 'Web-slinging superhero' },
      { emoji: '🧠💥', answer: 'brainstorm', hint: 'Creative thinking session' },
    ];
    
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  showFeedback(message, type = 'info') {
    if (this.elements.feedback) {
      this.elements.feedback.textContent = message;
      this.elements.feedback.className = `feedback feedback-${type}`;
      if (type === 'success') {
        setTimeout(() => this.clearFeedback(), 3000);
      }
    }
  }

  showSubmitFeedback(message, type = 'info') {
    if (this.elements.submitFeedback) {
      this.elements.submitFeedback.textContent = message;
      this.elements.submitFeedback.className = `feedback feedback-${type}`;
    }
  }

  showError(message) {
    this.showFeedback(message, 'error');
  }

  clearFeedback() {
    if (this.elements.feedback) {
      this.elements.feedback.textContent = '';
      this.elements.feedback.className = 'feedback';
    }
  }

  showGameOverScreen(state) {
    if (!this.elements.gameOverScreen) {
      this.createGameOverScreen();
    }
    
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.textContent = state.score;
    
    const puzzlesSolvedEl = document.getElementById('puzzles-solved');
    if (puzzlesSolvedEl) puzzlesSolvedEl.textContent = state.puzzlesSolved;
    
    this.elements.gameOverScreen.style.display = 'block';
    if (this.elements.answerInput) this.elements.answerInput.disabled = true;
  }

  createGameOverScreen() {
    const screen = document.createElement('div');
    screen.id = 'game-over-screen';
    screen.className = 'game-over-screen';
    screen.style.display = 'none';
    
    screen.innerHTML = `
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
    
    document.body.appendChild(screen);
    this.elements.gameOverScreen = screen;
    
    document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
  }

  restartGame() {
    if (this.elements.gameOverScreen) {
      this.elements.gameOverScreen.style.display = 'none';
    }
    
    if (this.elements.answerInput) {
      this.elements.answerInput.disabled = false;
    }
    
    this.gameEngine.resetGame();
    this.currentPuzzle = this.getRandomFallbackPuzzle();
    this.startGame();
  }
}

// Initialize when page loads
const game = new EmojiRebusBlitz();
window.addEventListener('DOMContentLoaded', () => game.init());
