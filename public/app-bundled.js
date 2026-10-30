/**
 * Rebus Blitz - Core Game Engine
 * Clean, cardless canvas layout, alias-aware answer matching,
 * deck completion victory condition, and transparent post-game review.
 */

// SVG Icon Helpers
const ICONS = {
  sun: `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  clock: `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  trophy: `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  star: `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};

// Curated Master Puzzle Deck with Generous Aliases
const DEFAULT_PUZZLES = [
  { id: 'p1', emoji: '🌊🏄‍♂️', answer: 'surfing', aliases: ['surf', 'surfer'], hint: 'Riding ocean waves on a board' },
  { id: 'p2', emoji: '🐝📄', answer: 'beeline', aliases: ['bee line'], hint: 'The most direct and shortest route' },
  { id: 'p3', emoji: '👁️💭', answer: 'idea', aliases: ['thought', 'concept'], hint: 'A sudden spark of inspiration' },
  { id: 'p4', emoji: '🕷️🦸‍♂️', answer: 'spiderman', aliases: ['spider man', 'spider-man'], hint: 'Friendly neighborhood wall-crawler' },
  { id: 'p5', emoji: '🧠💥', answer: 'brainstorm', aliases: ['brain storm'], hint: 'Group creativity session generating ideas' },
  { id: 'p6', emoji: '⌚🐕', answer: 'watchdog', aliases: ['watch dog'], hint: 'Canine guardian or oversight agency' },
  { id: 'p7', emoji: '🌧️🐱🐶', answer: 'raining cats and dogs', aliases: ['cats and dogs', 'rain cats and dogs'], hint: 'Very heavy torrential rainfall' },
  { id: 'p8', emoji: '🐝🍯', answer: 'honey', aliases: ['honeybee', 'honey bee'], hint: 'Golden sweet substance made by bees' },
  { id: 'p9', emoji: '🔥📦', answer: 'hotbox', aliases: ['hot box'], hint: 'Enclosed space that becomes very warm' },
  { id: 'p10', emoji: '👻👻', answer: 'double trouble', aliases: ['twin trouble'], hint: 'Twice the mischief and difficulty' },
  { id: 'p11', emoji: '🍎📱', answer: 'iphone', aliases: ['apple phone', 'i phone', 'smartphone'], hint: 'Apple\'s flagship touchscreen smartphone' },
  { id: 'p12', emoji: '👑❤️', answer: 'heart of gold', aliases: ['queen of hearts', 'king of hearts'], hint: 'Someone genuinely kind and altruistic' },
  { id: 'p13', emoji: '🧊🔥', answer: 'fire and ice', aliases: ['ice and fire', 'ice fire', 'fire ice'], hint: 'Two contradictory natural elements' },
  { id: 'p14', emoji: '🐱🎻', answer: 'cat got your tongue', aliases: ['cat got tongue', 'cat has your tongue'], hint: 'Completely speechless or at a loss for words' },
  { id: 'p15', emoji: '☕️🥐', answer: 'breakfast', aliases: ['coffee break', 'morning coffee'], hint: 'The morning meal to start your day' },
  { id: 'p16', emoji: '🍿🎬', answer: 'movie night', aliases: ['movie time', 'movies', 'movie', 'cinema'], hint: 'Cinema screening accompanied by snacks' },
  { id: 'p17', emoji: '🌙🚶‍♂️', answer: 'moonwalk', aliases: ['moon walk'], hint: 'Michael Jackson\'s iconic gliding dance move' },
  { id: 'p18', emoji: '🥪🥪', answer: 'sandwich', aliases: ['sandwiches'], hint: 'Filling layered between slices of bread' },
  { id: 'p19', emoji: '☀️🕶️', answer: 'sunglasses', aliases: ['sun glasses', 'shades'], hint: 'Tinted shades worn to shield against glare' },
  { id: 'p20', emoji: '🚀🧑‍🚀', answer: 'astronaut', aliases: ['space walk', 'spaceman', 'space explorer'], hint: 'Space explorer venturing past Earth' },
  { id: 'p21', emoji: '🍕🎉', answer: 'pizza party', aliases: ['pizza night'], hint: 'Casual celebratory gathering with slices' },
  { id: 'p22', emoji: '🦋🥖', answer: 'butterfly', aliases: ['butter fly'], hint: 'Insect that emerged from a cocoon' },
  { id: 'p23', emoji: '🏀⛹️‍♂️', answer: 'basketball', aliases: ['basket ball'], hint: 'Fast-paced court sport shooting hoops' },
  { id: 'p24', emoji: '📚🐛', answer: 'bookworm', aliases: ['book worm'], hint: 'An avid and passionate reader' },
  { id: 'p25', emoji: '🧊🍦', answer: 'ice cream', aliases: ['icecream'], hint: 'Frozen dairy dessert in a cone' },
  { id: 'p26', emoji: '🥊🥊', answer: 'fight club', aliases: ['boxing', 'fight'], hint: 'First rule: you do not talk about it' },
  { id: 'p27', emoji: '🏎️💨', answer: 'fast and furious', aliases: ['fast furious', 'fast & furious'], hint: 'High-octane car action franchise' },
  { id: 'p28', emoji: '🦁👑', answer: 'lion king', aliases: ['the lion king'], hint: 'Disney classic starring Simba and Mufasa' },
  { id: 'p29', emoji: '🦇👨', answer: 'batman', aliases: ['bat man'], hint: 'The Caped Crusader protecting Gotham' },
  { id: 'p30', emoji: '🧁🎂', answer: 'sweet tooth', aliases: ['sugar rush', 'sweets'], hint: 'A strong craving for sugary delights' },
  { id: 'p31', emoji: '🌍☮️', answer: 'world peace', aliases: ['peace'], hint: 'Universal tranquility and cooperation' },
  { id: 'p32', emoji: '💎💍', answer: 'diamond ring', aliases: ['wedding ring', 'ring'], hint: 'Sparkling engagement jewelry on a finger' },
  { id: 'p33', emoji: '🔑🚪', answer: 'open door', aliases: ['key to success', 'door', 'unlocked'], hint: 'A welcoming opportunity or passage' },
  { id: 'p34', emoji: '🌈🦄', answer: 'rainbow', aliases: ['unicorn'], hint: 'Prismatic arc of color in the sky' },
  { id: 'p35', emoji: '🏹🎯', answer: 'bullseye', aliases: ['bulls eye', 'target', 'direct hit'], hint: 'Dead center of a target' }
];

