# Emoji Rebus Blitz — Project Steering

## Overview
This is the **Emoji Rebus Blitz** project. A rebus is a puzzle where words or phrases are represented by emojis — players race to decode them.

## Project Goals
- (Fill in your goals here)

## Tech Stack & Architecture
- Single-page application: `public/index.html` (Vanilla JS / Modern CSS).
- Serverless API Backend: Node.js (ESM) targeting Vercel Serverless Functions.
- Persistence: Vercel KV (Redis) to fetch puzzles and submit user contributions.

## Constraints
- The LLM must not write code before drafting a structured specification file.
- Keep data payload sizes minimal. Reject invalid submissions gracefully.

## Conventions
- Use clear, descriptive names for files and functions.
- Keep components small and focused.
- Document non-obvious logic with inline comments.

## Build & Run
- (Fill in how to install dependencies, build, and run the project)

## Testing
- (Fill in how to run tests)
