#!/bin/sh
set -eu

# Generates `firebase-config.js` from Netlify environment variables.
# This keeps Firebase config out of the public repo while still letting the static site run.

cat > firebase-config.js <<EOF
window.firebaseConfig = {
    apiKey: '${FIREBASE_API_KEY}',
    authDomain: '${FIREBASE_AUTH_DOMAIN}',
    projectId: '${FIREBASE_PROJECT_ID}',
    storageBucket: '${FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${FIREBASE_APP_ID}'
};
EOF

# Build info (Netlify exposes COMMIT_REF)
commit_ref="${COMMIT_REF:-}"
commit_short="$(printf '%s' "$commit_ref" | cut -c1-7)"
if [ -z "$commit_short" ]; then
    commit_short="unknown"
fi

cat > build-info.js <<EOF
window.buildInfo = {
    commit: '${commit_short}'
};
EOF
