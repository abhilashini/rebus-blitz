# Implementation Plan: Emoji Rebus Blitz Initial Layout

## Overview

Implement the initial project layout for Emoji Rebus Blitz using TypeScript for backend API routes and vanilla JavaScript/HTML/CSS for frontend. The implementation follows a phased approach: root configuration, static frontend shell, backend API stubs, and validation testing.

## Tasks

- [ ] 1. Set up root configuration files
  - [ ] 1.1 Create package.json with TypeScript/ES Module configuration
    - Set name to "emoji-rebus-blitz" and version to "0.1.0"
    - Configure "type": "module" for ES Module support
    - Add scripts: "dev": "vercel dev", "build": "echo No build step", "start": "vercel dev"
    - Add dependencies: "@vercel/kv" for Redis integration
    - Add TypeScript configuration if needed for type checking
    - _Requirements: 1.1, 1.2_
  
  - [ ] 1.2 Create vercel.json with routing configuration
    - Set version to 2
    - Configure rewrites: /api/* to serverless functions, all other paths to public/index.html
    - Specify Node.js 20.x runtime for API functions
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ] 1.3 Create .env.local with placeholder variables
    - Add KV_REST_API_URL and KV_REST_API_TOKEN placeholders as comments
    - Ensure .env.local is in .gitignore
    - _Requirements: 1.6_

- [ ] 2. Create static frontend shell
  - [ ] 2.1 Create public/index.html with semantic structure
    - Use HTML5 doctype with lang="en" and UTF-8 charset
    - Include title "Emoji Rebus Blitz 🎉"
    - Add semantic landmark regions: header, main, footer
    - Create game panel with puzzle display, timer, answer form
    - Create submit panel with crowdsourcing form
    - Link to style.css and app.js
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 2.2 Create public/style.css with responsive layout
    - Define CSS custom properties for colors and spacing
    - Create CSS Grid layout for body structure
    - Use Flexbox for game and submit panels
    - Implement responsive design: vertical stack on mobile, side-by-side on desktop (768px+)
    - Add accessible focus styles
    - _Requirements: 2.4_
  
  - [ ] 2.3 Create public/app.js as ES Module stub
    - Create init() function that logs "Emoji Rebus Blitz — ready"
    - Export init function
    - Call init() at module execution
    - _Requirements: 2.5_

- [ ] 3. Checkpoint - Verify frontend structure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement backend API route stubs
  - [ ] 4.1 Create api/puzzle.js with GET endpoint
    - Export default async function handler(req, res)
    - Accept only GET requests, return 405 for others
    - Return hardcoded puzzle stub: { "emoji": "🌊🏄‍♂️", "hint": "Something surfers do" }
    - Set Content-Type: application/json
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 4.2 Write property test for puzzle endpoint
    - **Property 5: API endpoint method enforcement**
    - **Validates: Requirements 3.2**
  
  - [ ] 4.3 Create api/submit.js with POST endpoint and validation
    - Export default async function handler(req, res)
    - Accept only POST requests, return 405 for others
    - Parse JSON body for emoji, answer, hint fields
    - Implement validation: reject empty fields with 400 error
    - Implement emoji detection: reject non-emoji strings with 400 error
    - Normalize answer: lowercase, remove non-alphanumeric chars (keep spaces)
    - Return success response with normalized answer
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 4.4 Write property tests for submission validation
    - **Property 1: Normalization preserves alphanumeric content**
    - **Validates: Requirements 3.3, 4.4, 4.5**
    - **Property 2: Validation rejects empty fields**
    - **Validates: Requirements 3.4**
    - **Property 3: Emoji detection consistency**
    - **Validates: Requirements 3.5**
    - **Property 4: Special character removal**
    - **Validates: Requirements 4.4**
    - **Property 6: Submission endpoint validation**
    - **Validates: Requirements 3.6**
  
  - [ ] 4.5 Create api/health.js with GET endpoint
    - Export default async function handler(req, res)
    - Return { "status": "ok", "ts": current ISO timestamp }
    - _Requirements: 3.7_

- [ ] 5. Checkpoint - Verify API endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement validation utilities
  - [ ] 6.1 Create validation utility functions
    - Create normalizeAnswer() function: lowercase, remove non-alphanumeric (keep spaces)
    - Create containsEmoji() function: detect emoji presence in strings
    - Create validateSubmitRequest() function: check all fields, emoji presence
    - Export functions for use in API endpoints
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.2 Write unit tests for validation utilities
    - Test normalizeAnswer() with various inputs
    - Test containsEmoji() with emoji and non-emoji strings
    - Test validateSubmitRequest() with valid and invalid requests
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Integration and testing
  - [ ] 7.1 Test local development environment
    - Run `vercel dev` and verify server starts
    - Test `/api/health` endpoint returns valid response
    - Test `/api/puzzle` endpoint returns stub data
    - Test `/api/submit` with valid and invalid inputs
    - Verify frontend loads correctly at root path
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 7.2 Verify file structure completeness
    - Confirm all required files exist in correct locations
    - Verify configuration files follow specifications
    - Check TypeScript/ES Module configuration
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Final checkpoint - Complete validation gate
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from design
- Unit tests validate specific examples and edge cases
- TypeScript provides type safety for backend implementation
- Frontend uses vanilla JavaScript for simplicity and performance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1", "4.3", "4.5"] },
    { "id": 3, "tasks": ["4.2", "4.4", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1", "7.2"] }
  ]
}
```