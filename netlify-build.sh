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
