# Spec 001 — Initial Project Layout & Root Configuration

**Status:** Draft  
**Source:** Derived from `.kiro/steering/project.md`  
**Scope:** Establish the complete file skeleton — root configs, static frontend shell, and backend API routes — before any application logic is written.

---

## Context & Constraints

- **Runtime:** Node.js (ES Modules, `"type": "module"` in package.json)
- **Deployment target:** Vercel Serverless Functions (`/api` directory)
- **Persistence:** Vercel KV (Redis) via the `@vercel/kv` package
- **Frontend:** Zero-framework — a single `public/index.html` with inline or co-located Vanilla JS and Modern CSS
- **Rule:** No application source code is written until this spec is reviewed and approved

---

## Milestone Checklist

### Phase 1 — Root Configuration Files

- [ ] **1.1 — `package.json`**
  - Set `"name": "emoji-rebus-blitz"`
  - Set `"version": "0.1.0"`
  - Set `"type": "module"` to enable ES Module syntax across all Node files
  - Add `"scripts"`:
    - `"dev"` → `"vercel dev"` (local Vercel sandbox)
    - `"build"` → no-op (`"echo No build step"`) — static frontend, no bundler
    - `"start"` → `"vercel dev"`
  - Add `"dependencies"`:
    - `"@vercel/kv"` — pinned to latest stable (e.g. `"^3.0.0"`)
  - No dev dependencies required at this stage

- [ ] **1.2 — `vercel.json`**
  - Set `"version": 2`
  - Declare `"rewrites"` so all `/api/*` paths route to serverless functions and all other paths serve `public/index.html`:
    ```json
    {
      "version": 2,
      "rewrites": [
        { "source": "/api/(.*)", "destination": "/api/$1" },
        { "source": "/(.*)",     "destination": "/public/index.html" }
      ]
    }
    ```
  - Set `"functions"` block to target Node.js 20.x runtime for all `/api/*.js` handlers

- [ ] **1.3 — `.env.local` (gitignored placeholder)**
  - Create an empty `.env.local` with commented placeholders for Vercel KV credentials:
    ```
    # KV_REST_API_URL=
    # KV_REST_API_TOKEN=
    ```
  - Confirm `.env.local` is present in `.gitignore` (already covered by root `.gitignore`)

---

### Phase 2 — Static Frontend Shell

- [ ] **2.1 — `public/index.html` (semantic shell, no game logic yet)**
  - Standard HTML5 doctype, `lang="en"`, UTF-8 charset, viewport meta tag
  - `<title>Emoji Rebus Blitz 🎉</title>`
  - Link a co-located stylesheet: `<link rel="stylesheet" href="/style.css">`
  - Structural landmark regions (accessibility-first):
    - `<header>` — game title + current score display (`<span id="score">0</span>`)
    - `<main>` — two sections:
      - `#game-panel` — puzzle display area:
        - `<p id="puzzle">` — renders the emoji rebus string fetched from API
        - `<p id="hint">` — renders the hint text
        - `<div id="timer">30</div>` — countdown display (seconds remaining)
        - `<form id="answer-form">` — text input + submit button for player's guess
        - `<p id="feedback" aria-live="polite">` — inline correct/incorrect feedback (ARIA live region)
      - `#submit-panel` — crowdsourcing contribution form:
        - `<form id="submit-form">` with three labeled inputs:
          - Emoji String (`<input id="emoji-input">`)
          - Correct Answer (`<input id="answer-input">`)
          - Helpful Hint (`<input id="hint-input">`)
        - Submit button
        - `<p id="submit-feedback" aria-live="polite">` — submission success/error message
    - `<footer>` — attribution / version text
  - Script tag at bottom of `<body>`: `<script type="module" src="/app.js"></script>`

- [ ] **2.2 — `public/style.css` (layout skeleton, no visual polish yet)**
  - CSS custom properties (`:root`) for color tokens and spacing scale
  - CSS Grid layout for `<body>` placing header / main / footer in a column
  - Flexbox inside `<main>` to stack `#game-panel` and `#submit-panel` vertically on mobile, side-by-side on wider viewports (`@media (min-width: 768px)`)
  - Basic accessible focus ring styles (`outline` on `:focus-visible`)
  - No colors, gradients, or decorative styles at this phase — layout structure only