// Utility: Normalize string for forgiving yet accurate matching
function cleanString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Compare guess against primary answer and all valid aliases
function isAnswerMatch(guess, puzzle) {
  const cleanedGuess = cleanString(guess);
  if (!cleanedGuess) return false;

  if (cleanedGuess === cleanString(puzzle.answer)) return true;

  if (Array.isArray(puzzle.aliases)) {
    return puzzle.aliases.some(alias => cleanString(alias) === cleanedGuess);
  }

  return false;
}

// Check if string contains at least one emoji or symbol
function hasEmoji(str) {
  if (!str) return false;
  try {
    const emojiRegex = /[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]/gu;
    return emojiRegex.test(str);
  } catch {
    const fallbackRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    return fallbackRegex.test(str);
  }
}

// Fisher-Yates array shuffle for uniform distribution
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

class RebusBlitzApp {
  constructor() {
    // Game Configuration
    this.INITIAL_TIME = 30;
    this.CORRECT_BONUS = 100;
    this.INCORRECT_PENALTY = 5;

    // Runtime State
    this.activeDeck = [];
    this.deckIndex = 0;
    this.currentPuzzle = null;
    this.currentLastGuess = '';
    this.missedPuzzles = [];
    this.score = 0;
    this.puzzlesSolved = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.timeRemaining = this.INITIAL_TIME;
    this.timerInterval = null;
    this.isPlaying = false;
    this.isPausedForDrawer = false;
    this.feedbackTimeout = null;

    // Theme: 'dark' (Soft Oceanic) or 'light' (Playful Porcelain)
    this.theme = localStorage.getItem('rebus_blitz_theme') || 'dark';

    // Persistence
    this.highScore = parseInt(localStorage.getItem('rebus_blitz_high_score') || localStorage.getItem('emoji_rebus_high_score') || '0', 10);
    this.customPuzzles = this.loadCustomPuzzles();

    // DOM Elements Cache
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.applyTheme(this.theme);
    this.bindEvents();
    this.updateHighScoreDisplay();
    this.setupDrawerPreview();
    this.fetchCommunityPuzzles();
    console.log('Rebus Blitz initialized with', DEFAULT_PUZZLES.length + this.customPuzzles.length, 'puzzles.');
  }

