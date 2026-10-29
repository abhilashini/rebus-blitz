/**
 * Timer Manager
 * Precise countdown timer with callbacks and browser visibility handling
 */

/**
 * Timer configuration
 * @typedef {Object} TimerConfig
 * @property {number} durationSeconds - Timer duration in seconds
 * @property {Function} onTick - Called every second with remaining time
 * @property {Function} onComplete - Called when timer reaches 0
 * @property {Function} onVisibilityChange - Called when browser tab visibility changes
 */

/**
 * Timer Manager class
 */
export class TimerManager {
  /**
   * Create timer with duration and callbacks
   * @param {number} durationSeconds - Timer duration in seconds
   * @param {Object} callbacks - Timer event callbacks
   */
  constructor(durationSeconds, callbacks = {}) {
    this.durationSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;
    this.visibilityChangeHandler = null;
    
    // Callbacks
    this.onTick = callbacks.onTick || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});
    this.onVisibilityChange = callbacks.onVisibilityChange || (() => {});
    
    // Track time when tab becomes inactive
    this.inactiveStartTime = null;
    this.inactiveDuration = 0;
    
    // Bind methods
    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * Start the timer
   */
  start() {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now() - (this.inactiveDuration * 1000);
    this.inactiveDuration = 0;
    
    // Start animation frame loop for precise timing
    this.tick();
    
    // Set up visibility change handler
    this.setupVisibilityHandlers();
    
    console.log(`Timer started: ${this.durationSeconds}s`);
  }

  /**
   * Pause the timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('Timer paused');
  }

  /**
   * Resume the timer
   */
  resume() {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    this.startTime = Date.now() - (this.calculateElapsed() * 1000);
    this.tick();
    
    console.log('Timer resumed');
  }

  /**
   * Reset timer to initial duration
   */
  reset() {
    this.stop();
    this.remainingSeconds = this.durationSeconds;
    this.startTime = null;
    this.inactiveDuration = 0;
    
    // Notify of reset
    this.onTick(this.remainingSeconds);
    
    console.log(`Timer reset to ${this.durationSeconds}s`);
  }

  /**
   * Add time to timer (positive or negative)
   * @param {number} seconds - Seconds to add
   */
  addTime(seconds) {
    const newTime = this.remainingSeconds + seconds;
    this.remainingSeconds = Math.max(0, newTime);
    
    // If we're running, adjust start time to maintain accuracy
    if (this.isRunning && !this.isPaused) {
      this.startTime = Date.now() - ((this.durationSeconds - this.remainingSeconds) * 1000);
    }
    
    // Notify of time change
    this.onTick(this.remainingSeconds);
    
    // Check if timer completed
    if (this.remainingSeconds <= 0 && this.isRunning) {
      this.complete();
    }
    
    console.log(`Added ${seconds}s, remaining: ${this.remainingSeconds}s`);
  }

  /**
   * Get current remaining time
   * @returns {number} Seconds remaining
   */
  getRemainingTime() {
    if (!this.isRunning || this.isPaused) {
      return this.remainingSeconds;
    }
    
    // Calculate precise remaining time
    const elapsed = this.calculateElapsed();
    const remaining = Math.max(0, this.durationSeconds - elapsed);
    
    return Math.floor(remaining);
  }

  /**
   * Check if timer is running
   * @returns {boolean} True if timer is active
   */
  isActive() {
    return this.isRunning && !this.isPaused;
  }

  /**
   * Stop and destroy timer
   */
  destroy() {
    this.stop();
    this.removeVisibilityHandlers();
    
    this.onTick = null;
    this.onComplete = null;
    this.onVisibilityChange = null;
    
    console.log('Timer destroyed');
  }

  /**
   * Stop the timer
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.removeVisibilityHandlers();
    
    console.log('Timer stopped');
  }

  /**
   * Calculate elapsed time in seconds
   * @returns {number} Elapsed seconds
   */
  calculateElapsed() {
    if (!this.startTime) {
      return 0;
    }
    
    const now = Date.now();
    const elapsedMs = now - this.startTime;
    const inactiveMs = this.inactiveDuration * 1000;
    
    return (elapsedMs - inactiveMs) / 1000;
  }

  /**
   * Main timer tick function
   */
  tick() {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    // Calculate remaining time
    const elapsed = this.calculateElapsed();
    const remaining = Math.max(0, this.durationSeconds - elapsed);
    const remainingInt = Math.floor(remaining);
    
    // Check if remaining time changed (whole second)
    if (remainingInt !== this.remainingSeconds) {
      this.remainingSeconds = remainingInt;
      this.onTick(this.remainingSeconds);
    }
    
    // Check if timer completed
    if (remaining <= 0) {
      this.complete();
      return;
    }
    
    // Schedule next tick
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Handle timer completion
   */
  complete() {
    this.remainingSeconds = 0;
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.onTick(0);
    this.onComplete();
    
    console.log('Timer completed');
  }

  /**
   * Set up browser visibility change handlers
   */
  setupVisibilityHandlers() {
    if (typeof document === 'undefined') {
      return; // Not in browser environment
    }
    
    this.visibilityChangeHandler = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * Remove visibility change handlers
   */
  removeVisibilityHandlers() {
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * Handle browser tab visibility changes
   */
  handleVisibilityChange() {
    if (typeof document === 'undefined') {
      return;
    }
    
    const isHidden = document.hidden;
    
    if (isHidden && this.isRunning && !this.isPaused) {
      // Tab became inactive
      this.inactiveStartTime = Date.now();
      this.onVisibilityChange(false); // Timer paused due to inactivity
      
    } else if (!isHidden && this.inactiveStartTime) {
      // Tab became active again
      const inactiveDuration = (Date.now() - this.inactiveStartTime) / 1000;
      this.inactiveDuration += inactiveDuration;
      this.inactiveStartTime = null;
      this.onVisibilityChange(true); // Timer resumed
      
      // If we have significant inactive time, adjust the timer
      if (inactiveDuration > 1) {
        console.log(`Tab was inactive for ${inactiveDuration.toFixed(1)}s, adjusting timer`);
        
        // Recalculate elapsed time with inactive duration
        const elapsed = this.calculateElapsed();
        const remaining = Math.max(0, this.durationSeconds - elapsed);
        
        if (remaining <= 0) {
          this.complete();
        }
      }
    }
  }

  /**
   * Get timer status
   * @returns {Object} Timer status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      remainingSeconds: this.getRemainingTime(),
      durationSeconds: this.durationSeconds,
      progress: (this.getRemainingTime() / this.durationSeconds) * 100,
      hasInactiveTime: this.inactiveDuration > 0,
    };
  }
}

// Export singleton instance (optional)
export const timerManager = (duration, callbacks) => new TimerManager(duration, callbacks);
