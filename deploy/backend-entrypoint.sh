#!/bin/sh
set -eu

if [ -n "${FIREBASE_ADMIN_CREDENTIALS_JSON:-}" ]; then
    printf '%s' "$FIREBASE_ADMIN_CREDENTIALS_JSON" > /run/secrets/firebase-adminsdk.json
    chmod 600 /run/secrets/firebase-adminsdk.json

    echo "=== Verification du fichier Firebase Admin ==="
    echo "Taille du fichier : $(wc -c < /run/secrets/firebase-adminsdk.json) caracteres"
    echo "Premiers caracteres : $(head -c 30 /run/secrets/firebase-adminsdk.json)"
    echo "Derniers caracteres : $(tail -c 30 /run/secrets/firebase-adminsdk.json)"
    if python -c "import json,sys; json.load(open('/run/secrets/firebase-adminsdk.json'))" 2>/tmp/firebase_json_error.txt; then
        echo "=== OK : le JSON Firebase Admin est valide ==="
    else
        echo "=== ERREUR : le JSON Firebase Admin est INVALIDE ==="
        cat /tmp/firebase_json_error.txt
        echo "=== Corrigez la variable FIREBASE_ADMIN_CREDENTIALS_JSON dans Dokploy et redeployez ==="
    fi
else
    echo "=== ATTENTION : FIREBASE_ADMIN_CREDENTIALS_JSON est vide ou absente ==="
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