- [ ] **2.3 — `public/app.js` (stub module, no logic)**
  - Single ES Module file
  - Export a placeholder `init()` function that logs `"Emoji Rebus Blitz — ready"` to the console
  - Call `init()` at the bottom of the file
  - No API calls or game logic yet — those belong in Phase 3+

---

### Phase 3 — Backend API Route Stubs

Each file below is a Vercel Serverless Function. At this phase they return valid JSON stubs with `200 OK` — no real KV logic yet.

- [ ] **3.1 — `api/puzzle.js` — `GET /api/puzzle`**
  - Handler signature: `export default async function handler(req, res)`
  - Accept only `GET`; return `405 Method Not Allowed` for all others
  - Return a hardcoded stub payload:
    ```json
    { "emoji": "🌊🏄‍♂️", "hint": "Something surfers do" }
    ```
  - Sets `Content-Type: application/json`

- [ ] **3.2 — `api/submit.js` — `POST /api/submit`**
  - Accept only `POST`; return `405` for all others
  - Parse JSON body; read `emoji`, `answer`, `hint` fields
  - **Input validation rules** (from steering doc constraints):
    - Reject if any field is missing or empty string → `400 Bad Request` with `{ "error": "All fields are required." }`
    - Reject if `emoji` contains no emoji characters (numbers-only or plain text) → `400` with `{ "error": "Emoji field must contain at least one emoji." }`
    - Normalize `answer` to lowercase, strip non-alphanumeric characters (spaces allowed)
  - At this stub phase: log validated payload to console, return the normalized answer in the response payload:
    ```json
    { "success": true, "message": "Puzzle received (stub).", "normalizedAnswer": "<normalized answer string>" }
    ```
    e.g. input `"Spider-Man!"` → response includes `"normalizedAnswer": "spiderman"`
  - KV write logic is deferred to Spec 002

- [ ] **3.3 — `api/health.js` — `GET /api/health`**
  - Lightweight liveness check endpoint
  - Returns `{ "status": "ok", "ts": "<ISO timestamp>" }`
  - Used during local dev to verify the Vercel sandbox is running correctly

---

### Phase 4 — Validation Gate

Before any Phase 3+ (real KV integration, game logic) work begins:

- [ ] **4.1** Run `vercel dev` locally and confirm all three API stub routes respond correctly via `curl` or browser
- [ ] **4.2** Open `public/index.html` in a browser and confirm the layout renders with no console errors
- [ ] **4.3** Confirm `public/app.js` logs `"Emoji Rebus Blitz — ready"` in the browser console
- [ ] **4.4** Confirm `POST /api/submit` returns `400` when sent an empty body
- [ ] **4.5** Review and approve this spec before proceeding to Spec 002 (KV integration + live game loop)
- [ ] **4.6** Confirm `POST /api/submit` correctly strips special characters and normalizes casing: hit the endpoint with input `"Spider-Man!"` as the answer and verify the JSON response returns `"normalizedAnswer": "spiderman"`

---

## File Tree After This Spec Is Complete

```
emoji-rebus-blitz/
├── .env.local                  ← gitignored KV credential placeholders
├── .gitignore
├── package.json                ← ESM, @vercel/kv dep, vercel dev scripts
├── README.md
├── vercel.json                 ← routing + Node 20.x runtime config
├── api/
│   ├── health.js               ← GET  /api/health
│   ├── puzzle.js               ← GET  /api/puzzle
│   └── submit.js               ← POST /api/submit
├── public/
│   ├── index.html              ← semantic HTML shell
│   ├── style.css               ← grid/flex layout skeleton
│   └── app.js                  ← ES module stub
└── .kiro/
    ├── steering/
    │   └── project.md
    ├── specs/
    │   └── 001_initial_layout.md   ← this file
    └── hooks/
```

---

## Next Spec

**Spec 002 — KV Integration & Live Game Loop**  
Will cover: connecting `api/puzzle.js` to Vercel KV, seeding an initial puzzle dataset, wiring up the 30-second countdown in `app.js`, score tracking, and the full crowdsourcing submit flow.

**Survival Game Loop rules Spec 002 must implement:**
- **Correct answer** → add 100 points to score and reset the countdown clock to 30 seconds for the next puzzle
- **Incorrect answer** → deduct 5 seconds from the remaining countdown (clock continues ticking; it does not reset)
- **Game Over** → triggered immediately and unconditionally when the timer strikes 0, regardless of whether the player is mid-input; display a Game Over state with the final score and a restart option
