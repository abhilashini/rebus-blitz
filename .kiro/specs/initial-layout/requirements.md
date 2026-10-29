# Requirements Document

## Introduction

The Emoji Rebus Blitz Initial Layout establishes the foundational file structure and configuration for a single-player web puzzle game where players decode emoji rebus puzzles against a 30-second timer. This phase focuses on setting up the complete project skeleton before implementing game logic.

## Glossary

- **System**: The Emoji Rebus Blitz application consisting of frontend UI and backend API
- **Frontend**: Static HTML/CSS/JS interface served from `/public` directory
- **Backend**: Serverless API functions in `/api` directory running on Vercel
- **Validation_Engine**: Component responsible for validating and normalizing user inputs
- **PuzzleData**: Data structure containing emoji rebus and hint text
- **SubmitRequest**: User submission containing emoji string, answer, and hint
- **Normalization**: Process of converting answer strings to lowercase and removing special characters

## Requirements

### Requirement 1: Project Configuration

**User Story:** As a developer, I want properly configured project files, so that the application can run locally and deploy to Vercel.

#### Acceptance Criteria

1. THE package.json SHALL declare `"type": "module"` to enable ES Module syntax
2. THE package.json SHALL include `"@vercel/kv"` dependency for Redis integration
3. THE vercel.json SHALL route `/api/*` paths to serverless functions
4. THE vercel.json SHALL route all other paths to `public/index.html`
5. THE vercel.json SHALL specify Node.js 20.x runtime for API functions
6. THE .env.local SHALL provide placeholder variables for Vercel KV credentials

### Requirement 2: Frontend Structure

**User Story:** As a player, I want a clean, accessible interface, so that I can interact with the game intuitively.

#### Acceptance Criteria

1. WHEN the application loads THEN the Frontend SHALL display a semantic HTML5 structure with proper accessibility landmarks
2. THE Frontend SHALL include score display, puzzle display area, timer, and answer input form
3. THE Frontend SHALL include a crowdsourcing form for submitting new puzzles
4. WHEN the viewport width exceeds 768px THEN the Frontend SHALL display game panel and submit panel side-by-side
5. THE Frontend SHALL load `app.js` as an ES Module for JavaScript functionality

### Requirement 3: API Endpoints

**User Story:** As a frontend application, I want reliable API endpoints, so that I can fetch puzzles and submit answers.

#### Acceptance Criteria

1. WHEN receiving a GET request to `/api/puzzle` THEN the API SHALL return a PuzzleData object with emoji and hint fields
2. WHEN receiving a non-GET request to `/api/puzzle` THEN the API SHALL return 405 Method Not Allowed
3. WHEN receiving a POST request to `/api/submit` THEN the Validation_Engine SHALL validate the SubmitRequest
4. IF any required field is missing in SubmitRequest THEN the Validation_Engine SHALL return error "All fields are required."
5. IF emoji field contains no emoji characters THEN the Validation_Engine SHALL return error "Emoji field must contain at least one emoji."
6. WHEN validation succeeds THEN the Validation_Engine SHALL normalize the answer field to lowercase and remove non-alphanumeric characters
7. WHEN receiving a GET request to `/api/health` THEN the API SHALL return status "ok" with current timestamp

### Requirement 4: Input Validation

**User Story:** As a system administrator, I want robust input validation, so that the system maintains data integrity and prevents invalid submissions.

#### Acceptance Criteria

1. THE Validation_Engine SHALL reject SubmitRequests with empty emoji, answer, or hint fields
2. THE Validation_Engine SHALL detect emoji presence in text strings
3. THE Validation_Engine SHALL normalize answer strings by converting to lowercase
4. THE Validation_Engine SHALL remove non-alphanumeric characters from answer strings (except spaces)
5. THE Validation_Engine SHALL preserve alphanumeric content and spaces during normalization

### Requirement 5: File Structure

**User Story:** As a developer, I want a clear project structure, so that I can navigate and maintain the codebase efficiently.

#### Acceptance Criteria

1. THE project SHALL have `api/` directory containing health.js, puzzle.js, and submit.js
2. THE project SHALL have `public/` directory containing index.html, style.css, and app.js
3. THE project SHALL have root configuration files: package.json, vercel.json, .env.local
4. ALL configuration files SHALL follow the specifications in the design document

### Requirement 6: Development Environment

**User Story:** As a developer, I want a working local development environment, so that I can test changes before deployment.

#### Acceptance Criteria

1. WHEN running `vercel dev` THEN the System SHALL start local development server
2. WHEN accessing `/api/health` THEN the System SHALL return valid health response
3. WHEN accessing `/api/puzzle` THEN the System SHALL return stub puzzle data
4. WHEN submitting valid data to `/api/submit` THEN the System SHALL return success with normalized answer
5. WHEN accessing the root path THEN the System SHALL serve `public/index.html`