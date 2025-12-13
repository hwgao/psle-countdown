#!/bin/sh
set -eu

# Local development helper:
# - optionally loads `.env`
# - generates `firebase-config.js` + `build-info.js`
# - starts a static server

if [ -f "./.env" ]; then
    set -a
    . "./.env"
    set +a
fi

if [ -z "${COMMIT_REF:-}" ]; then
    if command -v git >/dev/null 2>&1; then
        COMMIT_REF="$(git rev-parse HEAD 2>/dev/null || true)"
        export COMMIT_REF
    fi
fi

needs_firebase_config="0"
if [ ! -f "./firebase-config.js" ]; then
    needs_firebase_config="1"
fi

if [ "$needs_firebase_config" = "1" ]; then
    missing=""
    for name in FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_PROJECT_ID FIREBASE_STORAGE_BUCKET FIREBASE_MESSAGING_SENDER_ID FIREBASE_APP_ID; do
        eval "value=\${$name:-}"
        if [ -z "$value" ]; then
            missing="${missing} ${name}"
        fi
    done

    if [ -n "$missing" ]; then
        echo "Missing env vars:${missing}"
        echo "Create `firebase-config.js` manually (copy `firebase-config.example.js`) or create `.env` with the variables above."
        exit 1
    fi
fi

sh ./netlify-build.sh

PORT="${PORT:-8000}"
echo "Serving on http://localhost:${PORT}"
python3 -m http.server "${PORT}"

