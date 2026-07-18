#!/bin/sh
set -eu

if [ -n "${FIREBASE_ADMIN_CREDENTIALS_JSON:-}" ]; then
    printf '%s' "$FIREBASE_ADMIN_CREDENTIALS_JSON" > /run/secrets/firebase-adminsdk.json
    chmod 600 /run/secrets/firebase-adminsdk.json
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