  cacheDom() {
    this.dom = {
      // Theme
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      themeIconContainer: document.getElementById('theme-icon-container'),

      // Header
      highScore: document.getElementById('high-score'),
      score: document.getElementById('score'),
      scoreChip: document.querySelector('.current-score-badge'),
      openDrawerBtn: document.getElementById('open-drawer-btn'),

      // Screens
      startScreen: document.getElementById('start-screen'),
      gamePanel: document.getElementById('game-panel'),
      startGameBtn: document.getElementById('start-game-btn'),

      // Active Game Elements
      puzzleProgress: document.getElementById('puzzle-progress'),
      timerPill: document.getElementById('timer-pill'),
      timer: document.getElementById('timer'),
      streakPill: document.getElementById('streak-pill'),
      streakCount: document.getElementById('streak-count'),
      puzzleEmoji: document.getElementById('puzzle'),
      puzzleHint: document.getElementById('hint'),
      answerForm: document.getElementById('answer-form'),
      answerInput: document.getElementById('answer-input'),
      skipBtn: document.getElementById('skip-btn'),
      feedback: document.getElementById('feedback'),
      inputGroup: document.querySelector('.input-group'),

      // Drawer Elements
      drawerBackdrop: document.getElementById('drawer-backdrop'),
      submitDrawer: document.getElementById('submit-drawer'),
      closeDrawerBtn: document.getElementById('close-drawer-btn'),
      submitForm: document.getElementById('submit-form'),
      emojiInput: document.getElementById('emoji-input'),
      answerInputSubmit: document.getElementById('answer-input-submit'),
      aliasesInput: document.getElementById('aliases-input'),
      hintInput: document.getElementById('hint-input'),
      previewEmoji: document.getElementById('preview-emoji'),
      previewHint: document.getElementById('preview-hint'),
      submitFeedback: document.getElementById('submit-feedback'),

      // Modal Elements
      gameOverModal: document.getElementById('game-over-modal'),
      modalIconBadge: document.getElementById('modal-icon-badge'),
      modalTitle: document.getElementById('modal-title'),
      modalSubtitle: document.getElementById('modal-subtitle'),
      finalScore: document.getElementById('final-score'),
      newHighScoreTag: document.getElementById('new-high-score-tag'),
      puzzlesSolved: document.getElementById('puzzles-solved'),
      bestStreakDisplay: document.getElementById('best-streak'),
      missedSection: document.getElementById('missed-section'),
      missedCountTag: document.getElementById('missed-count-tag'),
      missedList: document.getElementById('missed-list'),
      restartBtn: document.getElementById('restart-button'),
      shareBtn: document.getElementById('share-score-btn'),
      shareBtnText: document.getElementById('share-btn-text'),
      drawerFromModalBtn: document.getElementById('drawer-from-modal-btn'),
    };
  }

