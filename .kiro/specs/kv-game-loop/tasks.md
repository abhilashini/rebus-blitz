# Implementation Plan: KV Integration & Live Game Loop

## Overview

Implement KV integration and live game loop for Emoji Rebus Blitz using JavaScript/Node.js. The implementation follows an incremental approach: KV setup and seeding, game engine implementation, timer system, frontend integration, and testing. Each task builds on previous steps to ensure all components are properly wired together.

## Tasks

- [ ] 1. Set up KV integration and seed initial puzzles
  - [ ] 1.1 Configure Vercel KV client with environment variables
    - Create KV client utility module
    - Validate connection in api/health.js endpoint
    - Add KV status to health check response
    - _Requirements: 1.1, 6.1_
  
  - [ ] 1.2 Implement KV puzzle manager with random selection
    - Create KVPuzzleManager class with fetchRandomPuzzle() method
    - Implement uniform random selection from puzzle IDs list
    - Atomic increment of puzzle usage counts
    - Error handling for empty puzzle database
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ]* 1.3 Write property test for random puzzle selection
    - **Property 5: Random Puzzle Selection Uniformity**
    - **Validates: Requirements 1.4**
  
  - [ ] 1.3 Seed initial puzzle dataset into KV
    - Create seed script with 10+ example puzzles
    - Ensure puzzles follow validation rules (emoji, answer, hint)
    - Store with unique IDs and timestamps
    - Verify seeding via health endpoint count
    - _Requirements: 1.3, 4.5_

- [ ] 2. Checkpoint - Verify KV setup and seeding
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Enhance submission endpoint with KV storage
  - [ ] 3.1 Update api/submit.js to store validated puzzles in KV
    - Integrate KVPuzzleManager.storePuzzle() method
    - Generate unique puzzle IDs (UUID v4)
    - Set createdAt timestamp and initial usageCount
    - Add puzzle ID to puzzles:ids list
    - _Requirements: 4.5, 4.7_
  
  - [ ] 3.2 Implement enhanced validation module
    - Create shared validation module with validateSubmission()
    - Implement containsEmoji() with proper Unicode detection
    - Implement normalizeAnswer() with idempotence property
    - Export validation functions for both frontend and backend
    - _Requirements: 3.1, 3.3, 4.1, 4.2, 8.4_
  
  - [ ]* 3.3 Write property tests for validation module
    - **Property 3: Answer Normalization Idempotence**
    - **Validates: Requirements 3.3**
    - **Property 6: Submission Validation Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - **Property 7: Normalization Determinism**
    - **Validates: Requirements 8.2**
    - **Property 11: Emoji Detection Accuracy**
    - **Validates: Requirements 4.2, 8.4**
    - **Property 12: Answer Comparison Normalization**
    - **Validates: Requirements 3.1, 3.2, 3.5**
    - **Property 13: Input Sanitization Security**
    - **Validates: Requirements 8.1**
    - **Property 15: Data Structure Validation**
    - **Validates: Requirements 8.3**
  
  - [ ] 3.4 Implement error handling for KV failures
    - Graceful degradation when KV unavailable
    - Fallback to static puzzle set
    - User-friendly error messages
    - _Requirements: 6.1, 6.3_

- [ ] 4. Implement game engine with timer and scoring
  - [ ] 4.1 Create GameEngine class with state management
    - Implement startGame(), processAnswer(), getState() methods
    - Manage score, timeRemaining, currentPuzzle, isGameOver
    - Integrate with validation module for answer normalization
    - _Requirements: 2.1, 2.3, 2.4, 5.1, 5.3_
  
  - [ ] 4.2 Implement TimerManager class with precise timing
    - Use requestAnimationFrame for smooth updates
    - Handle browser tab visibility changes
    - Implement start(), pause(), reset(), addTime() methods
    - Callbacks for onTick and onComplete events
    - _Requirements: 2.5, 5.5, 5.6, 7.4_
  
  - [ ]* 4.3 Write property tests for game engine
    - **Property 1: Score Monotonicity**
    - **Validates: Requirements 5.3**
    - **Property 2: Timer Bounds**
    - **Validates: Requirements 2.1, 2.4**
    - **Property 4: Game Over Invariant**
    - **Validates: Requirements 2.2, 2.6**
    - **Property 8: Correct Answer Reward**
    - **Validates: Requirements 2.3**
    - **Property 9: Incorrect Answer Penalty**
    - **Validates: Requirements 2.4**
  
  - [ ] 4.4 Implement game over state handling
    - Trigger game over when timer reaches 0
    - Preserve final score and display restart options
    - Prevent further score changes after game over
    - _Requirements: 2.2, 2.6, 5.4_

