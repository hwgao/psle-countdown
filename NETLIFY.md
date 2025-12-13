## Netlify deployment (Firebase config via env vars)

This site is static and expects `firebase-config.js` at runtime. For Netlify deploys from GitHub, `firebase-config.js` is generated during the build.

### 1) Set environment variables in Netlify

Netlify site dashboard → `Site configuration` → `Environment variables`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Values come from Firebase Console → Project settings → Your apps → SDK setup and configuration (Web app).

### 2) Build config

- `netlify.toml` runs `sh ./netlify-build.sh`
- `netlify-build.sh` writes `firebase-config.js` into the publish directory (`.`)

### 3) Local development

Create `firebase-config.js` locally by copying `firebase-config.example.js`. Do not commit `firebase-config.js` (it is ignored by `.gitignore`).