  bindEvents() {
    // Theme toggle
    if (this.dom.themeToggleBtn) {
      this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Start game
    this.dom.startGameBtn.addEventListener('click', () => this.startNewGame());

    // Submit guess
    this.dom.answerForm.addEventListener('submit', (e) => this.handleGuessSubmit(e));

    // Record typing for last guess tracking
    this.dom.answerInput.addEventListener('input', (e) => {
      this.currentLastGuess = e.target.value.trim();
    });

    // Skip puzzle
    this.dom.skipBtn.addEventListener('click', () => this.handleSkip());

    // Drawer triggers
    this.dom.openDrawerBtn.addEventListener('click', () => this.openDrawer());
    this.dom.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
    this.dom.drawerBackdrop.addEventListener('click', () => this.closeDrawer());

    // Custom puzzle submission
    this.dom.submitForm.addEventListener('submit', (e) => this.handleCustomPuzzleSubmit(e));

    // Modal triggers
    this.dom.restartBtn.addEventListener('click', () => {
      this.closeModal();
      this.startNewGame();
    });

    if (this.dom.shareBtn) {
      this.dom.shareBtn.addEventListener('click', () => this.handleShareScore());
    }

    this.dom.drawerFromModalBtn.addEventListener('click', () => {
      this.closeModal();
      this.openDrawer();
    });

    // Keyboard support: Escape closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.submitDrawer.classList.contains('active')) {
          this.closeDrawer();
        }
      }
    });
  }

  // ==========================================================================
  // Theme Switching
  // ==========================================================================

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rebus_blitz_theme', theme);

    if (this.dom.themeIconContainer) {
      // In dark mode, show Sun icon to switch to light. In light mode, show Moon icon.
      this.dom.themeIconContainer.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      this.dom.themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  // ==========================================================================
  // Game Lifecycle & Flow
  // ==========================================================================

  startNewGame() {
    this.isPlaying = true;
    this.score = 0;
    this.puzzlesSolved = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.timeRemaining = this.INITIAL_TIME;
    this.currentLastGuess = '';
    this.missedPuzzles = [];

    // Build fresh shuffled deck with zero immediate repeats
    const allPuzzles = [...DEFAULT_PUZZLES, ...this.customPuzzles];
    this.activeDeck = shuffleArray(allPuzzles);
    this.deckIndex = 0;

    // Switch view from Start Screen to Game Panel
    this.dom.startScreen.style.display = 'none';
    this.dom.gamePanel.style.display = 'block';

    // Update displays
    this.updateScoreDisplay(0);
    this.updateStreakDisplay();
    this.updateTimerDisplay();

    // Load first puzzle
    this.loadCurrentPuzzle();

    // Start timer loop
    this.startTimer();

    // Focus input
    setTimeout(() => {
      this.dom.answerInput.focus();
    }, 100);
  }

  loadCurrentPuzzle() {
    // End Condition: Check if all puzzles in the active deck have been answered!
    if (this.deckIndex >= this.activeDeck.length) {
      this.triggerDeckCompleted();
      return;
    }

    this.currentPuzzle = this.activeDeck[this.deckIndex];
    this.currentLastGuess = '';

    // Smooth transition
    this.dom.puzzleEmoji.classList.add('puzzle-switch');

    setTimeout(() => {
      this.dom.puzzleEmoji.textContent = this.currentPuzzle.emoji;
      this.dom.puzzleHint.textContent = this.currentPuzzle.hint;
      this.dom.puzzleProgress.textContent = `Puzzle ${this.deckIndex + 1} of ${this.activeDeck.length}`;

      this.dom.puzzleEmoji.classList.remove('puzzle-switch');
      this.dom.puzzleEmoji.classList.add('puzzle-enter');

      setTimeout(() => {
        this.dom.puzzleEmoji.classList.remove('puzzle-enter');
      }, 300);
    }, 150);

    // Clear input
    this.dom.answerInput.value = '';
  }

  handleGuessSubmit(e) {
    e.preventDefault();
    if (!this.isPlaying || !this.currentPuzzle) return;

    const guess = this.dom.answerInput.value.trim();
    if (!guess) return;

    this.currentLastGuess = guess;

    if (isAnswerMatch(guess, this.currentPuzzle)) {
      this.onCorrectAnswer();
    } else {
      this.onIncorrectAnswer(guess);
    }
  }

  onCorrectAnswer() {
    // Scoring & streak
    this.score += this.CORRECT_BONUS;
    this.puzzlesSolved++;
    this.currentStreak++;
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

    // Reset timer back to full 30s
    this.timeRemaining = this.INITIAL_TIME;
    this.updateTimerDisplay();

    // Update UI
    this.updateScoreDisplay(this.score, true);
    this.updateStreakDisplay();
    this.showFeedback(`+${this.CORRECT_BONUS}! Timer Reset`, 'success');

    // Advance puzzle
    this.deckIndex++;
    this.loadCurrentPuzzle();
    this.dom.answerInput.focus();
  }

  onIncorrectAnswer(guess) {
    // Penalty: -5s
    this.timeRemaining = Math.max(0, this.timeRemaining - this.INCORRECT_PENALTY);
    this.currentStreak = 0;
    this.updateStreakDisplay();
    this.updateTimerDisplay();

    // Visual feedback
    this.dom.inputGroup.classList.add('shake-error');
    this.dom.timerPill.classList.add('timer-penalty-flash');
    this.showFeedback(`-${this.INCORRECT_PENALTY}s Penalty! Try again`, 'error');

    setTimeout(() => {
      this.dom.inputGroup.classList.remove('shake-error');
      this.dom.timerPill.classList.remove('timer-penalty-flash');
    }, 500);

    // Select text for quick re-typing
    this.dom.answerInput.select();

    // Did penalty trigger game over?
    if (this.timeRemaining <= 0) {
      this.recordMissed(this.currentPuzzle, guess);
      this.triggerGameOver();
    }
  }

  handleSkip() {
    if (!this.isPlaying || !this.currentPuzzle) return;

    // Record as missed before moving on
    this.recordMissed(this.currentPuzzle, this.currentLastGuess || '(Skipped)');

    // -5s penalty for skipping
    this.timeRemaining = Math.max(0, this.timeRemaining - this.INCORRECT_PENALTY);
    this.currentStreak = 0;
    this.updateStreakDisplay();
    this.updateTimerDisplay();

    const previousAnswer = this.currentPuzzle.answer;
    this.showFeedback(`Skipped! Answer: "${previousAnswer}"`, 'info');

    if (this.timeRemaining <= 0) {
      this.triggerGameOver();
      return;
    }

    this.deckIndex++;
    this.loadCurrentPuzzle();
    this.dom.answerInput.focus();
  }

  recordMissed(puzzle, userGuess) {
    if (!puzzle) return;
    if (!this.missedPuzzles.some(m => m.id === puzzle.id)) {
      this.missedPuzzles.push({
        id: puzzle.id,
        emoji: puzzle.emoji,
        answer: puzzle.answer,
        aliases: puzzle.aliases || [],
        hint: puzzle.hint,
        userGuess: userGuess || '(No guess)'
      });
    }
  }

  // ==========================================================================
  // Timer Management
  // ==========================================================================

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.isPausedForDrawer) return;

      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        if (this.currentPuzzle) {
          this.recordMissed(this.currentPuzzle, this.currentLastGuess || '(Time expired)');
        }
        this.triggerGameOver();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    this.dom.timer.textContent = this.timeRemaining;

    // Visual timer states
    this.dom.timerPill.classList.remove('timer-warning', 'timer-danger');
    if (this.timeRemaining <= 5) {
      this.dom.timerPill.classList.add('timer-danger');
    } else if (this.timeRemaining <= 12) {
      this.dom.timerPill.classList.add('timer-warning');
    }
  }

  // ==========================================================================
  // Game End Conditions (Time Out vs Deck Completed Victory)
  // ==========================================================================

  triggerDeckCompleted() {
    this.isPlaying = false;
    this.stopTimer();

    // Time bonus for finishing early!
    const timeBonus = this.timeRemaining * 10;
    this.score += timeBonus;

    // Check high score
    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = this.score;
      localStorage.setItem('rebus_blitz_high_score', this.highScore.toString());
      this.updateHighScoreDisplay();
    }

    // Modal Header: Victory Theme
    this.dom.modalIconBadge.className = 'modal-icon-badge victory-mode';
    this.dom.modalIconBadge.innerHTML = ICONS.trophy;
    this.dom.modalTitle.textContent = 'All Puzzles Solved!';
    this.dom.modalSubtitle.textContent = `Incredible run! You cleared the entire deck with ${this.timeRemaining}s left (+${timeBonus}s bonus)!`;

    // Populate modal stats
    this.dom.finalScore.textContent = this.score;
    this.dom.puzzlesSolved.textContent = this.puzzlesSolved;
    this.dom.bestStreakDisplay.textContent = this.bestStreak;
    this.dom.newHighScoreTag.style.display = isNewHigh && this.score > 0 ? 'inline-block' : 'none';

    // Missed puzzles
    this.renderMissedPuzzles();

    this.openModal();
  }

  triggerGameOver() {
    this.isPlaying = false;
    this.stopTimer();

    // Check high score
    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = this.score;
      localStorage.setItem('rebus_blitz_high_score', this.highScore.toString());
      this.updateHighScoreDisplay();
    }

    // Modal Header: Time Out Theme
    this.dom.modalIconBadge.className = 'modal-icon-badge';
    this.dom.modalIconBadge.innerHTML = ICONS.clock;
    this.dom.modalTitle.textContent = "Time's Up!";
    this.dom.modalSubtitle.textContent = 'Blitz round complete! Check your stats below:';

    // Populate modal stats
    this.dom.finalScore.textContent = this.score;
    this.dom.puzzlesSolved.textContent = this.puzzlesSolved;
    this.dom.bestStreakDisplay.textContent = this.bestStreak;
    this.dom.newHighScoreTag.style.display = isNewHigh && this.score > 0 ? 'inline-block' : 'none';

    // Populate Missed Puzzles List
    this.renderMissedPuzzles();

    this.openModal();
  }

  renderMissedPuzzles() {
    if (!this.dom.missedSection || !this.dom.missedList) return;

    if (this.missedPuzzles.length === 0) {
      this.dom.missedSection.style.display = 'none';
      return;
    }

    this.dom.missedSection.style.display = 'block';
    this.dom.missedCountTag.textContent = this.missedPuzzles.length;

    this.dom.missedList.innerHTML = this.missedPuzzles.map(item => {
      const aliasHint = item.aliases && item.aliases.length > 0
        ? `<span class="alt-hint">(also: ${item.aliases.slice(0, 2).join(', ')})</span>`
        : '';

      const userGuessMarkup = item.userGuess && item.userGuess !== '(No guess)' && item.userGuess !== '(Skipped)' && item.userGuess !== '(Time expired)'
        ? `<span class="user-guess">"${item.userGuess}"</span>`
        : `<span style="font-style:italic;">${item.userGuess}</span>`;

      return `
        <div class="missed-card">
          <div class="missed-card-emoji">${item.emoji}</div>
          <div class="missed-card-content">
            <div class="missed-card-answer">
              ${item.answer} ${aliasHint}
            </div>
            <div class="missed-card-hint">${item.hint}</div>
            <div class="missed-card-user">Your guess: ${userGuessMarkup}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  openModal() {
    this.dom.gameOverModal.style.display = 'flex';
    void this.dom.gameOverModal.offsetWidth;
    this.dom.gameOverModal.classList.add('active');
    this.dom.gameOverModal.setAttribute('aria-hidden', 'false');
    this.dom.restartBtn.focus();
  }

  handleShareScore() {
    const shareText = `⚡ Rebus Blitz\nScore: ${this.score.toLocaleString()} pts | Solved: ${this.puzzlesSolved} | Streak: ${this.bestStreak} 🔥\nCan you beat my blitz run?\nhttps://rebus-blitz.vercel.app/`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        if (this.dom.shareBtnText) {
          const oldText = this.dom.shareBtnText.textContent;
          this.dom.shareBtnText.textContent = 'Copied to Clipboard! ✓';
          setTimeout(() => {
            if (this.dom.shareBtnText) {
              this.dom.shareBtnText.textContent = oldText;
            }
          }, 2000);
        }
      }).catch(() => {
        // Fallback
        prompt('Copy your blitz score brag:', shareText);
      });
    } else {
      prompt('Copy your blitz score brag:', shareText);
    }
  }

  closeModal() {
    this.dom.gameOverModal.classList.remove('active');
    this.dom.gameOverModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      this.dom.gameOverModal.style.display = 'none';
    }, 250);
  }

  // ==========================================================================
  // Drawer & Custom Puzzles with Aliases Support
  // ==========================================================================

  openDrawer() {
    if (this.isPlaying) {
      this.isPausedForDrawer = true;
    }
    this.dom.drawerBackdrop.classList.add('active');
    this.dom.submitDrawer.classList.add('active');
    this.dom.drawerBackdrop.setAttribute('aria-hidden', 'false');
    this.dom.submitDrawer.setAttribute('aria-hidden', 'false');
    this.dom.emojiInput.focus();
  }

  closeDrawer() {
    this.dom.drawerBackdrop.classList.remove('active');
    this.dom.submitDrawer.classList.remove('active');
    this.dom.drawerBackdrop.setAttribute('aria-hidden', 'true');
    this.dom.submitDrawer.setAttribute('aria-hidden', 'true');

    if (this.isPlaying) {
      this.isPausedForDrawer = false;
      this.dom.answerInput.focus();
    }
  }

  setupDrawerPreview() {
    const updatePreview = () => {
      const emojiVal = this.dom.emojiInput.value.trim() || '🍿🎬';
      const hintVal = this.dom.hintInput.value.trim() || 'Cinema screening with snacks';
      this.dom.previewEmoji.textContent = emojiVal;
      this.dom.previewHint.textContent = hintVal;
    };

    this.dom.emojiInput.addEventListener('input', updatePreview);
    this.dom.hintInput.addEventListener('input', updatePreview);
  }

  async fetchCommunityPuzzles() {
    try {
      const response = await fetch('/api/puzzles');
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && Array.isArray(data.puzzles) && data.puzzles.length > 0) {
        const existingIds = new Set(this.customPuzzles.map(p => p.id));
        let added = 0;
        for (const p of data.puzzles) {
          if (!existingIds.has(p.id)) {
            this.customPuzzles.push(p);
            existingIds.add(p.id);
            added++;
          }
        }
        if (added > 0) {
          localStorage.setItem('rebus_blitz_custom_puzzles', JSON.stringify(this.customPuzzles));
          console.log(`[Rebus Blitz] Synced ${added} community puzzles from KV store`);
        }
      }
    } catch {
      // Offline or static server without /api, ignore gracefully
    }
  }

  handleCustomPuzzleSubmit(e) {
    e.preventDefault();

    const emoji = this.dom.emojiInput.value.trim();
    const answer = this.dom.answerInputSubmit.value.trim();
    const aliasesRaw = (this.dom.aliasesInput ? this.dom.aliasesInput.value : '').trim();
    const hint = this.dom.hintInput.value.trim();

    // Validation
    if (!hasEmoji(emoji)) {
      this.showSubmitFeedback('Please include at least one valid emoji or symbol!', 'error');
      return;
    }

    if (answer.length < 2) {
      this.showSubmitFeedback('Answer must be at least 2 characters long.', 'error');
      return;
    }

    if (hint.length < 3) {
      this.showSubmitFeedback('Please provide a helpful hint for players.', 'error');
      return;
    }

    // Parse aliases list
    const aliases = aliasesRaw
      ? aliasesRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // Create puzzle
    const newPuzzle = {
      id: 'custom_' + Date.now(),
      emoji,
      answer,
      aliases,
      hint,
      isCustom: true
    };

    // 1. Save locally immediately for 0ms latency
    this.customPuzzles.push(newPuzzle);
    localStorage.setItem('rebus_blitz_custom_puzzles', JSON.stringify(this.customPuzzles));

    // Also inject into active deck if game is running
    if (this.isPlaying) {
      this.activeDeck.push(newPuzzle);
    }

    // Success feedback
    this.showSubmitFeedback('Rebus added! It is now in the active rotation.', 'success');
    this.dom.submitForm.reset();
    this.dom.previewEmoji.textContent = '🍿🎬';
    this.dom.previewHint.textContent = 'Cinema screening with snacks';

    // 2. Dispatch to KV backend API in background
    try {
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji,
          answer,
          aliases,
          hint
        })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          console.log('[Rebus Blitz] Puzzle synced to Vercel KV store:', data.puzzleId);
        }
      }).catch(err => {
        console.log('[Rebus Blitz] Running offline/static, saved locally:', err.message);
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      this.clearSubmitFeedback();
    }, 3500);
  }

  loadCustomPuzzles() {
    try {
      const data = localStorage.getItem('rebus_blitz_custom_puzzles') || localStorage.getItem('emoji_rebus_custom_puzzles');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ==========================================================================
  // UI Helpers & Feedback
  // ==========================================================================

  updateScoreDisplay(score, pulse = false) {
    this.dom.score.textContent = score;
    if (pulse && this.dom.scoreChip) {
      this.dom.scoreChip.classList.add('stat-pulse');
      setTimeout(() => {
        this.dom.scoreChip.classList.remove('stat-pulse');
      }, 300);
    }
  }

  updateHighScoreDisplay() {
    this.dom.highScore.textContent = this.highScore;
  }

  updateStreakDisplay() {
    this.dom.streakCount.textContent = this.currentStreak;
    if (this.currentStreak >= 3) {
      this.dom.streakPill.style.color = '#fbbf24';
      this.dom.streakPill.style.borderColor = 'rgba(251, 191, 36, 0.4)';
    } else {
      this.dom.streakPill.style.color = '#f97316';
      this.dom.streakPill.style.borderColor = 'rgba(249, 115, 22, 0.2)';
    }
  }

  showFeedback(message, type = 'info') {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.dom.feedback.textContent = message;
    this.dom.feedback.className = `feedback-banner show feedback-${type}`;

    this.feedbackTimeout = setTimeout(() => {
      this.dom.feedback.className = 'feedback-banner';
      this.dom.feedback.textContent = '';
    }, 2400);
  }

  showSubmitFeedback(message, type = 'info') {
    this.dom.submitFeedback.textContent = message;
    this.dom.submitFeedback.className = `feedback-banner show feedback-${type}`;
  }

  clearSubmitFeedback() {
    this.dom.submitFeedback.className = 'feedback-banner';
    this.dom.submitFeedback.textContent = '';
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new RebusBlitzApp();
  app.init();
});
