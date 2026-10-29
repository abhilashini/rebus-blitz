# Emoji Rebus Blitz — Project Steering

## Overview
This is the **Emoji Rebus Blitz** project. A rebus is a puzzle where words or phrases are represented by emojis. Players race against a ticking clock to decode them.

## Project Goals
- Build a fast, lightweight, and engaging single-player web puzzle game.
- Allow users to organically grow the game by submitting their own original emoji rebus puzzles.
- Keep the application structure hyper-lean for rapid loading.

## Tech Stack & Architecture
- **Frontend:** Single-page application using `public/index.html` (Vanilla JS / Modern CSS grid/flexbox layouts). No external frameworks.
- **Serverless API Backend:** Node.js (ES Modules) targeting Vercel Serverless Functions in the `/api` directory.
- **Persistence:** Vercel KV (Redis) to fetch puzzle arrays and push newly submitted user contributions.

## Game Mechanics & Logic Rules
1. **The Blitz Loop:** The game fetches a random emoji rebus string and a text hint from the backend. The player has a 30-second ticking countdown clock to type the answer.
2. **Scoring:** Correct answers add 100 points to the score and reset the clock for the next puzzle. Incorrect guesses do not stop the clock.
3. **Crowdsourcing Loop:** A visible secondary form allows players to input an Emoji String, the Correct Text Answer, and a Helpful Hint. Submitting sends a POST request to the backend, appending the new puzzle directly into the Vercel KV database.

## Constraints
- The LLM must not write application source code before drafting a structured specification file.
- Keep JSON data payload sizes minimal. Reject invalid submissions (empty strings, numbers-only) gracefully.
- All puzzle answers must be normalized to lowercase and stripped of special characters during validation.

## Build & Run
- Node.js runtime environment using standard package configurations.
- Dependencies: `@vercel/kv` for database integration.
- Run locally using standard web server tools or the Vercel CLI sandbox environment.

## Testing
- Manual UI and functional game-loop testing via local server hosting.