- [ ] 5. Checkpoint - Verify game engine logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update frontend with live game loop
  - [ ] 6.1 Replace public/app.js stub with game implementation
    - Initialize GameEngine and TimerManager
    - Fetch initial puzzle from /api/puzzle
    - Display puzzle emoji and hint
    - Start 30-second countdown timer
    - _Requirements: 5.1, 7.5_
  
  - [ ] 6.2 Implement answer submission handling
    - Capture form submit events
    - Call gameEngine.processAnswer() with player input
    - Display correct/incorrect feedback
    - Update score and timer displays
    - Fetch next puzzle on correct answer
    - _Requirements: 3.4, 3.5_
  
  - [ ] 6.3 Implement real-time UI updates
    - Update timer display every second
    - Update score display immediately on changes
    - Smooth animations for state transitions
    - Game over screen with restart button
    - _Requirements: 5.2, 7.3_
  
  - [ ] 6.4 Implement network error handling
    - Retry logic with exponential backoff for API failures
    - User-friendly error messages
    - Graceful degradation when services unavailable
    - _Requirements: 6.2, 6.4, 6.5_
  
  - [ ]* 6.5 Write unit tests for frontend components
    - Test GameEngine integration with UI
    - Test error handling scenarios
    - Test timer accuracy under various conditions
    - _Requirements: 6.4, 7.1, 7.2_

- [ ] 7. Integrate crowdsourcing submission form
  - [ ] 7.1 Update submit form with live validation
    - Use shared validation module for client-side validation
    - Real-time feedback for field validation
    - Disable submit button until all fields valid
    - _Requirements: 4.6_
  
  - [ ] 7.2 Implement form submission to KV
    - POST to /api/submit with validated data
    - Handle success/error responses
    - Reset form on successful submission
    - Show confirmation message
    - _Requirements: 4.5, 4.6_
  
  - [ ]* 7.3 Write integration tests for submission flow
    - Test end-to-end submission with KV storage
    - Test validation error scenarios
    - Test network failure handling
    - _Requirements: 4.6, 6.3_

- [ ] 8. Performance optimization and final integration
  - [ ] 8.1 Optimize API response times
    - Implement connection pooling for KV
    - Cache frequently accessed puzzles
    - Monitor and log performance metrics
    - _Requirements: 7.1, 7.2_
  
  - [ ] 8.2 Optimize frontend performance
    - Debounce user input events
    - Minimize DOM updates during game loop
    - Implement virtual DOM if needed
    - _Requirements: 7.3, 7.5_
  
  - [ ] 8.3 Implement comprehensive error monitoring
    - Log KV connection issues
    - Track puzzle fetch failures
    - Monitor game session errors
    - _Requirements: 6.1, 6.5_
  
  - [ ] 8.4 Final integration and testing
    - Test complete game flow end-to-end
    - Verify all requirements are met
    - Performance testing under load
    - Security validation testing
    - _Requirements: All_

- [ ] 9. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from design
- Unit tests validate specific examples and edge cases
- Frontend uses vanilla JavaScript for simplicity and performance
- Backend uses Node.js ES Modules with Vercel KV integration

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "3.1", "3.2"] },
    { "id": 2, "tasks": ["1.4", "3.3", "3.4", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["6.4", "6.5", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "8.4"] }
  ]
}
```