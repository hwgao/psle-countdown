# Repository Guidelines

## Project Structure & Module Organization

- `index.html` contains the HTML markup and loads `styles.css` and `app.js` (vanilla JS).
- `styles.css` contains all CSS.
- `app.js` contains all client-side JavaScript (Firebase + app logic).
- There is no build system, bundler, or separate asset pipeline. Any new assets (images, icons) should be added as files at the repo root or under a new `assets/` folder and referenced relatively (e.g., `assets/logo.png`).
- Firebase Firestore is used for persistence; configuration lives in `app.js` under `firebaseConfig`.

## Build, Test, and Development Commands

- Run locally with a static server (recommended so Firebase/links behave consistently):
  - `python3 -m http.server 8000` then open `http://localhost:8000`
  - Alternative: `npx http-server . -p 8000`
- No “build” step exists; deploy by serving `index.html` (and any assets) as static files.

## Coding Style & Naming Conventions

- Keep changes minimal and avoid reformatting unrelated sections (single-file diffs get noisy).
- Indentation: 2 spaces; keep the current formatting style in HTML/CSS/JS.
- JavaScript:
  - Functions/variables: `camelCase` (e.g., `renderTodos`, `todoCount`)
  - Constants: `camelCase` as currently used (e.g., `examSchedule`)
  - Prefer single quotes in JS strings unless HTML attributes require double quotes.
- CSS classes: `kebab-case` (e.g., `.todo-item`, `.right-panel`).
- IDs: `camelCase` (e.g., `todoInput`, `subjectCountdowns`).

## Testing Guidelines

- No automated tests are currently configured.
- Before opening a PR, do a quick manual smoke test:
  - Countdown updates; upcoming exam display looks correct.
  - Add/toggle/delete tasks; refresh the page and confirm Firestore-backed persistence.
  - Calendar renders and task popup opens/closes.

## Commit & Pull Request Guidelines

- Commit subjects follow a simple prefix style: `Fix: …`, `Test: …`, `Initial commit: …`. Keep using `Fix:`, `Feat:`, `Chore:`, `Docs:`, `Test:` as appropriate.
- PRs should include:
  - A short description of the user-visible change.
  - Screenshots for UI changes (desktop + mobile if layout is affected).
  - Notes if Firestore schema/fields change (backward compatibility matters).

## Security & Configuration Tips

- Treat Firestore rules as the real security boundary. If you change read/write behavior, update rules in the Firebase console accordingly.
- Avoid introducing secrets into the repo. Firebase web config is typically public, but do not add private keys or service accounts.
